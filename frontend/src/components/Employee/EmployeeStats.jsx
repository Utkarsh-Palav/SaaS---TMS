// EmployeeStats.jsx
import React, { useEffect, useState } from "react";
import {
  UsersIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCheckIcon,
} from "lucide-react";

const calculatePercentage = (part, whole) => {
  if (whole === 0 || !whole) {
    return "0.00%";
  }
  const percentage = (part / whole) * 100;
  return percentage.toFixed(2) + "%";
};

const EmployeeStats = ({
  totalEmployee,
  employeeIncresed,
  newHires,
  activeEmployee,
}) => {
  // New Hire Percentage
  const newHirePercentage = calculatePercentage(newHires, totalEmployee);
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Employees"
        value={totalEmployee}
        change={employeeIncresed}
        trend="up"
        icon={<UsersIcon className="h-6 w-6 text-primary" />}
        bgColor="bg-primary/10 border border-primary/20"
      />
      <StatCard
        title="New Hires"
        value={newHires}
        change={newHirePercentage}
        trend="up"
        icon={<UserPlusIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        bgColor="bg-emerald-500/10 border border-emerald-500/20"
      />
      <StatCard
        title="Active"
        value={activeEmployee}
        change="+8%"
        trend="up"
        icon={<UserCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        bgColor="bg-indigo-500/10 border border-indigo-500/20"
      />
      <StatCard
        title="Turnover Rate"
        value="5.2%"
        change="-2.1%"
        trend="down"
        icon={<UserMinusIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
        bgColor="bg-amber-500/10 border border-amber-500/20"
      />
    </div>
  );
};
const StatCard = ({ title, value, change, trend, icon, bgColor }) => {
  return (
    <div className="bg-card border border-border overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${bgColor}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-foreground">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 px-5 py-3 border-t border-border">
        <div className="text-sm">
          <div className="flex items-center">
            {trend === "up" ? (
              <svg
                className="w-5 h-5 text-emerald-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-rose-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`text-sm font-medium ${
                trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              } ml-1`}
            >
              {change} from last quarter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeStats;
