import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Save,
  Bell,
  Menu,
  PenSquare,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Shield,
  Hash,
  MessageSquare,
  Building,
  AlertCircle
} from "lucide-react";
import Sidebar from "@/components/Layout/Sidebar";
import axios from "axios";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO } from "date-fns";
import AnimatedContent from "@/components/ui/AnimatedContent";

const EmpDetails = () => {
  const { user } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [activityLog, setActivityLog] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const getEmployee = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee/${id}`,
        { withCredentials: true }
      );
      setEmployeeData(res.data.user);
      setActivityLog(res.data.activityLog);
      setTaskDetails(res.data.taskDetails);
      setTaskList(res.data.taskList || []);
    } catch (error) {
      console.error("Error fetching employee:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployee(employeeId);
  }, [employeeId]);

  const getInitials = (name) => name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "??";
  
  const formatHours = (seconds) => {
    if (!seconds) return "0.0";
    return `${(seconds / 3600).toFixed(1)}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "In Progress": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Pending": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Overdue": return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
           <p className="text-muted-foreground font-medium animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg">
              <Menu size={24} />
            </button>
            <button onClick={() => navigate("/employees")} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Team
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleNotificationPanel} className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
              <Bell size={22} />
              {notifications?.length > 0 && <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse"></span>}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* 1. UNIFIED PROFILE CARD */}
            <AnimatedContent direction="vertical" distance={20}>
              <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden group">
                
                {/* Banner */}
                <div className="h-48 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 relative">
                   <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-size-[20px_20px] opacity-20"></div>
                   
                   <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-sm font-medium transition-all"
                      >
                         <PenSquare size={16} /> {isEditing ? "Cancel Editing" : "Edit Profile"}
                      </button>
                   </div>
                </div>
                
                <div className="px-8 pb-8">
                   <div className="flex flex-col lg:flex-row gap-6 relative">
                      
                      {/* Avatar */}
                      <div className="-mt-16 shrink-0 flex flex-col items-center lg:items-start relative z-10">
                         <div className="h-32 w-32 rounded-full p-1 bg-card shadow-xl ring-4 ring-card relative">
                            {employeeData?.profileImage ? (
                               <img src={employeeData.profileImage} alt="Profile" className="h-full w-full rounded-full object-cover" />
                            ) : (
                               <div className="h-full w-full rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
                                  {getInitials(employeeData?.firstName)}
                               </div>
                            )}
                            <span className="absolute bottom-2 right-2 h-5 w-5 bg-emerald-500 border-4 border-card rounded-full" title="Active"></span>
                         </div>
                      </div>

                      {/* Name & Info */}
                      <div className="flex-1 pt-4 text-center lg:text-left">
                         <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div>
                               <h1 className="text-3xl font-bold text-foreground tracking-tight">{employeeData?.firstName}{" "}{employeeData?.lastName}</h1>
                               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2 text-muted-foreground font-medium text-sm">
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    <Briefcase size={14} /> {employeeData?.jobTitle}
                                  </span>
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                                    <Building size={14} /> {employeeData?.departmentId?.name || "No Dept"}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <MapPin size={14} /> {employeeData?.city || "Remote"}, {employeeData?.country}
                                  </span>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                               <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                  <MessageSquare size={18} /> Message
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border">
                      <ProfileStat 
                        label="Tasks Done" 
                        value={taskDetails?.completedTaskCount || 0} 
                        icon={<CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400"/>} 
                        bgColor="bg-emerald-500/10"
                      />
                      <ProfileStat 
                        label="Active Tasks" 
                        value={taskDetails?.totalAssignedTasks || 0} 
                        icon={<Hash size={20} className="text-blue-600 dark:text-blue-400"/>} 
                        bgColor="bg-blue-500/10"
                      />
                      <ProfileStat 
                        label="Hours Logged" 
                        value={formatHours(activityLog?.durationInSeconds)} 
                        icon={<Clock size={20} className="text-amber-600 dark:text-amber-400"/>} 
                        bgColor="bg-amber-500/10"
                      />
                      <ProfileStat 
                        label="Last Active" 
                        value={activityLog?.loginTime ? format(parseISO(activityLog.loginTime), "MMM dd") : "N/A"} 
                        icon={<Calendar size={20} className="text-violet-600 dark:text-violet-400"/>} 
                        bgColor="bg-violet-500/10"
                      />
                   </div>
                </div>
              </div>
            </AnimatedContent>

            {/* Editing Form Overlay */}
            {isEditing && (
               <AnimatedContent>
                  <div className="bg-card rounded-2xl border border-primary/20 shadow-lg p-6 mb-6 ring-4 ring-primary/5 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                     <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <PenSquare className="text-primary" size={20} /> Edit Employee Information
                     </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Full Name" value={employeeData.username} onChange={(e) => setEmployeeData({...employeeData, username: e.target.value})} />
                        <InputField label="Job Title" value={employeeData.jobTitle} onChange={(e) => setEmployeeData({...employeeData, jobTitle: e.target.value})} />
                        <InputField label="Email Address" value={employeeData.email} onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})} type="email" />
                        <InputField label="Phone Number" value={employeeData.contactNo} onChange={(e) => setEmployeeData({...employeeData, contactNo: e.target.value})} />
                        <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Bio / Description</label>
                           <textarea 
                              className="w-full p-3 bg-muted border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24 text-foreground placeholder:text-muted-foreground"
                              value={employeeData.bio || ""}
                              onChange={(e) => setEmployeeData({...employeeData, bio: e.target.value})}
                              placeholder="Write a short bio..."
                           />
                        </div>
                     </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button 
                           onClick={() => setIsEditing(false)}
                           className="px-4 py-2.5 text-muted-foreground font-bold hover:bg-accent rounded-xl transition-all"
                        >
                           Cancel
                        </button>
                        <button 
                           onClick={() => setIsEditing(false)}
                           className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                           <Save size={18} /> Save Changes
                        </button>
                     </div>
                  </div>
               </AnimatedContent>
            )}

            {/* 2. MAIN LAYOUT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* LEFT COLUMN: Contact & Info */}
               <div className="space-y-6">
                  {/* Contact Card */}
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-fit">
                     <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Shield size={14} /> Contact Details
                     </h3>
                     <div className="space-y-5">
                        <ContactRow icon={<Mail size={16} />} label="Email" value={employeeData?.email} copyable />
                        <ContactRow icon={<Phone size={16} />} label="Phone" value={employeeData?.contactNo} />
                        <ContactRow icon={<MapPin size={16} />} label="Location" value={`${employeeData?.city || 'Unknown'}, ${employeeData?.country || ''}`} />
                        <ContactRow icon={<Calendar size={16} />} label="Joined Team" value={employeeData?.createdAt ? format(parseISO(employeeData.createdAt), "MMM d, yyyy") : "N/A"} />
                     </div>
                  </div>

                  {/* Skills Card */}
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-fit">
                     <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Skills & Expertise</h3>
                     <div className="flex flex-wrap gap-2">
                        {employeeData?.skills?.length > 0 ? (
                           employeeData.skills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-semibold border border-border hover:border-primary/30 hover:text-primary transition-colors cursor-default">
                                 {skill}
                              </span>
                           ))
                        ) : (
                           <p className="text-sm text-muted-foreground italic">No skills listed yet.</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* RIGHT COLUMN: Tasks & Bio */}
               <div className="lg:col-span-2 space-y-6">
                  
                  {/* About Section */}
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                     <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">About</h3>
                     <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                        {employeeData?.bio || "This user has not added a bio yet."}
                     </p>
                  </div>

                  {/* Tasks Table */}
                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                     <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                           <CheckCircle2 size={16} className="text-muted-foreground"/> Recent Tasks
                        </h3>
                        <button className="text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                           View All History
                        </button>
                     </div>
                     <div className="divide-y divide-border">
                        {taskList.length === 0 ? (
                           <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                 <Briefcase size={20} className="opacity-50" />
                              </div>
                              <p className="text-sm">No tasks assigned recently.</p>
                           </div>
                        ) : (
                           taskList.slice(0, 5).map((task) => (
                              <div key={task._id} className="p-4 hover:bg-primary/5 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/tasks/${task._id}`)}>
                                 <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl shadow-sm ${task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-card border border-border text-muted-foreground'}`}>
                                       {task.status === 'Completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{task.title}</h4>
                                       <div className="flex items-center gap-3 mt-1">
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                             <Calendar size={12} /> {task.deadline ? format(parseISO(task.deadline), "MMM dd") : "No Date"}
                                          </span>
                                          {task.priority === 'High' && (
                                             <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                                <AlertCircle size={10} /> High
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                                 <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusStyle(task.status)}`}>
                                    {task.status}
                                 </span>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

               </div>
            </div>

          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

// --- Sub-Components ---

const ProfileStat = ({ label, value, icon, bgColor }) => (
   <div className="flex flex-col items-center justify-center p-4 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all hover:shadow-md group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${bgColor}`}>
         {icon}
      </div>
      <span className="text-2xl font-extrabold text-foreground tracking-tight">{value}</span>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
   </div>
);

const InputField = ({ label, value, onChange, type = "text" }) => (
   <div>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      <input 
         type={type} 
         value={value || ""} 
         onChange={onChange}
         className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
      />
   </div>
);

const ContactRow = ({ icon, label, value }) => (
   <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-card group-hover:text-primary group-hover:shadow-sm transition-all border border-transparent group-hover:border-border shrink-0">
         {icon}
      </div>
      <div className="overflow-hidden">
         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
         <p className="text-sm font-semibold text-foreground truncate">{value || "Not set"}</p>
      </div>
   </div>
);

export default EmpDetails;