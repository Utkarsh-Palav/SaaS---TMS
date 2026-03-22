import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import axios from "axios";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import Sidebar from "@/components/Layout/Sidebar";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  PenSquare,
  Plus,
  MessageSquare,
  User,
  Layers,
  Menu,
  Briefcase,
  Users,
  Trash2,
  Send,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toggleNotificationPanel, notifications } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAssignTeamDialogOpen, setIsAssignTeamDialogOpen] = useState(false);

  const [taskDetail, setTaskDetail] = useState(null);
  const [departmentTeams, setDepartmentTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [mileStoneInput, setMileStoneInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const isManagerOrBoss =
    user?.role?.name === "Boss" || user?.role?.name === "Manager";

  const fetchTask = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/task/${taskId}`,
        { withCredentials: true }
      );
      console.log(res.data)
      const data = res.data;
      setTaskDetail(data);
      setTitle(data.title);
      setDescription(data.description);
      setDepartmentTeams(data.department?.teams || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const progressPercentage = useMemo(() => {
    if (!taskDetail?.milestones?.length) return 0;
    const completed = taskDetail.milestones.filter((m) => m.completed).length;
    return Math.round((completed / taskDetail.milestones.length) * 100);
  }, [taskDetail]);

  const handleUpdateTitleandDesc = async () => {
    setIsSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/task/${taskDetail._id}`,
        { title, description },
        { withCredentials: true }
      );
      toast.success("Task updated!");
      await fetchTask();
      setIsEditing(false);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTeamAssign = async () => {
    if (!selectedTeam) return;
    setIsAssigning(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/task/${
          taskDetail._id
        }/assign-team`,
        { teamId: selectedTeam },
        { withCredentials: true }
      );
      console.log(res.data)
      toast.success("Team assigned successfully!");
      setIsAssignTeamDialogOpen(false);
      await fetchTask();
    } catch (e) {
      toast.error("Assignment failed");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleMilestoneAdd = () => {
    if (mileStoneInput.trim()) {
      handleAddMilestoneApi(mileStoneInput.trim());
    }
  };

  const handleAddMilestoneApi = async (newTitle) => {
    try {
      const newMilestone = { title: newTitle, completed: false };
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/task/${taskDetail._id}/milestone`,
        { milestones: [newMilestone] },
        { withCredentials: true }
      );
      toast.success("Milestone added");
      setMileStoneInput("");
      fetchTask();
    } catch (e) {
      console.error(e);
      toast.error("Failed to add milestone");
    }
  };

  const handleMilestoneToggle = async (milestoneId, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/task/${taskDetail._id}/milestone`,
        { milestoneId, completed: status },
        { withCredentials: true }
      );
      toast.success("Updated");
      fetchTask();
    } catch (e) {
      toast.error("Failed update");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/comment/${taskDetail._id}`,
        { author: user._id, content: comment },
        { withCredentials: true }
      );
      toast.success("Comment posted");
      setComment("");
      fetchTask();
    } catch (e) {
      toast.error("Failed to post comment");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/task/${taskDetail._id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success("Status updated");
      fetchTask();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/task/${taskDetail._id}`,
        { withCredentials: true }
      );
      toast.success("Task deleted");
      navigate("/tasks");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "??";

  const getPriorityBadge = (p) => {
    const colors = {
      High: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
      Medium: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      Low: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${
          colors[p] || colors.Low
        }`}
      >
        {p}
      </span>
    );
  };

  const getStatusBadge = (s) => {
    const colors = {
      Completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      "In Progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      Pending: "bg-muted text-muted-foreground border-border",
      Overdue: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
    return (
      <span
        className={`flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold border ${
          colors[s] || colors.Pending
        }`}
      >
        {s} {isManagerOrBoss ? <ChevronDown /> : ""}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  if (!taskDetail)
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        Task not found
      </div>
    );

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="cursor-pointer hover:text-foreground hover:underline"
                onClick={() => navigate("/tasks")}
              >
                Tasks
              </span>
              <span>/</span>
              <span className="font-medium text-foreground truncate max-w-[200px] uppercase tracking-widest">
                ID-{taskDetail._id.slice(-4)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleNotificationPanel}
              className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
            >
              <Bell size={22} />
              {notifications?.length > 0 && (
                <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {/* --- 1. HERO HEADER --- */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                {isEditing ? (
                  <input
                    className="w-full text-3xl font-bold text-foreground border-b-2 border-primary pb-2 focus:outline-none bg-transparent"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                    {taskDetail.title}
                  </h1>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  {isManagerOrBoss ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none flex">
                        {getStatusBadge(taskDetail.status)}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {["Pending", "In Progress", "Completed"].map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleStatusUpdate(s)}
                          >
                            {s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    getStatusBadge(taskDetail.status)
                  )}

                  <div className="flex bg-card border border-border rounded-lg p-1 shadow-sm">
                    {isManagerOrBoss && (
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Edit Task"
                      >
                        <PenSquare size={18} />
                      </button>
                    )}
                    {user.role?.name === "Boss" && (
                      <button
                        onClick={handleDeleteTask}
                        className="p-2 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getPriorityBadge(taskDetail.priority)}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar size={14} /> Due{" "}
                  {taskDetail.deadline
                    ? format(new Date(taskDetail.deadline), "MMM d, yyyy")
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* --- LEFT COLUMN --- */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-card p-4 rounded-2xl border border-border">
                  {isEditing ? (
                    <div className="space-y-4">
                      <textarea
                        className="w-full p-4 bg-muted border border-border rounded-xl text-foreground min-h-[150px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={handleUpdateTitleandDesc}
                          disabled={isSaving}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">
                      {taskDetail.description || "No description provided."}
                    </p>
                  )}
                </div>

                <div className="border-t border-border my-6"></div>

                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="text-primary" size={20} />{" "}
                      Milestones
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      {progressPercentage}% Complete
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="space-y-3">
                    {taskDetail.milestones?.map((ms, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                          ms.completed
                            ? "bg-muted/50 border-border opacity-70"
                            : "bg-card border-border shadow-sm hover:border-primary/30"
                        }`}
                      >
                        <button
                          disabled={!isManagerOrBoss}
                          onClick={() =>
                            handleMilestoneToggle(ms._id, !ms.completed)
                          }
                          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            ms.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-card border-border hover:border-primary"
                          }`}
                        >
                          {ms.completed && <CheckCircle2 size={16} />}
                        </button>
                        <span
                          className={`text-sm font-medium ${
                            ms.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {ms.title}
                        </span>
                      </div>
                    ))}

                    {isManagerOrBoss && (
                      <div className="flex gap-2 mt-4">
                        <input
                          type="text"
                          placeholder="Add a new milestone..."
                          className="flex-1 bg-muted border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-card transition-all text-foreground placeholder:text-muted-foreground"
                          value={mileStoneInput}
                          onChange={(e) => setMileStoneInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleMilestoneAdd()
                          }
                        />
                        <Button
                          size="icon"
                          onClick={handleMilestoneAdd}
                          className="shrink-0 rounded-xl"
                        >
                          <Plus size={20} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border my-6"></div>

                {/* Discussion */}
                <div className="bg-muted rounded-2xl p-6 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <MessageSquare className="text-primary" size={20} />{" "}
                    Discussion
                  </h3>

                  <div className="space-y-6 mb-8">
                    {taskDetail.comments?.length > 0 ? (
                      taskDetail.comments.map((c) => (
                        <div key={c._id} className="flex gap-4 group">
                          <div className="shrink-0">
                            {c.author?.profileImage ? (
                              <img
                                src={c.author.profileImage}
                                alt={c.author.firstName}
                                className="w-10 h-10 rounded-full object-cover shadow-sm border border-card"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-card shadow-sm">
                                {getInitials(c.author?.firstName)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-bold text-foreground text-sm">
                                {c.author?.firstName} {c.author?.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(c.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <div className="bg-card p-3 rounded-2xl rounded-tl-none border border-border shadow-sm text-sm text-foreground leading-relaxed">
                              {c.content}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground italic text-sm py-4">
                        No comments yet. Start the discussion.
                      </p>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-3 bg-card p-2 rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <textarea
                      placeholder="Write a comment..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-2 resize-none min-h-11 max-h-32 text-foreground placeholder:text-muted-foreground"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      className="self-end p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                  {/* Assignees */}
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Assigned To
                    </h4>
                    {taskDetail.team?.members || taskDetail.team?.members > 0 ? (
                      <div className="flex flex-col gap-3">
                        {taskDetail.team?.members.map((emp) => (
                          <div
                            key={emp._id}
                            className="flex items-center gap-3"
                          >
                            {emp.profileImage ? (
                              <img
                                src={emp.profileImage}
                                className="w-8 h-8 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                {getInitials(emp.firstName)}
                              </div>
                            )}
                            <span className="text-sm font-medium text-foreground">
                              {emp.firstName} {emp.lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No employees assigned
                      </p>
                    )}
                  </div>

                  {/* Assigned Team */}
                  <div className="pt-6 border-t border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Assigned Team
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Users size={16} />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {taskDetail.team?.name || "No Team Assigned"}
                      </span>
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="pt-6 border-t border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Managed By
                    </h4>
                    <div className="flex items-center gap-3">
                      {taskDetail.assignedManager?.profileImage ? (
                        <img
                          src={taskDetail.assignedManager.profileImage}
                          className="w-10 h-10 rounded-full object-cover border-2 border-card shadow-sm"
                          alt={taskDetail.assignedManager.firstName}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold border-2 border-card shadow-sm">
                          {getInitials(taskDetail.assignedManager?.firstName)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {taskDetail.assignedManager?.firstName}{" "}{taskDetail.assignedManager?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {taskDetail.assignedManager?.jobTitle || "Manager"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="pt-6 border-t border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Department
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-muted text-muted-foreground rounded-lg">
                        <Layers size={16} />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {taskDetail.department?.name || "General"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Box */}
                {isManagerOrBoss && !taskDetail.team && (
                  <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                    <h4 className="font-bold text-lg mb-2">Needs a Team?</h4>
                    <p className="text-blue-100 text-sm mb-4">
                      Assign this task to a specific team to start tracking
                      progress.
                    </p>

                    <Dialog
                      open={isAssignTeamDialogOpen}
                      onOpenChange={setIsAssignTeamDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold border-none"
                        >
                          Assign Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Assign Team</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {departmentTeams.length > 0 ? (
                            departmentTeams.map((team) => (
                              <button
                                key={team._id}
                                onClick={() => setSelectedTeam(team._id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                  selectedTeam === team._id
                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                    : "bg-muted text-foreground border-border hover:bg-card hover:border-primary/30"
                                }`}
                              >
                                {team.name}
                              </button>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No teams available.
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={handleTeamAssign}
                          disabled={!selectedTeam || isAssigning}
                          className="w-full mt-6"
                        >
                          {isAssigning ? "Assigning..." : "Confirm Assignment"}
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

export default TaskDetails;
