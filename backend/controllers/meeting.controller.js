import Meeting from "../models/meeting.model.js";
import Room from "../models/room.model.js";
import { logRecentActivity } from "../utils/logRecentActivity.js";

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

    await logRecentActivity(req, "CREATE_MEETING", "Meeting", `Scheduled meeting: ${title}`, {
      meetingId: newMeeting._id,
    });

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

    const meetings = await Meeting.find(query)
      .populate("host", "firstName middleName lastName email profileImage")
      .populate("participants", "firstName middleName lastName email profileImage")
      .populate("roomId", "name capacity")
      .sort({ startTime: 1 });

    res.status(200).json(meetings);
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

      await logRecentActivity(req, "UPDATE_MEETING", "Meeting", `Updated meeting: ${updatedMeeting.title}`, {
        newMeeting: updatedMeeting,
        previousMeeting: existingMeeting,
      });

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

    const meeting = await Meeting.findOneAndUpdate(
      { _id: id, organizationId },
      { status: "Cancelled" },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    await logRecentActivity(req, "CANCEL_MEETING", "Meeting", `Cancelled meeting: ${meeting.title}`, {
      meetingId: meeting._id,
    });

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

    const meeting = await Meeting.findOneAndDelete({ _id: id, organizationId });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json({ message: "Meeting deleted permanently" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
