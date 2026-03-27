import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  DownloadIcon,
  CalendarIcon,
  Menu,
  Bell,
  BarChart3,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "@/components/Layout/Sidebar";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

const PERIOD_OPTIONS = [
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
  { value: "quarter", label: "Last 90 Days" },
  { value: "year", label: "Last 365 Days" },
];

const getChangeText = (value) => {
  if (value === null || value === undefined) return "No prior baseline";
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value}% vs previous period`;
};

const Reports = () => {
  const { user } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const fetchReport = async (period) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dashboard/report-data`,
        {
          params: { period },
          withCredentials: true,
        }
      );
      setReport(res.data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to fetch organization report. Please try again.";
      setError(message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedPeriod);
  }, [selectedPeriod]);

  const summaryCards = useMemo(() => {
    if (!report) return [];
    return [
      {
        title: "Tasks Completed",
        value: report.summary.completedTasks ?? 0,
        change: report.changes.completedTasksPct,
      },
      {
        title: "Active Employees",
        value: report.summary.activeEmployees ?? 0,
        change: null,
      },
      {
        title: "Meetings Held",
        value: report.summary.meetingsHeld ?? 0,
        change: report.changes.meetingsHeldPct,
      },
      {
        title: "Departments",
        value: report.summary.departments ?? 0,
        change: null,
      },
    ];
  }, [report]);

  const handleExportCsv = () => {
    if (!report) return;

    const lines = [];
    lines.push("Taskify Organization Report");
    lines.push(`Generated At,${new Date(report.generatedAt).toLocaleString()}`);
    lines.push(`Period,${selectedPeriod}`);
    lines.push("");
    lines.push("Summary");
    lines.push("Metric,Value");
    lines.push(`Total Tasks,${report.summary.totalTasks}`);
    lines.push(`Completed Tasks,${report.summary.completedTasks}`);
    lines.push(`Pending Tasks,${report.summary.pendingTasks}`);
    lines.push(`In Progress Tasks,${report.summary.inProgressTasks}`);
    lines.push(`Overdue Tasks,${report.summary.overdueTasks}`);
    lines.push(`Active Employees,${report.summary.activeEmployees}`);
    lines.push(`Meetings Held,${report.summary.meetingsHeld}`);
    lines.push(`Departments,${report.summary.departments}`);
    lines.push("");
    lines.push("Department Performance");
    lines.push("Department,Performance %,Total Tasks,Completed Tasks");
    report.departmentPerformance.forEach((d) => {
      lines.push(`${d.name},${d.performance},${d.totalTasks},${d.completedTasks}`);
    });
    lines.push("");
    lines.push("Top Performers");
    lines.push("Name,Department,Completed Tasks");
    report.topPerformers.forEach((p) => {
      lines.push(`${p.name},${p.department},${p.tasks}`);
    });

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taskify-org-report-${selectedPeriod}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="text-primary" size={24} /> Reports
            </h1>
          </div>
          <div className="flex items-center gap-3">
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

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Organization Reports & Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time organization insights for {user?.firstName || "your team"}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-card">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-sm bg-transparent outline-none"
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => fetchReport(selectedPeriod)}
                className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExportCsv}
                disabled={!report}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">Generating organization report...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-300 bg-rose-50 text-rose-700 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Unable to load report</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {summaryCards.map((card) => (
                  <div key={card.title} className="bg-card overflow-hidden shadow rounded-lg border border-border">
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-semibold mt-1">{card.value}</p>
                    </div>
                    <div className="bg-muted px-5 py-3 text-sm text-muted-foreground">
                      {getChangeText(card.change)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-medium text-foreground">Task Trend</h2>
                  </div>
                  <div className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.taskCompletionTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#10B981" name="Completed" />
                          <Bar dataKey="pending" fill="#F59E0B" name="Pending/In Progress" />
                          <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-medium text-foreground">
                      Department Task Performance
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.departmentPerformance} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip />
                          <Bar dataKey="performance" fill="#4F46E5" name="Completion %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
                    <div className="px-6 py-4 border-b border-border">
                      <h2 className="text-lg font-medium text-foreground">Employee Distribution</h2>
                    </div>
                    <div className="p-6">
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={report.departmentDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {report.departmentDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
                    <div className="px-6 py-4 border-b border-border">
                      <h2 className="text-lg font-medium text-foreground">Top Performers</h2>
                    </div>
                    <div className="divide-y divide-border">
                      {report.topPerformers.length === 0 ? (
                        <div className="px-6 py-8 text-center text-muted-foreground">
                          No completed task data found for this period.
                        </div>
                      ) : (
                        report.topPerformers.map((performer) => (
                          <div
                            key={performer.id}
                            className="px-6 py-4 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              {performer.avatar ? (
                                <img
                                  src={performer.avatar}
                                  alt={performer.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
                                  {performer.name?.[0] || "U"}
                                </div>
                              )}
                              <div className="ml-4">
                                <p className="text-sm font-medium text-foreground">
                                  {performer.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {performer.department}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {performer.tasks} tasks
                              </p>
                              <p className="text-sm text-muted-foreground">completed</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

export default Reports;
