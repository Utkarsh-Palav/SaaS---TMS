import axios from 'axios';
import { Loader, PlusIcon, XIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react'

const AddTeamMemberModal = ({ onClose, teams, employees }) => {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const filteredEmployees = useMemo(() => {
    if (!selectedTeamId) {
      return employees;
    }

    const selectedTeam = teams.find((team) => team._id === selectedTeamId);

    if (!selectedTeam || !selectedTeam.members || selectedTeam.members.length === 0) {
      return employees;
    }

    const memberIds = new Set(selectedTeam.members.map((member) => member._id));

    return employees.filter((emp) => !memberIds.has(emp._id));
  }, [selectedTeamId, employees, teams]);

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
    setSelectedEmployeeIds([]);
  };

  // Handle checking/unchecking an employee
  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployeeIds((prevSelected) => {
      if (prevSelected.includes(employeeId)) {
        return prevSelected.filter((id) => id !== employeeId);
      }
      return [...prevSelected, employeeId];
    });
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!selectedTeamId) {
      setError("Please select a team.");
      setIsLoading(false);
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      setError("Please select at least one employee.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/team/${selectedTeamId}/add-members`,
        { employeeIds: selectedEmployeeIds },
        { withCredentials: true }
      );

      // Success!
      setSuccess(
        `Successfully added ${selectedEmployeeIds.length} member(s) to the team.`
      );
      setSelectedEmployeeIds([]);
      setSelectedTeamId("");

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">
            Add Members to Team
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}
            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-medium text-emerald-500">{success}</p>
              </div>
            )}

            {/* Team Selection Dropdown */}
            <div>
              <label
                htmlFor="team"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Select Team
              </label>
              <select
                id="team"
                name="team"
                value={selectedTeamId}
                onChange={handleTeamChange}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:ring-primary focus:border-primary disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="" disabled>
                  -- Choose a team --
                </option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Selection List */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Select Employees
              </label>
              <ul className="max-h-60 overflow-y-auto border border-border rounded-md divide-y divide-border">
                {employees.length === 0 ? (
                  <li className="p-3 text-sm text-muted-foreground">
                    No employees found in this department.
                  </li>
                ) : filteredEmployees.length === 0 ? (
                  <li className="p-3 text-sm text-muted-foreground">
                    All employees in this department are already on this team.
                  </li>
                ) : (
                  filteredEmployees.map((emp) => (
                    <li key={emp._id}>
                      <label
                        htmlFor={emp._id}
                        className="flex items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          id={emp._id}
                          value={emp._id}
                          checked={selectedEmployeeIds.includes(emp._id)}
                          onChange={() => handleCheckboxChange(emp._id)}
                          className="h-4 w-4 text-primary border-border rounded focus:ring-primary bg-background"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-foreground">
                            {emp.username}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({emp.jobTitle})
                          </span>
                        </div>
                      </label>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-muted/50 border-t border-border px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
            <button
              type="submit"
              disabled={
                isLoading ||
                selectedEmployeeIds.length === 0 ||
                !selectedTeamId
              }
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <PlusIcon className="h-5 w-5 mr-2" />
              )}
              {isLoading
                ? "Adding..."
                : `Add ${selectedEmployeeIds.length} Member(s)`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-card text-base font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMemberModal