import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeptOption from "../DeptOption"; 
import { Plus, Trash2, Calendar, Flag, Layers, CheckCircle2 } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

const TaskCreateDialog = ({
  open,
  setOpen,
  taskData,
  setTaskData,
  selectedDepartment,
  setSelectedDepartment,
  hasManager,
  setHasManager,
  mileStoneInput,
  setMileStoneInput,
  handleCreateTask,
  loading,
  toast,
}) => {
  
  const { addNotification } = useNotifications();

  // --- Handlers ---

  const handleMilestoneAdd = () => {
    if (mileStoneInput.trim()) {
      setTaskData((prev) => ({
        ...prev,
        milestones: [...prev.milestones, { title: mileStoneInput.trim(), completed: false }],
      }));
      setMileStoneInput("");
    }
  };

  const handleMilestoneDelete = (index) => {
    const updated = taskData.milestones.filter((_, i) => i !== index);
    setTaskData({ ...taskData, milestones: updated });
  };

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
    if (dept?.manager) {
      setTaskData((prev) => ({
        ...prev,
        department: dept.value,
        assignedManager: dept.manager._id,
      }));
      setHasManager(true);
    } else {
      setTaskData((prev) => ({ ...prev, department: dept.value, assignedManager: "" }));
      setHasManager(false);
      toast.warning("This department has no manager assigned.");
    }
  };

  const onSubmitWrapper = async (e) => {
    e.preventDefault();
    
    if (!taskData?.title || !taskData?.department || !hasManager) {
        toast.error("Please fill in all required fields correctly.");
        return;
    }

    try {
        await handleCreateTask(e);

        addNotification({
            title: "Task Created",
            message: `Task "${taskData.title}" was successfully assigned to ${selectedDepartment?.label}.`,
            type: "task",
            timestamp: new Date().toISOString(),
            meta: { department: selectedDepartment?.label }
        });

    } catch (error) {
        console.error("Task creation failed", error);
    }
  };

  const isFormInvalid = !taskData?.title || !taskData?.description || !taskData?.deadline || !taskData?.department || !hasManager;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm">
          <Plus size={18} /> New Task
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card p-0 gap-0 rounded-2xl border-border shadow-2xl">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
             <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Layers size={20} /> 
             </div>
             Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmitWrapper} className="p-6 space-y-5">
          
          {/* Title Input */}
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Task Title <span className="text-rose-500">*</span></label>
             <input
                type="text"
                placeholder="e.g. Redesign Homepage"
                value={taskData?.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                className="w-full p-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground"
                required
             />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description <span className="text-rose-500">*</span></label>
             <textarea
                placeholder="Add details about the task..."
                value={taskData?.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                className="w-full p-3 bg-muted border border-border rounded-xl text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y text-foreground placeholder:text-muted-foreground"
                required
             />
          </div>

          {/* Grid for Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             {/* Department */}
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department <span className="text-rose-500">*</span></label>
                <DeptOption
                   selectedDept={selectedDepartment}
                   setSelectedDept={handleDepartmentChange}
                />
                {selectedDepartment?.manager ? (
                   <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1.5 font-bold bg-emerald-500/10 px-2 py-1 rounded-md w-fit">
                      <CheckCircle2 size={12}/> Manager: {selectedDepartment.manager.firstName}
                   </p>
                ) : selectedDepartment && (
                   <p className="text-xs text-rose-500 mt-1 font-medium">No manager assigned.</p>
                )}
             </div>

             {/* Priority */}
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                   <Flag size={12}/> Priority
                </label>
                <div className="relative">
                    <select
                        value={taskData?.priority}
                        onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                        className="w-full p-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none text-foreground"
                    >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                </div>
             </div>

             {/* Deadline */}
             <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                   <Calendar size={12}/> Due Date <span className="text-rose-500">*</span>
                </label>
                <input
                   type="date"
                   value={taskData?.deadline}
                   onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
                   className="w-full p-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer text-foreground"
                   required
                   min={new Date().toISOString().split("T")[0]}
                />
             </div>
          </div>

          {/* Milestones Section */}
          <div className="bg-muted p-4 rounded-xl border border-border">
             <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Milestones (Optional)</label>
             
             <div className="flex gap-2 mb-3">
                <input
                   type="text"
                   placeholder="Add a sub-task or milestone..."
                   className="flex-1 p-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-card focus:ring-2 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground"
                   value={mileStoneInput}
                   onChange={(e) => setMileStoneInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleMilestoneAdd())}
                />
                <button
                   type="button"
                   onClick={handleMilestoneAdd}
                   disabled={!mileStoneInput.trim()}
                   className="p-2.5 bg-card border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-primary disabled:opacity-50 transition-all active:scale-95"
                >
                   <Plus size={18} />
                </button>
             </div>

             {/* List */}
             {taskData?.milestones.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                   {taskData.milestones.map((ms, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-300">
                         <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-[10px] text-muted-foreground font-bold shrink-0">{idx + 1}</span>
                            <span className="text-sm text-foreground truncate">{ms.title}</span>
                         </div>
                         <button
                            type="button"
                            onClick={() => handleMilestoneDelete(idx)}
                            className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   ))}
                </div>
             ) : (
                <p className="text-xs text-muted-foreground text-center py-2 italic">No milestones added yet.</p>
             )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
             <Button
                type="submit"
                disabled={isFormInvalid || loading}
                className={`w-full h-12 font-bold rounded-xl text-base transition-all ${
                   isFormInvalid 
                   ? "bg-muted text-muted-foreground cursor-not-allowed" 
                   : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 active:scale-95"
                }`}
             >
                {loading ? "Creating Task..." : "Create Task"}
             </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreateDialog;