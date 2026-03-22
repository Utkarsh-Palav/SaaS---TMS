import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Layout/Sidebar";
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  PlusIcon,
  FilterIcon,
  DownloadIcon,
  UploadIcon,
  RefreshCcw,
  ListIcon,
  GridIcon,
  BellDot,
  Loader2,
  Plus,
  UserPlus,
  X,
  User,
  Menu,
  Bell,
} from "lucide-react";
import EmployeeDirectory from "@/components/Employee/EmployeeDirectory ";
import EmployeeStats from "@/components/Employee/EmployeeStats";
import DepartmentDistribution from "@/components/Employee/DepartmentDistribution ";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { toast as hotToast } from "react-hot-toast";
import socket from "@/utils/socket";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeptOption from "@/components/DeptOption";
import RoleSelect from "@/components/RoleSelect";
import { RxCross1 } from "react-icons/rx";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { useNotifications } from "@/context/NotificationContext";
import DepartmentsChart from "@/components/Dashboard/DepartmentsChart";
import ProfileImage from "@/components/ui/ProfileImage";
import ThemeToggle from "@/components/ui/ThemeToggle";

const EMPLOYEES_PER_PAGE = 6;

const calculatePercentageChange = (current, previous) => {
  // Check for invalid or zero previous value to avoid division by zero
  if (previous === 0 || !previous || !current) return "N/A";

  const change = ((current - previous) / previous) * 100;
  // Format to two decimal places and prepend '+' for positive change
  return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
};

const InputGroup = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
      {label} <span className="text-red-500">*</span>
    </label>
    {children}
  </div>
);

const EmployeesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleNotificationPanel, notifications } = useNotifications();

  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [countryCode, setCountryCode] = useState("+91");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNo: "",
    jobTitle: "",
    roleName: "",
    city: "",
    state: "",
    country: "",
    bio: "",
  });
  const [selectedDept, setSelectedDept] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [isCountriesLoading, setIsCountriesLoading] = useState(true);
  const [countries, setCountries] = useState([]);

  const [employeeCount, setEmployeeCount] = useState(null);
  const [newHiresCount, setNewHiresCount] = useState(0);
  const [yoyGrowthPercentage, setYoYGrowthPercentage] = useState("0.00%");
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(null);

  const [departmentCount, setDepartmentCount] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const getAllEmployee = async () => {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employeePage/analytics`,
        {
          withCredentials: true,
        }
      );

      const {
        totalEmployeeCount,
        newHiresThisMonth,
        activeEmployeeCount,
        employeeList,
      } = res.data;

      setEmployee(employeeList);
      setEmployeeCount(totalEmployeeCount);
      setNewHiresCount(newHiresThisMonth);
      setActiveEmployeeCount(activeEmployeeCount);
    } catch (error) {
      console.error("Error fetching employee", error);
      toast.error("Failed to fetch employee data.");
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentCount = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/employeePage/data1`,
      { withCredentials: true }
    );
    setDepartmentCount(res.data.data);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/employee/${id}`, {
        withCredentials: true,
      });
      toast.success("Employee deleted successfully");
      setEmployee((prev) => prev.filter((emp) => emp._id !== id));
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    const formFields = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "contactNo") {
        const cleanNumber = formData[key].replace(/[^0-9]/g, "");

        formFields.append(key, countryCode + cleanNumber);
      } else {
        formFields.append(key, formData[key]);
      }
    });

    try {
      const payload = {
        ...Object.fromEntries(formFields),
        departmentId: selectedDept.value,
        organizationId: user.organizationId,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/employee`,
        payload,
        {
          withCredentials: true,
        }
      );

      toast.success("Employee created successfully");
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        contactNo: "",
        jobTitle: "",
        roleName: "",
        city: "",
        state: "",
        country: "",
        bio: "",
      });
      setSelectedDept(null);
      setIsCreateDialogOpen(false);

      getAllEmployee();
    } catch (err) {
      console.error(err);
      if (
        err?.response?.data?.message?.includes("already registered") ||
        err?.response?.data?.message?.includes("duplicate")
      ) {
        hotToast.error("⚠️ This email is already registered!");
      } else {
        toast.error("Something went wrong while creating the employee");
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const clearSearchTerm = () => {
    setSearchTerm("");
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  // Memorized filter logic (from old Employees.jsx)
  const filteredEmployees = useMemo(() => {
    const lowerCasedTerm = searchTerm.toLowerCase();

    let filteredBySearch = employee.filter((emp) => {
      const firstNameMatch = emp.firstName
        ?.toLowerCase()
        .includes(lowerCasedTerm);
      const lastNameMatch = emp.lastName
        ?.toLowerCase()
        .includes(lowerCasedTerm);
      const roleMatch = emp.jobTitle?.toLowerCase().includes(lowerCasedTerm);
      const deptMatch = emp.departmentId?.name
        ?.toLowerCase()
        .includes(lowerCasedTerm);
      return firstNameMatch || lastNameMatch || roleMatch || deptMatch;
    });

    if (statusFilter !== "All") {
      filteredBySearch = filteredBySearch.filter(
        (emp) => emp.status === statusFilter
      );
    }

    return filteredBySearch;
  }, [searchTerm, employee, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE);

  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE;
  const endIndex = startIndex + EMPLOYEES_PER_PAGE;

  const employeesToDisplay = filteredEmployees.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Search feature
  const searchSuggestions = useMemo(() => {
    if (!searchTerm) return [];

    const lowerCasedTerm = searchTerm.toLowerCase();
    const suggestions = new Set();

    employee.forEach((emp) => {
      if (emp.username?.toLowerCase().includes(lowerCasedTerm)) {
        suggestions.add(emp.username);
      }
      if (emp.jobTitle?.toLowerCase().includes(lowerCasedTerm)) {
        suggestions.add(emp.jobTitle);
      }
      if (emp.departmentId?.name?.toLowerCase().includes(lowerCasedTerm)) {
        suggestions.add(emp.departmentId.name);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }, [searchTerm, employee]);

  const inputClass =
    "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground";

  useEffect(() => {
    getAllEmployee();
    getDepartmentCount();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // We fetch only the fields we need: Name, Flags, and IDD (Phone Code)
        const response = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2"
        );

        const countryData = response.data
          .filter((country) => country.idd.root) // Filter out countries with no phone code
          .map((country) => {
            // Logic to handle codes like +1 (USA) vs +1242 (Bahamas)
            const root = country.idd.root;
            const suffix =
              country.idd.suffixes && country.idd.suffixes.length === 1
                ? country.idd.suffixes[0]
                : "";

            return {
              name: country.name.common,
              code: root + suffix,
              flag: country.flags.svg, // We can use SVG in custom UI, or emoji for native select
              emoji: country.flags.alt ? country.flag : "🏳️", // Fallback for flag emoji
              cca2: country.cca2, // Two letter code (e.g. IN, US)
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name)); // Sort Alphabetically

        setCountries(countryData);

        // Auto-select India (+91) if available, otherwise default to first
        const defaultCountry = countryData.find((c) => c.cca2 === "IN");
        if (defaultCountry) setCountryCode(defaultCountry.code);

        setIsCountriesLoading(false);
      } catch (error) {
        console.error("Failed to fetch countries", error);
        setIsCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const orgId = user?.organizationId?._id;

    if (!orgId) {
      console.log("Socket: Waiting for organization ID...");
      return;
    }

    const handleConnect = () => {
      socket.emit("joinOrgRoom", orgId);
    };

    const handleStatusUpdate = ({ userId, status }) => {
      console.log("📬 Status update received:", userId, status);
      setEmployee((prev) =>
        prev.map((emp) => (emp._id === userId ? { ...emp, status } : emp))
      );
    };

    const handleConnectError = (error) => {
      console.error("❌ Socket Connection Error:", error);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("statusUpdate", handleStatusUpdate);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [user?.organizationId?._id]);
  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
                >
                  <Menu size={24} />
                </button>
                <div className="flex flex-col items-center relative w-64">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 150)
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl leading-5 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      placeholder="Search by name, role, or department..."
                      type="text"
                      autoComplete="off"
                    />
                    {searchTerm?.length > 0 && (
                      <button
                        onClick={clearSearchTerm}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <RxCross1 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <ul className="absolute z-20 w-full mt-10 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 text-foreground cursor-pointer hover:bg-accent"
                          onMouseDown={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={toggleNotificationPanel}
                  className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
                >
                  <Bell size={22} />
                  {notifications?.length > 0 && (
                    <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse"></span>
                  )}
                </button>
              </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4 sm:mb-0">
              Employee Directory
            </h1>
            <div className="flex flex-wrap space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors">
                <UploadIcon className="h-4 w-4 mr-2" />
                Import
              </button>
              {user.role?.name === "Boss" && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
                      <Plus className="h-5 w-5 mr-2" /> Add Employee
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border shadow-2xl bg-card [&>button]:hidden">
                    <DialogHeader className="p-6 border-b border-border bg-muted/80 backdrop-blur-sm sticky top-0 z-50 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <UserPlus size={20} />
                        </div>
                        <div className="text-left">
                          <DialogTitle className="text-xl font-bold text-foreground">
                            Create New Employee
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground text-sm mt-0.5">
                            Enter the details to onboard a new team member.
                          </DialogDescription>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors -mr-2 -mt-2"
                      >
                        <X size={20} />
                      </button>
                    </DialogHeader>

                    {/* Form */}
                    <form
                      onSubmit={handleCreateSubmit}
                      className="p-6 space-y-6"
                    >
                      {/* Name Section */}
                      <div className="grid grid-cols-3 gap-4">
                        <InputGroup label="First Name">
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Jane"
                            className={inputClass}
                            required
                          />
                        </InputGroup>
                        <InputGroup label="Middle Name">
                          <input
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                            placeholder="M."
                            className={inputClass}
                          />
                        </InputGroup>
                        <InputGroup label="Last Name">
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            className={inputClass}
                            required
                          />
                        </InputGroup>
                      </div>

                      {/* Contact Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputGroup label="Email Address">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="jane@company.com"
                            className={inputClass}
                            required
                          />
                        </InputGroup>

                        <InputGroup label="Phone Number">
                          <div className="flex gap-2">
                            <div className="relative w-24 shrink-0">
                              <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                disabled={isCountriesLoading}
                                className={`${inputClass} pr-6 appearance-none cursor-pointer`}
                              >
                                {isCountriesLoading ? (
                                  <option>...</option>
                                ) : (
                                  countries.map((c) => (
                                    <option key={c.cca2} value={c.code}>
                                      {c.code}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            <input
                              type="tel"
                              name="contactNo"
                              value={formData.contactNo}
                              onChange={handleChange}
                              placeholder="98765 43210"
                              className={inputClass}
                              required
                            />
                          </div>
                        </InputGroup>
                      </div>

                      {/* Role Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputGroup label="Department">
                          <div className="[&>select]:w-full [&>select]:px-3 [&>select]:py-2.5 [&>select]:bg-background [&>select]:border [&>select]:border-border [&>select]:rounded-xl [&>select]:text-sm [&>select]:focus:outline-none [&>select]:focus:ring-2 [&>select]:focus:ring-primary/20">
                            {/* Pass props to your DeptOption component */}
                            <DeptOption
                              selectedDept={selectedDept}
                              setSelectedDept={setSelectedDept}
                            />
                          </div>
                        </InputGroup>
                        <InputGroup label="Job Title">
                          <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            placeholder="e.g. Senior Developer"
                            className={inputClass}
                            required
                          />
                        </InputGroup>
                      </div>

                      <InputGroup label="System Role">
                        <RoleSelect
                          value={formData.roleName}
                          onChange={(roleName) =>
                            setFormData((prev) => ({ ...prev, roleName }))
                          }
                          className={inputClass}
                          required
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Predefined roles from your organization settings.
                          Defines their permissions in the system.
                        </p>
                      </InputGroup>

                      {/* Location Section */}
                      <div className="p-4 bg-muted rounded-xl border border-border">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                          Location Details
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className={`bg-card ${inputClass}`}
                          />
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            className={`bg-card ${inputClass}`}
                          />
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Country"
                            className={`bg-card ${inputClass}`}
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Bio (Optional)
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Short description about the employee..."
                          className={`min-h-20 resize-y ${inputClass}`}
                        />
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-border flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createLoading}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
                        >
                          {createLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Creating...
                            </>
                          ) : (
                            "Create Employee"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <EmployeeStats
            totalEmployee={employeeCount}
            employeeIncresed={yoyGrowthPercentage}
            newHires={newHiresCount}
            activeEmployee={activeEmployeeCount}
          />
          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="lg:col-span-1">
              <DepartmentsChart departmentCounts={departmentCount} />
            </div>
            <div className="lg:col-span-2">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center p-1 bg-secondary rounded-lg">
                  <button
                    onClick={() => setView("grid")}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      view === "grid"
                        ? "text-primary bg-card shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <GridIcon className="h-5 w-5 mr-1" />
                    Grid
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      view === "list"
                        ? "text-primary bg-card shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ListIcon className="h-5 w-5 mr-1" />
                    List
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center px-3 py-1.5 border border-border text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors">
                        <FilterIcon className="h-4 w-4 mr-1" />
                        {statusFilter === "All" ? "Filter" : statusFilter}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-card shadow-lg rounded-lg p-1 border border-border"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => handleStatusFilter("All")}
                          className="cursor-pointer hover:bg-accent p-2 rounded-md"
                        >
                          All Employees
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-accent p-2 rounded-md"
                          onClick={() => handleStatusFilter("Active")}
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-accent p-2 rounded-md"
                          onClick={() => handleStatusFilter("Inactive")}
                        >
                          Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-accent p-2 rounded-md"
                          onClick={() => handleStatusFilter("On Leave")}
                        >
                          On Leave
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    onClick={getAllEmployee}
                    className="inline-flex items-center px-3 py-1.5 border border-border text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors"
                    disabled={loading}
                  >
                    <RefreshCcw
                      className={`h-4 w-4 mr-1 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
              </div>
              <EmployeeDirectory
                view={view}
                employees={employee}
                loading={loading}
                searchTerm={searchTerm}
                handleDelete={handleDelete}
                filteredEmployees={filteredEmployees}
                employeesToDisplay={employeesToDisplay}
                currentPage={currentPage}
                totalPages={totalPages}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
              />
            </div>
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};
export default EmployeesPage;
