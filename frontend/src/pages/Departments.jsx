import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Search,
  Menu,
  Bell,
  ArrowRight,
  Loader2
} from "lucide-react";
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
import DepartmentList from "@/components/Departments/DepartmentList";
import DepartmentSummary from "@/components/Departments/DepartmentSummary";
import DepartmentEmployeeDistribution from "@/components/Departments/DepartmentEmployeeDistribution";
import ThemeToggle from "@/components/ui/ThemeToggle";

const Departments = () => {
  const { user } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();
  const navigate = useNavigate();

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Data States
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form States
  const [newDeptData, setNewDeptData] = useState({ name: "", description: "", budget: "" });

  const isManagerOrBoss = user?.role?.name === "Boss" || user?.role?.name === "Manager";

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/department/details`,
        { withCredentials: true }
      );
      const data = Array.isArray(res.data) ? res.data : res.data.departments || [];
      setDepartments(data);
      
      if (data.length > 0 && !selectedDepartmentId) {
         setSelectedDepartmentId(data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/department`,
        newDeptData,
        { withCredentials: true }
      );
      toast.success("Department created successfully");
      setIsCreateOpen(false);
      setNewDeptData({ name: "", description: "", budget: "" });
      fetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create department");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
     if(!window.confirm("Are you sure? This action cannot be undone.")) return;
     try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/department/${id}`, { withCredentials: true });
        toast.success("Department deleted");
        setDepartments(prev => prev.filter(d => d._id !== id));
        if(selectedDepartmentId === id) setSelectedDepartmentId(null);
     } catch(e) { toast.error("Delete failed") }
  }

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                 <Building2 className="text-primary" size={24} /> Departments
              </h1>
           </div>
           <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={toggleNotificationPanel} className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
                 <Bell size={22} />
                 {notifications?.length > 0 && <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse"></span>}
              </button>
           </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search departments..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>

               {isManagerOrBoss && (
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                     <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                           <Plus size={18} className="mr-2" /> New Department
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader>
                           <DialogTitle>Create Department</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground uppercase">Name</label>
                              <input 
                                className="w-full p-2.5 border border-border bg-background rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                                placeholder="e.g. Engineering"
                                value={newDeptData.name} onChange={e => setNewDeptData({...newDeptData, name: e.target.value})} required
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                              <textarea 
                                className="w-full p-2.5 border border-border bg-background rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-20" 
                                placeholder="What does this team do?"
                                value={newDeptData.description} onChange={e => setNewDeptData({...newDeptData, description: e.target.value})}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground uppercase">Budget ($)</label>
                              <input 
                                type="number"
                                className="w-full p-2.5 border border-border bg-background rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                                placeholder="0"
                                value={newDeptData.budget} onChange={e => setNewDeptData({...newDeptData, budget: e.target.value})}
                              />
                           </div>
                           <Button type="submit" disabled={isCreating} className="w-full bg-primary hover:bg-primary/90 mt-4">
                              {isCreating ? <Loader2 className="animate-spin mr-2"/> : "Create Department"}
                           </Button>
                        </form>
                     </DialogContent>
                  </Dialog>
               )}
            </div>

            {/* Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
               
               {/* List (Left) */}
               <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
                  <div className="p-4 border-b border-border bg-muted/50">
                     <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">All Departments</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                     <DepartmentList 
                        departments={filteredDepartments} 
                        loading={loading}
                        selectedId={selectedDepartmentId}
                        onSelect={setSelectedDepartmentId}
                     />
                  </div>
               </div>

               {/* Details (Right) */}
               <div className="lg:col-span-2 overflow-y-auto scrollbar-hide space-y-6 pb-2">
                  {selectedDepartmentId ? (
                     <>
                        <DepartmentSummary 
                           departmentId={selectedDepartmentId} 
                           onDelete={() => handleDelete(selectedDepartmentId)}
                           isManager={isManagerOrBoss}
                        />
                        <DepartmentEmployeeDistribution departmentId={selectedDepartmentId} />
                     </>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-card rounded-2xl border border-border border-dashed">
                        <Building2 size={48} className="mb-4 opacity-50" />
                        <p>Select a department to view details.</p>
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

export default Departments;