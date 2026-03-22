// EmployeeDirectory.jsx
import React from "react";
import { BuildingIcon } from "lucide-react";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ExternalLinkIcon,
  Trash2Icon,
  EditIcon,
  MessageSquareIcon,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "on leave":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getInitials = (username) => {
  if (!username) return "";
  return username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const DeleteDialog = ({ employee, handleDelete }) => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center">
        <Trash2Icon className="h-4 w-4" />
      </button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px] bg-card text-foreground">
      <DialogHeader>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete{" "}
          <span className="font-semibold">{employee.firstName}{" "}{employee.lastName}</span>? This
          action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div className="flex justify-end gap-3 pt-4">
        <DialogTrigger asChild>
          <Button variant="outline">Cancel</Button>
        </DialogTrigger>
        <Button
          variant="destructive"
          onClick={() => handleDelete(employee._id)}
        >
          Delete
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const EmployeeCard = ({ employee, user, navigate, handleDelete }) => {
  const initials = getInitials(employee.firstName);
  const statusClasses = getStatusStyles(employee.status);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 flex flex-col items-center">
        {employee?.profileImage ? (
          <img
            className="h-24 w-24 rounded-full mb-4 object-cover"
            src={employee.profileImage}
            alt={employee.firstName}
          />
        ) : (
          <div className="h-24 w-24 rounded-full mb-4 bg-primary/20 text-primary flex items-center justify-center text-3xl font-bold">
            {initials}
          </div>
        )}

        <h3 className="text-lg font-medium text-foreground">
          {employee.firstName}{" "}{employee.lastName}
        </h3>
        <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
        <span
          className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses}`}
        >
          {employee.status}
        </span>
      </div>
      <div className="border-t border-border px-4 py-3 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <MailIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground/80" />
          <p className="truncate">{employee.email}</p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <PhoneIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground/80" />
          <p>{employee.contactNo || "—"}</p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <BuildingIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground/80" />
          <p>{employee.departmentId?.name || "—"}</p>
        </div>
      </div>
      <div className="border-t border-border bg-muted/50 px-4 py-3 flex justify-around">
        <Link to={"/messages"}>
          <button className="text-sm font-medium text-primary hover:text-primary/80 flex items-center">
            <MessageSquareIcon className="h-4 w-4" />
          </button>
        </Link>
        {user.role?.name === "Boss" && (
          <>
            <button
              onClick={() => navigate(`/employees/${employee._id}`)}
              className="text-sm font-medium text-green-600 hover:text-green-500 flex items-center"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <DeleteDialog employee={employee} handleDelete={handleDelete} />
          </>
        )}
      </div>
    </div>
  );
};

const EmployeeDirectory = ({
  view,
  employees,
  loading,
  searchTerm,
  filteredEmployees,
  employeesToDisplay,
  currentPage,
  totalPages,
  goToPreviousPage,
  goToNextPage,
  handleDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Loading employee data...</p>
      </div>
    );
  }

  if (employees.length > 0 && employeesToDisplay.length === 0) {
    return (
      <div className="p-6 bg-card border border-border shadow rounded-lg">
        <p className="text-muted-foreground text-center">
          {searchTerm
            ? "No employees found matching your search."
            : "No other employees found."}
        </p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-6 bg-card border border-border shadow rounded-lg">
        <p className="text-muted-foreground text-center">
          No employees found. Please create one.
        </p>
      </div>
    );
  }

  const EMPLOYEES_PER_PAGE = 6;
  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE;

  if (view === "grid") {
    return (
      <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
          {employeesToDisplay.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              user={user}
              navigate={navigate}
              handleDelete={handleDelete}
            />
          ))}
          {employeesToDisplay.length === 0 && (
            <div className="col-span-full py-4 text-center text-muted-foreground">
              No employees found on this page.
            </div>
          )}
        </div>
        {renderPaginationFooter({
          employeesToDisplay,
          filteredEmployees,
          currentPage,
          totalPages,
          goToPreviousPage,
          goToNextPage,
          startIndex,
        })}
      </div>
    );
  } else {
    // List View
    return (
      <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {employeesToDisplay.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-muted-foreground"
                  >
                    No employees found on this page.
                  </td>
                </tr>
              ) : (
                employeesToDisplay.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-accent transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {employee?.profileImage ? (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={employee.profileImage}
                              alt={employee.firstName}
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-full flex items-center justify-center text-sm font-medium text-foreground">
                            {getInitials(employee.firstName)}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {employee.firstName}{" "}{employee.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {employee.jobTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {employee.departmentId?.name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(
                          employee.status
                        )}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/messages`}>
                          <button className="text-muted-foreground hover:text-primary p-1">
                            <MessageSquareIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        {user.role?.name === "Boss" && (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/employees/${employee._id}`)
                              }
                              className="text-muted-foreground hover:text-green-600 p-1"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <DeleteDialog
                              employee={employee}
                              handleDelete={handleDelete}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {renderPaginationFooter({
          employeesToDisplay,
          filteredEmployees,
          currentPage,
          totalPages,
          goToPreviousPage,
          goToNextPage,
          startIndex,
        })}
      </div>
    );
  }
};

const renderPaginationFooter = ({
  employeesToDisplay,
  filteredEmployees,
  currentPage,
  totalPages,
  goToPreviousPage,
  goToNextPage,
  startIndex,
}) => {
  return (
    <div className="px-6 py-4 border-t border-border bg-muted/50 rounded-b-lg">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {employeesToDisplay.length > 0 ? startIndex + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(
              startIndex + employeesToDisplay.length,
              filteredEmployees.length
            )}
          </span>{" "}
          of <span className="font-medium">{filteredEmployees.length}</span>{" "}
          results
        </div>
        <div className="flex space-x-2">
          <div className="text-sm text-muted-foreground mr-4 flex items-center">
            Page <span className="font-medium ml-1">{currentPage}</span> of{" "}
            <span className="font-medium ml-1">{totalPages}</span>
          </div>

          {/* Previous Button */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-3 py-1 border border-border text-sm font-medium rounded-md text-foreground bg-card ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent"
            }`}
          >
            Previous
          </button>

          {/* Next Button */}
          <button
            onClick={goToNextPage}
            disabled={
              currentPage === totalPages || filteredEmployees.length === 0
            }
            className={`inline-flex items-center px-3 py-1 border border-border text-sm font-medium rounded-md text-foreground bg-card ${
              currentPage === totalPages || filteredEmployees.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
