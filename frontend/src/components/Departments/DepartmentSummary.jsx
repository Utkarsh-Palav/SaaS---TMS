import React, { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  BarChart3,
  Users,
  User,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const DepartmentSummary = ({ departmentId, onDelete, isManager }) => {
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/department/details/${departmentId}`,
          { withCredentials: true }
        );
        console.log(res.data);
        setDept(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [departmentId]);

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center bg-card rounded-2xl border border-border">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (!dept) return null;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
  });

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex justify-between items-start bg-muted/50">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm">
            <Building2 className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{dept.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              {dept.description || "No description provided."}
            </p>
          </div>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <Link to={`/department/${dept._id}`}>
              <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <Edit size={18} />
              </button>
            </Link>
            <button
              onClick={onDelete}
              className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border divide-x divide-border">
        <StatBox
          label="Headcount"
          value={dept.totalEmployees}
          icon={<Users size={18} className="text-primary" />}
        />
        <StatBox
          label="Teams"
          value={dept.teams?.length || 0}
          icon={<Building2 size={18} className="text-indigo-500" />}
        />
        <StatBox
          label="Budget"
          value={formatter.format(dept.budget || 0)}
          icon={<BarChart3 size={18} className="text-emerald-500" />}
        />
        <StatBox
          label="Created"
          value={format(new Date(dept.createdAt), "MMM yyyy")}
          icon={<Calendar size={18} className="text-purple-500" />}
        />
      </div>

      {/* Manager Section */}
      <div className="p-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Department Lead
        </h3>
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border">
          {dept.manager?.profileImage ? (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-background shadow-sm">
              <img src={dept.manager?.profileImage} alt={dept.manager?.firstName} className="w-full h-full rounded-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-background shadow-sm">
              {dept.manager?.firstName?.[0] || "?"}
            </div>
          )}

          <div>
            {dept.manager ? (
              <p className="text-sm font-bold text-foreground">
                {dept.manager.firstName} {dept.manager.lastName}
              </p>
            ) : (
              <p className="text-sm font-bold text-foreground">Unassigned</p>
            )}

            <p className="text-xs text-muted-foreground">
              {dept.manager?.email || "No email"}
            </p>
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div className="p-6 pt-0">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Teams
        </h3>
        <div className="flex flex-wrap gap-2">
          {dept.teams?.length > 0 ? (
            dept.teams.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium text-foreground shadow-sm"
              >
                {t.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No teams created yet.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon }) => (
  <div className="p-4 flex flex-col items-center justify-center text-center hover:bg-accent/50 transform-style-3d hover:scale-110 transition-transform duration-500 ease-out group">
    <div className="mb-2">{icon}</div>
    <span className="text-lg font-bold text-foreground">{value}</span>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
  </div>
);

export default DepartmentSummary;
