import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  FileText,
  MessageSquare,
  UserPlus,
  UploadCloud,
  Plus,
  Trash2,
  Calendar,
  Edit3,
} from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/activities`,
        { withCredentials: true }
      );
      setActivities(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action, module) => {
    if (action === "CREATE")
      return <Plus size={14} className="text-emerald-600 dark:text-emerald-400" />;
    if (action === "DELETE")
      return <Trash2 size={14} className="text-rose-600 dark:text-rose-400" />;
    if (module === "Meeting")
      return <Calendar size={14} className="text-purple-600 dark:text-purple-400" />;
    if (module === "Employee")
      return <UserPlus size={14} className="text-blue-600 dark:text-blue-400" />;
    return <Edit3 size={14} className="text-amber-600 dark:text-amber-400" />;
  };

  const getBgColor = (action, module) => {
    if (action === "CREATE") return "bg-emerald-500/10 border-emerald-500/20";
    if (action === "DELETE") return "bg-rose-500/10 border-rose-500/20";
    if (module === "Meeting") return "bg-purple-500/10 border-purple-500/20";
    if (module === "Employee") return "bg-blue-500/10 border-blue-500/20";
    return "bg-amber-500/10 border-amber-500/20";
  };

  if (loading)
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">Loading activity...</div>
    );

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full max-h-[500px]">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Activity className="text-primary" size={20} />
          Recent Activity
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        {/* Timeline Line */}
        <div className="absolute left-[42px] top-6 bottom-6 w-0.5 bg-border"></div>

        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            activities.map((log) => (
              <div key={log._id} className="relative flex gap-4 group animate-fade-in">
                {/* Icon Bubble */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${getBgColor(
                    log.action,
                    log.module
                  )}`}
                >
                  {getIcon(log.action, log.module)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{log.user?.firstName}</span>{" "}
                      <span className="text-muted-foreground">{log.description}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">
                    {log.module} • {log.action}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
