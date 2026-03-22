import axios from "axios";
import React, { useEffect, useState } from "react";
import { Clock, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const UpcomingDeadline = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const upcomingDeadlines = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/overview-data3`,
          { withCredentials: true }
        );
        setTasks(res.data);
      } catch (error) {
        console.error("Failed to fetch deadlines:", error);
      }
    };
    upcomingDeadlines();
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Clock className="text-rose-500" size={20} />
          Upcoming Deadlines
        </h2>
        <span className="text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-md border border-rose-500/20">
          {tasks.length} Pending
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
            <CheckCircle2 size={32} className="mb-2 text-emerald-500/50" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          tasks.map((item) => (
            <div
              key={item._id}
              className="group p-4 rounded-xl bg-card border border-border hover:border-rose-500/30 hover:shadow-sm transition-all relative overflow-hidden card-hover"
            >
              <Link to={`/tasks/${item._id}`}>
                {/* Progress Bar Hint */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-xl"></div>

                <div className="flex justify-between items-start mb-2 pl-2">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      item.priority === "High"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {item.priority || "Normal"}
                  </span>
                </div>

                <div className="flex items-center justify-between pl-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {new Date(item.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-1">
                      Assigned to:
                    </span>
                    <div
                      className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border"
                      title={item.assignedManager?.username}
                    >
                      {item.assignedManager?.username?.charAt(0) || "?"}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadline;