// import React from "react";
// import {
//   UsersIcon,
//   ClipboardCheckIcon,
//   Clock, // Used for Active Employee (from original Home.jsx)
//   AlertCircleIcon,
//   ChartNoAxesCombined, // Used for Average Completion (from original Home.jsx)
//   LayoutList,
// } from "lucide-react";
// import { Link } from "react-router-dom";

// // Reusable Stat Card Component (kept as is)
// const StatCard = ({ title, value, icon, bgColor, subTitle, link }) => {
//   return (
//     <Link to={`/${link}`}>
//       <div className="bg-white overflow-hidden shadow rounded-lg">
//         <div className="p-5">
//           <div className="flex items-center">
//             <div className={`flex-shrink-0 p-3 rounded-md ${bgColor}`}>
//               {icon}
//             </div>
//             <div className="ml-5 w-0 flex-1">
//               <dl>
//                 <dt className="text-sm font-medium text-gray-500 truncate">
//                   {title}
//                 </dt>
//                 <dd>
//                   <div className="text-lg font-medium text-gray-900">
//                     {value || 0}
//                   </div>
//                 </dd>
//               </dl>
//             </div>
//           </div>
//         </div>
//         {subTitle && (
//           <div className="bg-gray-50 px-5 py-3">
//             <div className="text-sm text-gray-500 truncate">{subTitle}</div>
//           </div>
//         )}
//       </div>
//     </Link>
//   );
// };

// // Main StatsCards Component (Updated to use dynamic props)
// const StatsCards = ({
//   taskCount,
//   activeUser,
//   overdueTaskCount,
//   averageCompletionDays,
// }) => {
//   return (
//     <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//       <StatCard
//         title="Total Tasks"
//         value={taskCount}
//         icon={<LayoutList className="h-6 w-6 text-blue-600" />}
//         bgColor="bg-blue-50"
//         subTitle="Total tasks in the system"
//         link="tasks"
//       />
//       <StatCard
//         title="Active Employee"
//         value={activeUser}
//         icon={<Clock className="h-6 w-6 text-green-600" />}
//         bgColor="bg-green-50"
//         subTitle="Are online now (or active sessions)"
//         link="employees"
//       />
//       <StatCard
//         title="Overdue Tasks"
//         value={overdueTaskCount}
//         icon={<AlertCircleIcon className="h-6 w-6 text-red-600" />}
//         bgColor="bg-red-50"
//         subTitle="Tasks past their deadline"
//         link="tasks"
//       />
//       <StatCard
//         title="Avg Completion (Days)"
//         value={averageCompletionDays ? averageCompletionDays.toFixed(1) : 0}
//         icon={<ChartNoAxesCombined className="h-6 w-6 text-indigo-600" />}
//         bgColor="bg-indigo-50"
//         subTitle="Avg time to complete a task"
//         link="dashboard"
//       />
//     </div>
//   );
// };

// export default StatsCards;


import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutList,
  Users,
  AlertCircle,
  Timer,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"; // Updated icons

const StatCard = ({ title, value, icon, colorClass, link, trend }) => {
  // colorClass expected format: "blue" | "green" | "red" | "indigo"
  
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-rose-50 text-rose-600 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  const selectedColor = colorMap[colorClass] || colorMap.blue;

  return (
    <Link to={`/${link}`} className="block group">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${selectedColor} transition-colors`}>
            {icon}
          </div>
          {trend && (
             <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {trend > 0 ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                {Math.abs(trend)}%
             </span>
          )}
        </div>
        <div>
           <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
           <p className="text-3xl font-bold text-foreground tracking-tight">{value || 0}</p>
        </div>
      </div>
    </Link>
  );
};

const StatsCards = ({
  taskCount,
  activeUser,
  overdueTaskCount,
  averageCompletionDays,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Tasks"
        value={taskCount}
        icon={<LayoutList size={24} />}
        colorClass="blue"
        link="tasks"
        trend={12} // Dummy trend data
      />
      <StatCard
        title="Active Employees"
        value={activeUser}
        icon={<Users size={24} />}
        colorClass="green"
        link="employees"
        trend={5}
      />
      <StatCard
        title="Overdue Tasks"
        value={overdueTaskCount}
        icon={<AlertCircle size={24} />}
        colorClass="red"
        link="tasks"
        trend={-2}
      />
      <StatCard
        title="Avg Completion Time"
        value={`${averageCompletionDays ? averageCompletionDays.toFixed(1) : 0} Days`}
        icon={<Timer size={24} />}
        colorClass="indigo"
        link="dashboard"
        trend={8}
      />
    </div>
  );
};

export default StatsCards;