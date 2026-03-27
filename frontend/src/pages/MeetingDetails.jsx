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
  Plus,
  Trash2,
  XCircle,
  Edit,
} from "lucide-react";
import Sidebar from "@/components/Layout/Sidebar";
import axios from "axios";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MeetingDetails = () => {
  const { user } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();
  const { id: meetingId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Management State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    participants: [],
    meetingType: "Virtual",
    roomId: "",
    virtualLink: "",
    generateMeetLink: false,
    startTime: "",
    endTime: "",
  });

  const fetchFormDependencies = async () => {
    try {
      const [empRes, roomRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/employee/all-employee`, {
          withCredentials: true,
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/room`, {
          withCredentials: true,
        }),
      ]);
      setEmployees(empRes.data.employees || empRes.data || []);
      setRooms(roomRes.data || []);
    } catch (error) {
      console.error("Failed to load dependencies", error);
    }
  };

  useEffect(() => {
    if (isEditOpen && employees.length === 0) fetchFormDependencies();
  }, [isEditOpen]);

  const handleEditClick = () => {
    setFormData({
      title: meeting.title,
      description: meeting.description || "",
      participants: (meeting.participants || []).map((p) => p._id),
      meetingType: meeting.meetingType,
      roomId: meeting.roomId?._id || "",
      virtualLink: meeting.virtualLink || "",
      generateMeetLink: false,
      startTime: meeting.startTime ? new Date(meeting.startTime).toISOString().slice(0, 16) : "",
      endTime: meeting.endTime ? new Date(meeting.endTime).toISOString().slice(0, 16) : "",
    });
    setIsEditOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleParticipantToggle = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.participants.includes(userId);
      return {
        ...prev,
        participants: isSelected
          ? prev.participants.filter((id) => id !== userId)
          : [...prev.participants, userId],
      };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      return toast.error("End time must be after start time");
    }
    setUpdating(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/meeting/${meetingId}`, formData, { withCredentials: true });
      toast.success("Meeting updated successfully");
      setIsEditOpen(false);
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/meeting/${meetingId}`, { withCredentials: true });
      setMeeting(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update meeting");
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  const handleCancelClick = async () => {
    if (!window.confirm("Are you sure you want to cancel this meeting?")) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/meeting/${meetingId}/cancel`, {}, { withCredentials: true });
      toast.success("Meeting cancelled");
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/meeting/${meetingId}`, { withCredentials: true });
      setMeeting(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this meeting?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/meeting/${meetingId}`, { withCredentials: true });
      toast.success("Meeting deleted");
      navigate("/meetings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete meeting");
    }
  };

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
        console.log(res.data);
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
  const isHybrid = meeting.meetingType === "Hybrid";
  const isInPerson = meeting.meetingType === "In-Person";
  const canJoin = Boolean(meeting.virtualLink);
  const isHost = meeting?.host?._id === user?._id;
  const canManage = isHost || user?.role?.name === "Boss";

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

              {(isInPerson || isHybrid) && room && (
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

              {(isVirtual || isHybrid) && (
                  <div className="p-4 sm:p-5 flex items-start gap-3">
                    <Link2 className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {meeting.virtualLink ? "Virtual Link" : "Virtual Access"}
                      </p>
                      {meeting.virtualLink ? (
                        <a
                          href={meeting.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all mt-1 inline-block"
                        >
                          {meeting.virtualLink}
                        </a>
                      ) : (
                        <p className="text-muted-foreground mt-1 text-sm">
                          No virtual link added yet.
                        </p>
                      )}
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
              {canJoin && (
                <Button onClick={() => window.open(meeting.virtualLink, "_blank", "noopener,noreferrer")}>
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/meetings")}>
                <Clock className="mr-2 h-4 w-4" />
                All meetings
              </Button>
              {canManage && (
                <>
                  <Button variant="outline" onClick={handleEditClick} className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {meeting.status !== "Cancelled" && (
                    <Button variant="outline" onClick={handleCancelClick} className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/50">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleDeleteClick} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-0 gap-0 bg-card rounded-2xl border-border">
          <DialogHeader className="p-6 border-b border-border bg-muted/50">
            <DialogTitle className="text-xl font-bold text-foreground">
              Edit Meeting
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Make changes to your scheduled meeting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground"
                placeholder="e.g. Q3 Roadmap Review"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Meeting Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Virtual", "In-Person", "Hybrid"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        meetingType: type,
                      })
                    }
                    className={`py-2.5 px-3 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      formData.meetingType === type
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {type === "Virtual" && <Video size={14} />}
                    {type === "In-Person" && <Users size={14} />}
                    {type === "Hybrid" && <MapPin size={14} />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {(formData.meetingType === "In-Person" ||
              formData.meetingType === "Hybrid") && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Select Room
                </label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground"
                  required
                >
                  <option value="">-- Choose a Room --</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} (Cap: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(formData.meetingType === "Virtual" ||
              formData.meetingType === "Hybrid") && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Virtual Link
                </label>

                {!!user?.googleTokens && (
                  <div className="flex bg-muted rounded-lg p-1.5 gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, generateMeetLink: true, virtualLink: "" })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                        formData.generateMeetLink
                          ? "bg-background text-primary shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      <Video size={14} /> Auto-Generate
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, generateMeetLink: false })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                        !formData.generateMeetLink
                          ? "bg-background text-primary shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      <Plus size={14} /> Custom Link
                    </button>
                  </div>
                )}

                {!formData.generateMeetLink && (
                  <input
                    name="virtualLink"
                    value={formData.virtualLink}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground"
                    placeholder="https://..."
                  />
                )}

                {formData.generateMeetLink && (
                    <div className="w-full px-3 py-2.5 bg-accent/50 border border-border border-dashed rounded-lg text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Video size={16} className="text-primary"/> Google Meet Link will be generated automatically.
                    </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Participants ({formData.participants.length})
              </label>
              <div className="border border-border rounded-lg max-h-32 overflow-y-auto bg-muted p-1">
                {employees.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-2">
                    Loading...
                  </div>
                ) : (
                  employees.map((emp) => (
                    <div
                      key={emp._id}
                      onClick={() =>
                        handleParticipantToggle(emp._id)
                      }
                        className="flex items-center gap-2 p-2 hover:bg-accent hover:shadow-sm rounded-md cursor-pointer transition-all"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          formData.participants.includes(emp._id)
                            ? "bg-primary border-primary"
                            : "bg-card border-border"
                        }`}
                      >
                        {formData.participants.includes(
                          emp._id
                        ) && (
                          <Plus size={10} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm text-foreground font-medium">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {emp.jobTitle}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Agenda
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-foreground"
                placeholder="Brief description..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
              >
                {updating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NotificationPanel />
    </div>
  );
};

export default MeetingDetails;
