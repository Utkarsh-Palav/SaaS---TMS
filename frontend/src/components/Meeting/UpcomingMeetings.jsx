import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";

const UpcomingMeetings = ({ listView = false, allMeetings }) => {
  const getUpcoming = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return (Array.isArray(allMeetings) ? allMeetings : []).filter(
      (m) => new Date(m.startTime) >= now
    );
  };

  const upcoming = getUpcoming();
  console.log("Upcoming Meetings:", upcoming);
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  if (listView) {
    return (
      <div className="bg-card w-full rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/50">
          <h3 className="font-bold text-foreground">All Upcoming</h3>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
            {upcoming.length}
          </span>
        </div>
        <div className="divide-y divide-border">
          {upcoming.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No upcoming meetings found.
            </div>
          ) : (
            upcoming.map((meeting) => (
              <div
                key={meeting._id}
                className="p-4 hover:bg-accent/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
                    <span className="text-xs font-bold uppercase">
                      {new Date(meeting.startTime).toLocaleString("default", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {new Date(meeting.startTime).getDate()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                      {meeting.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatTime(meeting.startTime)} -{" "}
                        {formatTime(meeting.endTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        {meeting.meetingType === "Virtual" ? (
                          <Video size={12} />
                        ) : (
                          <MapPin size={12} />
                        )}
                        {meeting.meetingType === "Virtual"
                          ? "Online"
                          : meeting.roomId?.name || "Room"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2">
                    {meeting.participants.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground"
                        title={p.firstName}
                      >
                        {p.profileImage ? (
                          <img
                            src={p.profileImage}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs_aMoCDAkVZluRbcd0H1DA9exUnhbXNlzgA&s"
                            className="w-full h-full rounded-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {meeting.participants.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        +{meeting.participants.length - 3}
                      </div>
                    )}
                  </div>
                  {meeting.meetingType === "Virtual" ||
                  meeting.meetingType === "Hybrid" ? (
                    <Link
                      to={meeting.virtualLink}
                      target="_blank"
                    >
                      <button className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                        Join
                      </button>
                    </Link>
                  ) : (
                    <Link to={`/meetings/${meeting._id}`} className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Widget View (Cards)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Calendar className="text-primary" size={20} /> Upcoming
        </h2>
        <button className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid gap-4">
        {upcoming.length === 0 ? (
          <div className="p-6 bg-card rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm">
            No meetings scheduled.
          </div>
        ) : (
          upcoming.slice(0, 3).map((meeting) => (
            <div
              key={meeting._id}
              className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {meeting.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" />{" "}
                    {formatDate(meeting.startTime)} •{" "}
                    {formatTime(meeting.startTime)} -{" "}
                    {formatTime(meeting.endTime)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                    meeting.meetingType === "Virtual"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {meeting.meetingType}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex -space-x-2">
                  {meeting.participants.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground"
                      title={p.firstName}
                    >
                      {p.profileImage ? (
                        <img
                          src={p.profileImage}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs_aMoCDAkVZluRbcd0H1DA9exUnhbXNlzgA&s"
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {meeting.participants.length > 3 && (
                    <div className="flex items-center justify-center text-xs font-bold text-muted-foreground ml-3">
                      +{meeting.participants.length - 3} more
                    </div>
                  )}
                </div>
                <button className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingMeetings;
