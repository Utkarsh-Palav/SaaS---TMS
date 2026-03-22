import React, { useState, useRef, useEffect } from "react";
import { 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ListFilter, 
  ArrowDownWideNarrow, 
  ArrowUpNarrowWide,
  X,
  Check
} from "lucide-react";

const TaskFilters = ({ activeFilter, setActiveFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setActiveFilter(value);
    setIsOpen(false);
  };

  const FilterOption = ({ label, value, icon, color }) => (
    <button
      onClick={() => handleSelect(value)}
      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all ${
        activeFilter === value 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`${activeFilter === value ? "text-primary" : color || "text-muted-foreground"}`}>
          {icon}
        </span>
        {label}
      </div>
      {activeFilter === value && <Check size={16} className="text-primary" />}
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
          activeFilter !== "All"
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
        }`}
      >
        <Filter size={16} />
        <span>Filter</span>
        {activeFilter !== "All" && (
          <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full ml-1">
            1
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border z-50 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          <div className="px-3 py-2 flex items-center justify-between border-b border-border mb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter Tasks</span>
            {activeFilter !== "All" && (
                <button 
                    onClick={(e) => { e.stopPropagation(); handleSelect("All"); }}
                    className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium flex items-center gap-1"
                >
                    <X size={12} /> Clear
                </button>
            )}
          </div>

          <div className="space-y-1 py-1">
            <FilterOption label="All Tasks" value="All" icon={<ListFilter size={16}/>} />
          </div>

          <div className="my-2 border-t border-border"></div>
          <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Status</span>
          
          <div className="space-y-1">
            <FilterOption label="Pending" value="Pending" icon={<Clock size={16}/>} color="text-muted-foreground" />
            <FilterOption label="In Progress" value="In Progress" icon={<Clock size={16}/>} color="text-amber-500" />
            <FilterOption label="Completed" value="Completed" icon={<CheckCircle2 size={16}/>} color="text-emerald-500" />
            <FilterOption label="Overdue" value="Overdue" icon={<AlertCircle size={16}/>} color="text-rose-500" />
          </div>

          <div className="my-2 border-t border-border"></div>
          <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Priority</span>

          <div className="space-y-1">
            <FilterOption label="High Priority" value="High" icon={<ArrowUpNarrowWide size={16}/>} color="text-rose-500" />
            <FilterOption label="Medium Priority" value="Medium" icon={<ArrowDownWideNarrow size={16}/>} color="text-amber-500" />
            <FilterOption label="Low Priority" value="Low" icon={<ArrowDownWideNarrow size={16}/>} color="text-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;