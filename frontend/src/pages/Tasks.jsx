import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import Sidebar from "@/components/Layout/Sidebar";
import {
  Search,
  LayoutList,
  LayoutGrid,
  Loader2,
  Menu,
  Bell,
} from "lucide-react";

import TaskList from "../components/Task/TaskList";
import KanbanBoard from "../components/Task/KanbanBoard";
import TaskStats from "../components/Task/TaskStats";
import TaskCreateDialog from "../components/Task/TaskCreateDialog";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import TaskFilters from "@/components/Task/TaskFilters";
import ThemeToggle from "@/components/ui/ThemeToggle";

const Tasks = () => {
  const { user } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();
  const navigate = useNavigate();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Data State
  const [tasks, setTasks] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Task Creation Form State
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    department: "",
    assignedManager: "",
    deadline: "",
    priority: "Medium",
    milestones: [],
    organizationId: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [hasManager, setHasManager] = useState(true);
  const [mileStoneInput, setMileStoneInput] = useState("");

  // --- Fetch Tasks ---
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint =
        user.role?.name === "Boss"
          ? `api/task/boss`
          : user.role?.name === "Manager"
          ? `api/task/manager`
          : `api/task/employee`;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/task/getTask`,
        { withCredentials: true }
      );
      setTasks(res.data);
      setOriginalTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  // --- Filter Logic ---
  useEffect(() => {
    let filtered = originalTasks;

    // 1. Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term)
      );
    }

    // 2. Category Filter (Status/Priority)
    if (activeFilter !== "All") {
      if (
        ["Pending", "In Progress", "Completed", "Overdue"].includes(
          activeFilter
        )
      ) {
        filtered = filtered.filter((t) => t.status === activeFilter);
      } else if (["High", "Medium", "Low"].includes(activeFilter)) {
        filtered = filtered.filter((t) => t.priority === activeFilter);
      }
    }

    setTasks(filtered);
  }, [searchTerm, activeFilter, originalTasks]);

  // --- Handlers ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/task/create`,
        taskData,
        { withCredentials: true }
      );
      const newTask = res.data.task;

      setTasks((prev) => [newTask, ...prev]);
      setOriginalTasks((prev) => [newTask, ...prev]);
      toast.success("Task created successfully!");
      setIsCreateOpen(false);

      setTaskData({
        title: "",
        description: "",
        department: "",
        assignedManager: "",
        deadline: "",
        priority: "Medium",
        milestones: [],
      });
      setSelectedDepartment([]);
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/task/${id}`, {
        withCredentials: true,
      });
      toast.success("Task deleted.");
      setOriginalTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Failed to delete task.");
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);
    setOriginalTasks(updatedTasks);

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/task/${taskId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Status update failed", error);
      toast.error("Failed to update status");
      fetchTasks();
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-foreground">All Tasks</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none w-64 placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ThemeToggle />

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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                {/* View Toggle & Filter */}
                <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutList size={16} /> List
                  </button>
                  <button
                    onClick={() => setViewMode("board")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === "board"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid size={16} /> Board
                  </button>
                </div>
                <TaskFilters 
                      activeFilter={activeFilter} 
                      setActiveFilter={setActiveFilter} 
                   />
              </div>

              {/* Create Button */}
              {user.role?.name === "Boss" && (
                <TaskCreateDialog
                  open={isCreateOpen}
                  setOpen={setIsCreateOpen}
                  taskData={taskData}
                  setTaskData={setTaskData}
                  selectedDepartment={selectedDepartment}
                  setSelectedDepartment={setSelectedDepartment}
                  hasManager={hasManager}
                  setHasManager={setHasManager}
                  mileStoneInput={mileStoneInput}
                  setMileStoneInput={setMileStoneInput}
                  handleCreateTask={handleCreateTask}
                  loading={loading}
                  toast={toast}
                />
              )}
            </div>

            {/* Stats */}
            <TaskStats tasks={originalTasks} />

            {/* Views */}
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : (
              <>
                {viewMode === "list" ? (
                  <TaskList
                    tasks={tasks}
                    loading={loading}
                    handleDeleteTask={handleDeleteTask}
                    user={user}
                    navigate={navigate}
                  />
                ) : (
                  <KanbanBoard
                    tasks={tasks}
                    onUpdateStatus={handleUpdateStatus}
                    navigate={navigate}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

export default Tasks;
