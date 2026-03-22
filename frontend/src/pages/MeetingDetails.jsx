import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Menu,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Link2,
  Loader2,
  Building2,
} from "lucide-react";
import Sidebar from "@/components/Layout/Sidebar";
import axios from "axios";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";

const MeetingDetails = () => {
  const { toggleNotificationPanel, notifications } = useNotifications();
  const { id: meetingId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchMeeting = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/meeting/${meetingId}`,
          { withCredentials: true }
        );
        if (!cancelled) setMeeting(res.data);
      } catch (err) {
        console.error("Error fetching meeting:", err);
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "This meeting was not found or you do not have access."
              : "Could not load meeting details."
          );
          setMeeting(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (meetingId) fetchMeeting();
    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  const formatDt = (d) => {
    if (!d) return "—";
    try {
      const date = typeof d === "string" ? parseISO(d) : new Date(d);
      return format(date, "PPpp");
    } catch {
      return "—";
    }
  };

  const fullName = (u) =>
    u
      ? [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ").trim() ||
        u.email
      : "—";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading meeting…</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen bg-background font-sans text-foreground">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-card border-b border-border h-16 flex items-center px-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/meetings")}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={18} /> Back to meetings
            </button>
          </header>
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <p className="text-foreground mb-4">{error || "Meeting not found."}</p>
              <Button onClick={() => navigate("/meetings")}>Return to calendar</Button>
            </div>
          </main>
        </div>
        <NotificationPanel />
      </div>
    );
  }

  const room = meeting.roomId;
  const isVirtual = meeting.meetingType === "Virtual";

  const getStatusStyle = (status) => {
    switch (status) {
      case "Scheduled": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Completed": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg shrink-0"
            >
              <Menu size={24} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/meetings")}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group shrink-0"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back
            </button>
          </div>
          <button
            type="button"
            onClick={toggleNotificationPanel}
            className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors shrink-0"
          >
            <Bell size={22} />
            {notifications?.length > 0 && (
              <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card" />
            )}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusStyle(meeting.status)}`}
              >
                {meeting.status}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-3 tracking-tight">
                {meeting.title}
              </h1>
              {meeting.description ? (
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                  {meeting.description}
                </p>
              ) : null}
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
              <div className="p-4 sm:p-5 flex items-start gap-3">
                <Calendar className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Schedule
                  </p>
                  <p className="text-foreground font-medium mt-1">
                    {formatDt(meeting.startTime)} → {formatDt(meeting.endTime)}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-start gap-3">
                <Video className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Type
                  </p>
                  <p className="text-foreground font-medium mt-1">
                    {meeting.meetingType}
                  </p>
                </div>
              </div>

              {!isVirtual && room && (
                <div className="p-4 sm:p-5 flex items-start gap-3">
                  <MapPin className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Room
                    </p>
                    <p className="text-foreground font-medium mt-1">
                      {room.name}
                      {room.capacity != null ? ` · ${room.capacity} seats` : ""}
                      {room.floor ? ` · Floor ${room.floor}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {(isVirtual || meeting.meetingType === "Hybrid") &&
                meeting.virtualLink && (
                  <div className="p-4 sm:p-5 flex items-start gap-3">
                    <Link2 className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Link
                      </p>
                      <a
                        href={meeting.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all mt-1 inline-block"
                      >
                        {meeting.virtualLink}
                      </a>
                    </div>
                  </div>
                )}

              <div className="p-4 sm:p-5 flex items-start gap-3">
                <Users className="text-muted-foreground shrink-0 mt-0.5" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Host
                  </p>
                  <p className="text-foreground font-medium mt-1">
                    {meeting.host ? fullName(meeting.host) : "—"}
                  </p>
                </div>
              </div>

              {meeting.participants?.length > 0 && (
                <div className="p-4 sm:p-5 flex items-start gap-3">
                  <Building2 className="text-muted-foreground shrink-0 mt-0.5" size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Participants
                    </p>
                    <ul className="mt-2 space-y-1">
                      {meeting.participants.map((p) => (
                        <li key={p._id} className="text-foreground text-sm">
                          {fullName(p)}
                          {p.email ? (
                            <span className="text-muted-foreground"> · {p.email}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/meetings")}>
                <Clock className="mr-2 h-4 w-4" />
                All meetings
              </Button>
            </div>
          </div>
        </main>
      </div>

      <NotificationPanel />
    </div>
  );
};

export default MeetingDetails;
