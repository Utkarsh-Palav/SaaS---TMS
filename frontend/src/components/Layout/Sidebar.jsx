// import React, { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   LayoutDashboardIcon,
//   UsersIcon,
//   ClipboardCheckIcon,
//   CalendarIcon,
//   MessageSquareIcon,
//   BarChartIcon,
//   SettingsIcon,
//   HelpCircleIcon,
//   BuildingIcon,
//   LogOutIcon,
// } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { toast } from "sonner";
// import axios from "axios";
// const Sidebar = ({ isOpen, setIsOpen }) => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const isActive = (path) => location.pathname.startsWith(path);

//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   const handleLogout = async () => {
//       setIsLoggingOut(true);

//       try {
//         await axios.post(
//           `${import.meta.env.VITE_API_URL}/api/auth/logout`,
//           {},
//           { withCredentials: true }
//         );

//         logout();
//         toast("Logged out successfully!");
//         navigate("/login");
//       } catch (error) {
//         console.error("Logout failed:", error);
//         toast.error("Logout failed");
//       } finally {
//         setIsLoggingOut(false);
//       }
//     };

//   const handleLinkClick = () => {
//     if (isOpen) {
//       setIsOpen(!isOpen);
//     }
//   };
//   return (
//     <>
//       {/* Mobile sidebar backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-gray-600 opacity-75 lg:hidden"
//           onClick={() => setIsOpen(!isOpen)}
//         ></div>
//       )}
//       {/* Sidebar */}
//       <div
//         className={`
//             fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto
//         ${isOpen ? "translate-x-0" : "-translate-x-full"}
//       `}
//       >
//         <div className="h-full flex flex-col">
//           {/* Logo */}
//           <div className="h-16 flex items-center px-6 border-b border-gray-200">
//             <Link to="/" className="flex items-center">
//               <span className="text-xl font-bold text-blue-600">Taskify</span>
//             </Link>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
//             >
//               <span className="sr-only">Close sidebar</span>
//               <svg
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>
//           {/* Navigation */}
//           <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
//             <SidebarLink
//               to="/dashboard"
//               icon={<LayoutDashboardIcon size={20} />}
//               text="Dashboard"
//               active={
//                 location.pathname === "/dashboard" || location.pathname === "/"
//               }
//               onClick={handleLinkClick}
//             />
//             <SidebarLink
//               to="/tasks"
//               icon={<ClipboardCheckIcon size={20} />}
//               text="Tasks"
//               active={isActive("/tasks")}
//               onClick={handleLinkClick}
//             />
//             <SidebarLink
//               to="/employees"
//               icon={<UsersIcon size={20} />}
//               text="Employees"
//               active={isActive("/employees")}
//               onClick={handleLinkClick}
//             />
//             <SidebarLink
//               to="/departments"
//               icon={<BuildingIcon size={20} />}
//               text="Departments"
//               active={isActive("/departments")}
//               onClick={handleLinkClick}
//             />
//             <SidebarLink
//               to="/meetings"
//               icon={<CalendarIcon size={20} />}
//               text="Meetings"
//               active={isActive("/meetings")}
//               onClick={handleLinkClick}
//             />
//             <SidebarLink
//               to="/messages"
//               icon={<MessageSquareIcon size={20} />}
//               text="Messages"
//               active={isActive("/messages")}
//               onClick={handleLinkClick}
//             />
//             <SidebarLink
//               to="/reports"
//               icon={<BarChartIcon size={20} />}
//               text="Reports"
//               active={isActive("/reports")}
//               onClick={handleLinkClick}
//             />
//             <div className="border-t border-gray-200 my-4"></div>
//             <SidebarLink
//               to="/settings"
//               icon={<SettingsIcon size={20} />}
//               text="Settings"
//               active={isActive("/settings")}
//               onClick={handleLinkClick}
//             />
//             <SidebarLink
//               to="/help"
//               icon={<HelpCircleIcon size={20} />}
//               text="Help & Support"
//               active={isActive("/help")}
//               onClick={handleLinkClick}
//             />
//             <LogoutButton
//               onClick={() => handleLogout()}
//               icon={<LogOutIcon size={20} />}
//               text={isLoggingOut ? "Signing Out..." : "Sign Out"}
//               disabled={isLoggingOut}
//             />
//           </nav>
//           {/* User profile */}
//           <div className="p-4 border-t border-gray-200">
//             <div className="flex items-center">
//               <div className="w-14 bg-gray-200 rounded-full p-0.5 object-cover">
//                 <img
//                   src={user.organizationId?.logoUrl}
//                   alt="Company Logo"
//                   className="w-16 rounded-full"
//                 />
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-gray-900">
//                   {user.organizationId?.name || user.organizationName}
//                 </p>
//                 <p className="text-xs text-gray-500">Administrator</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
// const SidebarLink = ({ to, icon, text, active = false, onClick }) => {
//   return (
//     <Link
//       to={to}
//       onClick={onClick}
//       className={`
//         flex items-center px-3 py-2 text-sm font-medium rounded-md group
//         ${
//           active
//             ? "bg-blue-50 text-blue-700"
//             : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
//         }
//       `}
//     >
//       <span
//         className={`mr-3 ${
//           active ? "text-blue-700" : "text-gray-500 group-hover:text-blue-700"
//         }`}
//       >
//         {icon}
//       </span>
//       {text}
//     </Link>
//   );
// };

// const LogoutButton = ({ onClick, icon, text, disabled }) => {
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`
//                 flex items-center w-full px-3 py-2 text-sm font-medium rounded-md group transition-colors duration-150
//                 text-gray-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed
//                 ${disabled ? "text-red-700 bg-red-50" : ""}
//             `}
//     >
//       <span
//         className={`mr-3 text-gray-500 group-hover:text-red-700 ${
//           disabled ? "text-red-700" : ""
//         }`}
//       >
//         {icon}
//       </span>
//       {text}
//     </button>
//   );
// };

// export default Sidebar;

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon,
  UsersIcon,
  ClipboardCheckIcon,
  CalendarIcon,
  MessageSquareIcon,
  BarChartIcon,
  SettingsIcon,
  HelpCircleIcon,
  BuildingIcon,
  LogOutIcon,
  Menu, // Added for mobile menu icon
  X, // Added for close icon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname.startsWith(path);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      logout();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024 && isOpen) {
      // Close on mobile only
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto flex flex-col shadow-xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={handleLinkClick}
          >
            <div className="h-9 w-9 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-sidebar-foreground tracking-tight">
              Task<span className="text-[#3b82f6]">ify</span>
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Overview
            </p>
            <SidebarLink
              to="/dashboard"
              icon={<LayoutDashboardIcon size={18} />}
              text="Dashboard"
              active={
                location.pathname === "/dashboard" || location.pathname === "/"
              }
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/tasks"
              icon={<ClipboardCheckIcon size={18} />}
              text="Tasks"
              active={isActive("/tasks")}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/employees"
              icon={<UsersIcon size={18} />}
              text="Employees"
              active={isActive("/employees")}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/departments"
              icon={<BuildingIcon size={18} />}
              text="Departments"
              active={isActive("/departments")}
              onClick={handleLinkClick}
            />
          </div>

          <div className="mt-8 space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Communication
            </p>
            <SidebarLink
              to="/messages"
              icon={<MessageSquareIcon size={18} />}
              text="Messages"
              active={isActive("/messages")}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/meetings"
              icon={<CalendarIcon size={18} />}
              text="Meetings"
              active={isActive("/meetings")}
              onClick={handleLinkClick}
            />
          </div>

          <div className="mt-8 space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              System
            </p>
            <SidebarLink
              to="/reports"
              icon={<BarChartIcon size={18} />}
              text="Reports"
              active={isActive("/reports")}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/settings"
              icon={<SettingsIcon size={18} />}
              text="Settings"
              active={isActive("/settings")}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/help"
              icon={<HelpCircleIcon size={18} />}
              text="Help & Support"
              active={isActive("/help")}
              onClick={handleLinkClick}
            />
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-sidebar border border-sidebar-border p-0.5 shadow-sm overflow-hidden shrink-0">
              <img
                src={
                  user?.organizationId?.logoUrl ||
                  "https://via.placeholder.com/40"
                }
                alt="Logo"
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.organizationId?.name ||
                  user?.organizationName ||
                  "Organization"}
              </p>
              <p className="text-xs text-muted-foreground truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
                        w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                        text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:shadow-sm
                        ${isLoggingOut ? "opacity-50 cursor-not-allowed" : ""}
                      `}
          >
            <LogOutIcon size={18} />
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ to, icon, text, active = false, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
      ${
        active
          ? "bg-[#3b82f6] text-white shadow-md shadow-blue-600/20"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      }
    `}
  >
    <span
      className={
        active ? "text-white" : "text-sidebar-foreground/50"
      }
    >
      {icon}
    </span>
    {text}
  </Link>
);

export default Sidebar;
