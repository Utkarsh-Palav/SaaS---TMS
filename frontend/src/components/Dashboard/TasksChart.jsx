import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Filter, BarChart3 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const getMonthName = (monthNumber) => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleString("en-US", { month: "short" });
};

const TasksChart = ({ monthlyTaskCompletion }) => {
  const [filter, setFilter] = useState("This year");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const displayData = useMemo(() => {
    const transformedData = monthlyTaskCompletion.map((item) => ({
      name: getMonthName(item.month),
      month: item.month,
      Completed: item.Completed,
      Active: item.Active,
      Pending: item.Pending,
    }));

    if (filter === "Last 6 months") {
      return [...transformedData].sort((a, b) => a.month - b.month).slice(-6);
    }
    return transformedData;
  }, [monthlyTaskCompletion, filter]);

  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0";
  const tickColor = isDark ? "#94a3b8" : "#64748B";
  const tooltipBg = isDark ? "#1c1c1c" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const cursorFill = isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9";

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 h-[400px] flex flex-col card-hover">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="text-primary" size={20} />
            Task Analytics
          </h2>
          <p className="text-sm text-muted-foreground">Completion overview over time</p>
        </div>

        <div className="relative">
          <select
            className="appearance-none bg-muted border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8 cursor-pointer transition-colors"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>This year</option>
            <option>Last 6 months</option>
            <option>Last 12 months</option>
          </select>
          <Filter className="absolute right-2.5 top-3 text-muted-foreground pointer-events-none" size={16} />
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: cursorFill }}
              contentStyle={{
                borderRadius: "12px",
                border: `1px solid ${tooltipBorder}`,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                backgroundColor: tooltipBg,
                color: isDark ? "#e8e6e3" : "#1e293b",
              }}
              itemStyle={{ color: isDark ? "#e8e6e3" : "#1e293b" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px", color: tickColor }} iconType="circle" />
            <Bar dataKey="Completed" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} maxBarSize={50} />
            <Bar dataKey="Active" stackId="a" fill="#10B981" />
            <Bar dataKey="Pending" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TasksChart;