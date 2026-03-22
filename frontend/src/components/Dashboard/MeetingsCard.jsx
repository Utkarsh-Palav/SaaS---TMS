import React, { useEffect, useState } from "react";
import { Calendar, Clock, Video, MapPin, Plus, ArrowRight } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

const MeetingsCard = () => {
  const user = useAuth();

  const [todayMeetings, setTodayMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const getTodayMeetings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/meeting?startDate=${todayStart.toISOString()}&endDate=${todayEnd.toISOString()}`,
        { withCredentials: true }
      );
      setTodayMeetings(res.data);
    } catch (error) {
      console.error("Error fetching meetings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodayMeetings();
  }, []);

  const getInitials = (first, last) => {
    const f = first ? first.charAt(0) : "";
    const l = last ? last.charAt(0) : "";
    return (f + l).toUpperCase() || "?";
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Today's Schedule
          </h2>
          <p className="text-xs font-medium text-muted-foreground mt-1">
            {todayMeetings.length} sessions scheduled
          </p>
        </div>
        <Link to="/meetings">
          <button className="p-2 hover:bg-accent hover:shadow-sm rounded-lg text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-border">
            <ArrowRight size={18} />
          </button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-4 rounded" />
                  <Skeleton className="w-1/2 h-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : todayMeetings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3 border border-border">
              <Calendar className="text-muted-foreground" size={32} />
            </div>
            <p className="text-foreground font-medium">No meetings today</p>
            <p className="text-muted-foreground text-xs mb-4 max-w-[200px]">
              Your schedule is clear. Enjoy your focus time!
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[59px] top-4 bottom-4 w-0.5 bg-border"></div>

            <div className="space-y-6">
              {todayMeetings.map((meeting) => (
                <div key={meeting._id} className="relative flex group">
                  {/* Time Column */}
                  <div className="flex flex-col items-end mr-4 w-[45px] shrink-0">
                    <span className="text-xs font-bold text-foreground">
                      {new Date(meeting.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {new Date(meeting.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </div>

                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-[55px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card shadow-sm z-10 ${
                      meeting.status === "Completed"
                        ? "bg-muted-foreground"
                        : "bg-primary"
                    }`}
                  ></div>

                  {/* Card */}
                  <div className="flex-1 bg-card border border-border rounded-xl p-3 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group-hover:translate-x-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-bold text-foreground line-clamp-1">
                        {meeting.title}
                      </h3>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                          meeting.meetingType === "Virtual"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {meeting.meetingType === "Virtual" ? "Zoom" : "Room"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      {meeting.meetingType === "Virtual" ? (
                        <Video size={12} />
                      ) : (
                        <MapPin size={12} />
                      )}
                      <span className="truncate max-w-[140px]">
                        {meeting.meetingType === "Virtual"
                          ? "Online Meeting"
                          : meeting.roomId?.name || "Conference Room"}
                      </span>
                    </div>

                    {/* Footer: Avatars + Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex -space-x-1.5">
                        {meeting.participants &&
                          meeting.participants.slice(0, 3).map((p, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-muted border border-card flex items-center justify-center text-[8px] font-bold text-muted-foreground cursor-help"
                              title={`${p.firstName} ${p.lastName}`}
                            >
                              {p.profileImage ? (
                                <img
                                  src={p.profileImage}
                                  alt={p.firstName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                getInitials(p.firstName, p.lastName)
                              )}
                            </div>
                          ))}
                        {(meeting.participants?.length || 0) > 3 && (
                          <div className="w-6 h-6 rounded-full bg-muted border border-card flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                            +{meeting.participants.length - 3}
                          </div>
                        )}
                      </div>

                      {meeting.meetingType === "Virtual" && (
                        <button className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-md hover:bg-primary/90 transition-colors shadow-sm">
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {user.role !== "Boss" || user.role !== "Manager" ? (
        <div className="p-4 border-t border-border">
          <Link to="/meetings">
            <button className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-muted border border-border shadow-sm text-xs font-bold uppercase tracking-wider rounded-xl text-muted-foreground hover:bg-accent hover:text-primary transition-all">
              <Plus size={16} /> Schedule New
            </button>
          </Link>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default MeetingsCard;
