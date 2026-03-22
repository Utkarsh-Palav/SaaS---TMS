import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Users } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B",
  "#EC4899", "#6366F1", "#EF4444",
];

const transformDepartmentData = (departmentCounts) => {
  if (!departmentCounts || departmentCounts.length === 0) return [];
  return departmentCounts.map((item) => ({
    name: item.departmentName,
    value: item.employeeCount || 0,
  }));
};

const DepartmentsChart = ({ departmentCounts }) => {
  const data = departmentCounts ? transformDepartmentData(departmentCounts) : [];
  const totalEmployees = data.reduce((acc, curr) => acc + curr.value, 0);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (totalEmployees === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 h-[400px] flex flex-col items-center justify-center text-center card-hover">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Users className="text-muted-foreground" size={32} />
        </div>
        <h3 className="text-foreground font-semibold">No Data Available</h3>
        <p className="text-muted-foreground text-sm mt-1">Add employees to see department distribution.</p>
      </div>
    );
  }

  const tooltipBg = isDark ? "#1c1c1c" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 h-[400px] flex flex-col relative card-hover">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="text-primary" size={20} />
            Department Split
          </h2>
          <p className="text-sm text-muted-foreground">Employee distribution by team</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={6} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: `1px solid ${tooltipBorder}`,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                backgroundColor: tooltipBg,
                color: isDark ? "#e8e6e3" : "#1e293b",
              }}
              itemStyle={{ color: isDark ? "#e8e6e3" : "#1e293b", fontWeight: 600 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748B" }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
          <span className="block text-3xl font-extrabold text-foreground">{totalEmployees}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Employees</span>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsChart;