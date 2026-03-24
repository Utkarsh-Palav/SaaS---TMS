import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  User,
  Plus,
  Calendar,
  List,
  Menu,
  Video,
  Users,
  MapPin,
  Loader2,
  Clock,
} from "lucide-react";
import Sidebar from "@/components/Layout/Sidebar";
import MeetingCalendar from "@/components/Meeting/MeetingCalendar";
import UpcomingMeetings from "@/components/Meeting/UpcomingMeetings";
import MeetingRooms from "@/components/Meeting/MeetingRooms";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSocket } from "@/context/SocketContext";

const Meeting = () => {
  const { user } = useAuth();
  const isBossOrManager =
    user.role?.name === "Boss" || user.role?.name === "Manager";
  const { toggleNotificationPanel, notifications } = useNotifications();
  const socket = useSocket();

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState("calendar");
  const [isOpen, setIsOpen] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Data Lists
  const [employees, setEmployees] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // Form State
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

  // --- Fetch Helper Data ---
  const fetchFormDependencies = async () => {
    setLoadingData(true);
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
      console.error("Failed to load form data", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchFormDependencies();
  }, [isOpen]);

  // --- Handlers ---
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (new Date(formData.startTime) >= new Date(formData.endTime))
      return toast.error("End time must be after start time");
    if (
      (formData.meetingType === "In-Person" ||
        formData.meetingType === "Hybrid") &&
      !formData.roomId
    )
      return toast.error("Please select a room");

    setCreatingMeeting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/meeting`,
        formData,
        { withCredentials: true }
      );
      toast.success("Meeting scheduled successfully!");
      setIsOpen(false);
      setFormData({
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
      fetchAllMeetings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create meeting");
    } finally {
      setCreatingMeeting(false);
    }
  };

  const fetchAllMeetings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/meeting`,
        { withCredentials: true }
      );
      console.log(res.data)
      setMeetings(res.data);
    } catch (error) {
      toast.error("Failed to load meetings");
    }
  };

  useEffect(() => {
    fetchAllMeetings();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMeeting = () => {
      // Re-fetch all meetings whenever a new meeting notification arrives
      fetchAllMeetings();
    };

    socket.on("meetingNotification", handleNewMeeting);
    return () => {
      socket.off("meetingNotification", handleNewMeeting);
    };
  }, [socket]);

  // --- Sub-Components for Styles ---
  const ToggleButton = ({ active, onClick, icon: Icon, label }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-card text-primary shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      } first:rounded-l-lg last:rounded-r-lg`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                placeholder="Search meetings..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={toggleNotificationPanel}
              className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
            >
              <Bell size={22} />
              {notifications?.length > 0 && (
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-card"></span>
              )}
            </button>
            <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
              {user?.username?.[0] || <User size={18} />}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className=" mx-auto space-y-6">
            {/* Page Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Meetings
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage your schedule and team collaborations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex p-1 bg-secondary rounded-xl">
                  <ToggleButton
                    active={view === "calendar"}
                    onClick={() => setView("calendar")}
                    icon={Calendar}
                    label="Calendar"
                  />
                  <ToggleButton
                    active={view === "list"}
                    onClick={() => setView("list")}
                    icon={List}
                    label="List"
                  />
                </div>

                {isBossOrManager && (
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-5 h-11">
                        <Plus size={18} className="mr-2" /> Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-0 gap-0 bg-card rounded-2xl border-border">
                      <DialogHeader className="p-6 border-b border-border bg-muted/50">
                        <DialogTitle className="text-xl font-bold text-foreground">
                          Schedule New Meeting
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Organize a session with your team.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        onSubmit={handleCreateMeeting}
                        className="p-6 space-y-5"
                      >
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
                              min={new Date().toISOString().slice(0, 16)}
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
                              min={formData.startTime}
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
                                {type === "Virtual" && <Video size={14} />}{" "}
                                {type === "In-Person" && <Users size={14} />}{" "}
                                {type === "Hybrid" && <MapPin size={14} />}{" "}
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
                              {rooms.map((room) => (
                                <option key={room._id} value={room._id}>
                                  {room.name} (Cap: {room.capacity})
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
                            {loadingData ? (
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
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={creatingMeeting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                          >
                            {creatingMeeting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Schedule Meeting"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Calendar or List */}
              <div className="lg:col-span-2 space-y-8">
                {view === "calendar" ? (
                  <>
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      <MeetingCalendar meetingsData={meetings} />
                    </div>
                  </>
                ) : (
                  /* List View - Full Height */
                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <UpcomingMeetings listView={true} allMeetings={meetings} />
                  </div>
                )}
              </div>

              {/* Right Column: Rooms & Quick Actions */}
              <div className="lg:col-span-1 space-y-8">
                <MeetingRooms />
              </div>
            </div>
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

export default Meeting;
