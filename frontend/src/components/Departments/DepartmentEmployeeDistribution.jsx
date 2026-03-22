import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import axios from "axios";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

const DepartmentEmployeeDistribution = ({ departmentId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!departmentId) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/department/details/${departmentId}`,
          { withCredentials: true }
        );
        const teams = res.data.teams || [];
        const chartData = teams.map((t, i) => ({
           name: t.name,
           count: t.members.length,
           fill: COLORS[i % COLORS.length]
        }));
        setData(chartData);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [departmentId]);

  if(!departmentId || data.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 h-[350px] flex flex-col">
       <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Team Size Distribution</h3>
       <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data} margin={{top: 5, right: 5, bottom: 5, left: -20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} />
             </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};

export default DepartmentEmployeeDistribution;