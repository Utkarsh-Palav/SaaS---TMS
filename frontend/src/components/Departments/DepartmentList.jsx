import React from "react";
import { ChevronRight, Loader2, Users } from "lucide-react";

const DepartmentList = ({ loading, departments, selectedId, onSelect }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
       <div className="p-8 text-center text-muted-foreground text-sm">No departments found.</div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {departments.map((dept) => (
        <li key={dept._id}>
          <button
            onClick={() => onSelect(dept._id)}
            className={`w-full text-left px-5 py-4 flex items-center justify-between transition-all duration-200 group
              ${selectedId === dept._id ? "bg-primary/10 border-l-4 border-primary pl-4" : "hover:bg-accent border-l-4 border-transparent"}
            `}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 transition-colors
                 ${selectedId === dept._id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground group-hover:bg-card group-hover:shadow-sm border border-transparent group-hover:border-border"}
              `}>
                 {dept.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                 <p className={`text-sm font-semibold truncate ${selectedId === dept._id ? "text-foreground" : "text-foreground/80"}`}>
                    {dept.name}
                 </p>
                 <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Users size={12} /> {dept.totalEmployees || 0} Members
                 </p>
              </div>
            </div>
            <ChevronRight size={16} className={`transition-transform ${selectedId === dept._id ? "text-primary translate-x-1" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`} />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default DepartmentList;