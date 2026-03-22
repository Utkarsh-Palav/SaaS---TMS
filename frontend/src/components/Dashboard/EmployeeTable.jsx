import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";

const EMPLOYEES_PER_PAGE = 11;

const EmployeeTable = ({ onStatsCalculated }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/employee/all-employee`,
          { withCredentials: true }
        );
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    setCurrentPage(1);
    return employees.filter(
      (employee) =>
        employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.departmentId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE);
  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE;
  const employeesToDisplay = filteredEmployees.slice(
    startIndex,
    startIndex + EMPLOYEES_PER_PAGE
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "On Leave":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Terminated":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center bg-card rounded-2xl border border-border shadow-sm">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (error)
    return (
      <div className="h-64 flex items-center justify-center bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive">
        {error}
      </div>
    );

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="text-primary" size={20} />
            Team Members
          </h2>
          <p className="text-sm text-muted-foreground hidden sm:block">
            {employees.length} total employees
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-muted border border-border rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {["Employee", "Role", "Department", "Status", ""].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider first:pl-6 last:pr-6"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employeesToDisplay.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-muted-foreground text-sm"
                >
                  No results found.
                </td>
              </tr>
            ) : (
              employeesToDisplay.map((emp) => (
                <tr
                  key={emp._id}
                  className="group hover:bg-primary/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {emp.profileImage ? (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                          <img src={emp.profileImage} alt={emp.firstName} className="rounded-full h-full w-full object-cover"/>
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                          {emp.firstName?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="font-semibold text-foreground text-sm">
                          {emp.firstName}{" "}{emp.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {emp.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium text-xs border border-border">
                      {emp.departmentId?.name || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusClass(
                        emp.status
                      )}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/employees/${emp._id}`}
                      className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-lg inline-block"
                    >
                      <MoreHorizontal size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-border bg-muted/50 flex items-center justify-between rounded-b-2xl">
        <span className="text-xs text-muted-foreground font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;
