import Meeting from "../models/meeting.model.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import Role from "../models/Role.model.js";
import { logRecentActivity } from "../utils/logRecentActivity.js";
import { google } from "googleapis";
import { sendMeetingNotificationEmail } from "../utils/sendGrid.mail.js";
import mongoose from "mongoose";

const hasPermission = async (roleId, permissionName) => {
  const role = await Role.findById(roleId).populate("permissions", "name").lean();
  if (!role?.permissions?.length) return false;
  return role.permissions.some((permission) => permission.name === permissionName);
};

const canManageMeeting = async (reqUser, meeting, permissionName) => {
  if (!reqUser || !meeting) return false;
  if (meeting.host?.toString() === reqUser._id.toString()) return true;
  return hasPermission(reqUser.role, permissionName);
};

const buildMeetingNotificationPayload = (meeting, subjectPrefix) => {
  const joinUrl = meeting.virtualLink || `${process.env.FRONTEND_URL}/meeting/${meeting._id}`;
  return {
    type: "meeting",
    title: subjectPrefix,
    message: `${meeting.title} • ${new Date(meeting.startTime).toLocaleString()}`,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    details: {
      priority: "Medium",
      title: meeting.title,
      department: meeting.meetingType,
      meetingId: meeting._id.toString(),
      joinUrl,
      meetingType: meeting.meetingType,
    },
  };
};

const notifyParticipants = async (req, meeting, subjectPrefix = "Meeting Scheduled") => {
  try {
    const participantIds = (meeting.participants || []).map((id) => id.toString());
    if (!participantIds.length) return;

    const participants = await User.find(
      { _id: { $in: participantIds }, organizationId: meeting.organizationId },
      "firstName lastName email"
    ).lean();
    const io = req.app.get("io");
    const payload = buildMeetingNotificationPayload(meeting, subjectPrefix);
    const meetingDetailsUrl = `${process.env.FRONTEND_URL}/meeting/${meeting._id}`;
    const host = await User.findById(meeting.host, "firstName lastName").lean();
    const hostName = host ? `${host.firstName} ${host.lastName}`.trim() : "Meeting host";

    await Promise.all(
      participants.map(async (participant) => {
        io?.to(participant._id.toString()).emit("meetingNotification", payload);
        await sendMeetingNotificationEmail({
          recipientEmail: participant.email,
          recipientName: `${participant.firstName || ""} ${participant.lastName || ""}`.trim(),
          subjectPrefix,
          meetingTitle: meeting.title,
          meetingType: meeting.meetingType,
          startTime: new Date(meeting.startTime).toLocaleString(),
          endTime: new Date(meeting.endTime).toLocaleString(),
          description: meeting.description,
          roomName: meeting.roomId?.name,
          virtualLink: meeting.virtualLink,
          meetingDetailsUrl,
          hostName,
        });
      })
    );
  } catch (error) {
    console.error("Failed sending participant notifications:", error);
  }
};

const checkRoomConflict = async (
  roomId,
  startTime,
  endTime,
  organizationId,
  excludeMeetingId = null
) => {
  const query = {
    organizationId,
    roomId,
    status: "Scheduled",
    $or: [
      { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
      { startTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
      {
        startTime: { $lte: new Date(startTime) },
        endTime: { $gte: new Date(endTime) },
      },
    ],
  };

  if (excludeMeetingId) {
    query._id = { $ne: excludeMeetingId };
  }

  const conflict = await Meeting.findOne(query);
  return conflict;
};

export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      participants,
      meetingType,
      roomId,
      virtualLink,
      startTime,
      endTime,
    } = req.body;

    const { organizationId } = req.user;
    const hostId = req.user._id;

    if (new Date(startTime) >= new Date(endTime)) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    if (meetingType === "In-Person" || meetingType === "Hybrid") {
      if (!roomId) {
        return res
          .status(400)
          .json({ message: "Room ID is required for In-Person meetings." });
      }

      const roomExists = await Room.findOne({ _id: roomId, organizationId });
      if (!roomExists) {
        return res
          .status(404)
          .json({ message: "Room not found or unauthorized." });
      }

      const hasConflict = await checkRoomConflict(
        roomId,
        startTime,
        endTime,
        organizationId
      );
      if (hasConflict) {
        return res.status(409).json({
          message: "Room is already booked for this time slot.",
          conflictDetails: {
            title: hasConflict.title,
            startTime: hasConflict.startTime,
            endTime: hasConflict.endTime,
          },
        });
      }
    }

    const newMeeting = new Meeting({
      organizationId,
      title,
      description,
      host: hostId,
      participants: participants || [],
      meetingType,
      roomId: meetingType === "Virtual" ? null : roomId,
      virtualLink: meetingType === "In-Person" ? null : virtualLink,
      startTime,
      endTime,
      status: "Scheduled",
    });

    await newMeeting.save();

    if (req.user.googleTokens) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(req.user.googleTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const event = {
          summary: title,
          description: description,
          start: { dateTime: new Date(startTime).toISOString() },
          end: { dateTime: new Date(endTime).toISOString() }
        };

        if ((meetingType === "Virtual" || meetingType === "Hybrid") && req.body.generateMeetLink) {
          event.conferenceData = {
            createRequest: {
              requestId: newMeeting._id.toString(),
              conferenceSolutionKey: { type: "hangoutsMeet" }
            }
          };
        }

        const createdEvent = await calendar.events.insert({
          calendarId: "primary",
          conferenceDataVersion: 1,
          resource: event,
        });

        newMeeting.googleEventId = createdEvent.data.id;
        if ((meetingType === "Virtual" || meetingType === "Hybrid") && createdEvent.data.hangoutLink) {
          newMeeting.virtualLink = createdEvent.data.hangoutLink;
        }

        await newMeeting.save();
      } catch (err) {
        console.error("Failed to sync new meeting to Google Calendar:", err);
      }
    }

    await logRecentActivity(req, "CREATE_MEETING", "Meeting", `Scheduled meeting: ${title}`, {
      meetingId: newMeeting._id,
    });

    await notifyParticipants(req, newMeeting, "Meeting Scheduled");

    res.status(201).json({
      message: "Meeting scheduled successfully",
      meeting: newMeeting,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    if (id.startsWith("gcal-")) {
      if (!req.user.googleTokens) {
        return res.status(404).json({ message: "Google event not found." });
      }
      try {
        const googleEventId = id.replace("gcal-", "");
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(req.user.googleTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const eventRes = await calendar.events.get({
          calendarId: "primary",
          eventId: googleEventId,
        });
        const event = eventRes.data;

        return res.status(200).json({
          _id: `gcal-${event.id}`,
          title: event.summary || "Busy",
          startTime: event.start?.dateTime || event.start?.date,
          endTime: event.end?.dateTime || event.end?.date,
          description: event.description || "Google Calendar Event",
          meetingType: "Virtual",
          virtualLink: event.hangoutLink || event.htmlLink || "",
          status: "Scheduled",
          host: { firstName: "Google", lastName: "Calendar" },
          participants: [],
          roomId: null,
          isGoogleEvent: true,
        });
      } catch (error) {
        console.error("Error fetching Google event by ID:", error);
        return res.status(404).json({ message: "Google event not found." });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid meeting id." });
    }

    const meeting = await Meeting.findOne({ _id: id, organizationId })
      .populate("host", "firstName middleName lastName email profileImage")
      .populate("participants", "firstName middleName lastName email profileImage")
      .populate("roomId", "name capacity floor amenities");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found." });
    }

    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { date, view, startDate, endDate } = req.query;

    let query = { organizationId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    } 
    else if (startDate && endDate) {
       query.startTime = { 
           $gte: new Date(startDate), 
           $lte: new Date(endDate) 
       };
    }
    else if (view === 'upcoming') {
        query.startTime = { $gte: new Date() };
        query.status = "Scheduled";
    }

    const localMeetings = await Meeting.find(query)
      .populate("host", "firstName middleName lastName email profileImage")
      .populate("participants", "firstName middleName lastName email profileImage")
      .populate("roomId", "name capacity")
      .sort({ startTime: 1 });

    let googleEvents = [];
    if (req.user.googleTokens) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(req.user.googleTokens);

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        
        let timeMin = new Date().toISOString();
        let timeMax = undefined;
        
        if (date) {
          const start = new Date(date); start.setHours(0,0,0,0);
          const end = new Date(date); end.setHours(23,59,59,999);
          timeMin = start.toISOString();
          timeMax = end.toISOString();
        } else if (startDate && endDate) {
          timeMin = new Date(startDate).toISOString();
          timeMax = new Date(endDate).toISOString();
        }

        const eventsRes = await calendar.events.list({
          calendarId: 'primary',
          timeMin: timeMin,
          ...(timeMax && { timeMax }),
          singleEvents: true,
          orderBy: 'startTime',
        });

        googleEvents = eventsRes.data.items
          .filter(event => !localMeetings.some(m => m.googleEventId === event.id))
          .map(event => ({
             _id: "gcal-" + event.id,
             title: event.summary || "Busy",
             startTime: event.start.dateTime || event.start.date,
             endTime: event.end.dateTime || event.end.date,
             description: event.description || "Google Calendar Event",
             meetingType: "Virtual",
             virtualLink: event.htmlLink || "",
             status: "Scheduled",
             host: { firstName: "Google", lastName: "Calendar" },
             isGoogleEvent: true,
          }));
      } catch (err) {
        console.error("Error fetching Google Calendar events:", err);
      }
    }

    const allMeetings = [...localMeetings, ...googleEvents].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.status(200).json(allMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const updates = req.body;

    const existingMeeting = await Meeting.findOne({ _id: id, organizationId });
    if (!existingMeeting) {
      return res.status(404).json({ message: "Meeting not found." });
    }
    const canUpdate = await canManageMeeting(req.user, existingMeeting, "update:meeting");
    if (!canUpdate) {
      return res.status(403).json({
        message: "Only meeting host or users with meeting update permission can update this meeting.",
      });
    }

    // If changing Time or Room, Re-Check Conflicts
    if (updates.startTime || updates.endTime || updates.roomId) {
      const newStart = updates.startTime || existingMeeting.startTime;
      const newEnd = updates.endTime || existingMeeting.endTime;
      const newRoom = updates.roomId || existingMeeting.roomId;
      const newType = updates.meetingType || existingMeeting.meetingType;

      if (new Date(newStart) >= new Date(newEnd)) {
        return res
          .status(400)
          .json({ message: "End time must be after start time." });
      }

      // Conflict Check (only if using a room)
      if (newType !== "Virtual" && newRoom) {
        const hasConflict = await checkRoomConflict(
          newRoom,
          newStart,
          newEnd,
          organizationId,
          id
        );
        if (hasConflict) {
          return res.status(409).json({
            message: "Room is already booked for this new time slot.",
          });
        }
      }
    }

    const updatedMeeting = await Meeting.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: updates },
      { new: true }
    )
      .populate("host", "firstName middleName lastName")
      .populate("roomId", "name");

      if (req.user.googleTokens && updatedMeeting.googleEventId) {
        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );
          oauth2Client.setCredentials(req.user.googleTokens);
          const calendar = google.calendar({ version: "v3", auth: oauth2Client });

          const event = {
            summary: updatedMeeting.title,
            description: updatedMeeting.description,
            start: { dateTime: new Date(updatedMeeting.startTime).toISOString() },
            end: { dateTime: new Date(updatedMeeting.endTime).toISOString() },
          };

          await calendar.events.update({
            calendarId: "primary",
            eventId: updatedMeeting.googleEventId,
            resource: event,
          });
        } catch (err) {
          console.error("Failed to sync meeting update to Google Calendar:", err);
        }
      }

      await logRecentActivity(req, "UPDATE_MEETING", "Meeting", `Updated meeting: ${updatedMeeting.title}`, {
        newMeeting: updatedMeeting,
        previousMeeting: existingMeeting,
      });
      await notifyParticipants(req, updatedMeeting, "Meeting Updated");

    res
      .status(200)
      .json({ message: "Meeting updated", meeting: updatedMeeting });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const existingMeeting = await Meeting.findOne({ _id: id, organizationId });
    if (!existingMeeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    const canCancel = await canManageMeeting(req.user, existingMeeting, "update:meeting");
    if (!canCancel) {
      return res.status(403).json({
        message: "Only meeting host or users with meeting update permission can cancel this meeting.",
      });
    }
    const meeting = await Meeting.findOneAndUpdate({ _id: id, organizationId }, { status: "Cancelled" }, { new: true });

    if (req.user.googleTokens && meeting.googleEventId) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(req.user.googleTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        await calendar.events.delete({
           calendarId: "primary",
           eventId: meeting.googleEventId
        });
      } catch (err) {
        console.error("Failed to delete meeting from Google Calendar:", err);
      }
    }

    await logRecentActivity(req, "CANCEL_MEETING", "Meeting", `Cancelled meeting: ${meeting.title}`, {
      meetingId: meeting._id,
    });
    await notifyParticipants(req, meeting, "Meeting Cancelled");

    res
      .status(200)
      .json({ message: "Meeting cancelled successfully", meeting });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const existingMeeting = await Meeting.findOne({ _id: id, organizationId });
    if (!existingMeeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    const canDelete = await canManageMeeting(req.user, existingMeeting, "delete:meeting");
    if (!canDelete) {
      return res.status(403).json({
        message: "Only meeting host or users with meeting delete permission can delete this meeting.",
      });
    }
    const meeting = await Meeting.findOneAndDelete({ _id: id, organizationId });

    if (req.user.googleTokens && meeting.googleEventId) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(req.user.googleTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        await calendar.events.delete({
           calendarId: "primary",
           eventId: meeting.googleEventId
        });
      } catch (err) {
        console.error("Failed to delete meeting from Google Calendar:", err);
      }
    }
    await notifyParticipants(req, existingMeeting, "Meeting Deleted");

    res.status(200).json({ message: "Meeting deleted permanently" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
