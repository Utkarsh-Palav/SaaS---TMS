import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutList,
} from 'lucide-react';

const TaskStats = ({ tasks }) => {
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const overdue = tasks.filter(t => t.status === 'Overdue').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Tasks"
        value={totalTasks}
        icon={<LayoutList size={20} />}
        color="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      />
      <StatCard
        title="In Progress"
        value={inProgress}
        icon={<Clock size={20} />}
        color="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      />
      <StatCard
        title="Completed"
        value={completed}
        icon={<CheckCircle2 size={20} />}
        color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      />
      <StatCard
        title="Overdue"
        value={overdue}
        icon={<AlertCircle size={20} />}
        color="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between card-hover">
    <div>
      <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-extrabold text-foreground">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg border ${color}`}>
      {icon}
    </div>
  </div>
);

export default TaskStats;