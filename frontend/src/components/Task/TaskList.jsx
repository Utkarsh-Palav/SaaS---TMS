import React from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

const TaskList = ({ tasks, loading, handleDeleteTask, user, navigate }) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-muted-foreground" size={32} />
        </div>
        <h3 className="text-lg font-bold text-foreground">No tasks found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task) => (
              <tr
                key={task._id}
                className="group hover:bg-primary/5 transition-colors"
              >
                <td className="px-6 py-4">
                  <div
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="cursor-pointer"
                  >
                    <div className="font-semibold text-foreground">
                      {task.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {task.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {task.assignedManager?.profileImage ? (
                      <div className="rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        <a href={task.assignedManager?.profileImage} target="_blank" className="h-8 w-8 rounded-full">
                          <img
                            src={task.assignedManager?.profileImage}
                            alt={task.assignedManager?.firstName}
                            className="rounded-full w-full h-full object-cover"
                          />
                        </a>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {task.assignedManager?.firstName?.[0]}
                      </div>
                    )}

                    <span className="text-sm text-muted-foreground">
                      {task.assignedManager?.firstName}{" "}
                      {task.assignedManager?.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2 ">
                    {user.role.name === "Boss" && (
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="p-2 hover:bg-accent text-muted-foreground hover:text-primary rounded-lg"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Badges
const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "In Progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Pending: "bg-muted text-muted-foreground",
    Overdue: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        styles[status] || styles["Pending"]
      }`}
    >
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    High: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    Medium: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    Low: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

export default TaskList;
