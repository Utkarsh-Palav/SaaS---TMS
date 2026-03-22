// DepartmentDistribution.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { BuildingIcon } from "lucide-react";

const DepartmentDistribution = () => {
  const data = [
    {
      name: "Engineering",
      value: 42,
      color: "#4F46E5",
    },
    {
      name: "Marketing",
      value: 21,
      color: "#10B981",
    },
    {
      name: "Sales",
      value: 25,
      color: "#F59E0B",
    },
    {
      name: "HR",
      value: 12,
      color: "#EC4899",
    },
    {
      name: "Finance",
      value: 16,
      color: "#6366F1",
    },
    {
      name: "Design",
      value: 12,
      color: "#8B5CF6",
    },
  ];
  return (
    <div className="bg-card shadow rounded-lg overflow-hidden h-full border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-medium text-foreground flex items-center">
          <BuildingIcon className="h-5 w-5 mr-2 text-muted-foreground" />
          Department Distribution
        </h2>
      </div>
      <div className="px-6 py-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <ul className="space-y-2">
            {data.map((dept, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: dept.color,
                    }}
                  ></span>
                  <span className="text-sm text-muted-foreground">{dept.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {dept.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="px-6 py-4 bg-muted/50 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium">
          View All Departments
        </button>
      </div>
    </div>
  );
};

export default DepartmentDistribution;
