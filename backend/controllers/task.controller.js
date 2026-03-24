import Task from "../models/task.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { sendTaskNotificationEmail } from "../utils/sendGrid.mail.js";
import Team from "../models/team.model.js";
import Department from "../models/department.model.js";
import { logRecentActivity } from '../utils/logRecentActivity.js';

const applyTaskFilters = async (
  baseQuery,
  req,
  res,
  noTaskMessage = "No task found"
) => {
  try {
    const { sort, order, status } = req.query;

    const sortOrder = order === "desc" ? -1 : 1;

    let filter = { ...baseQuery };
    let pipeline = [];

    // --- Status Filter ---
    // (This logic is unchanged)
    if (status) {
      if (status === "Overdue") {
        filter.deadline = { $lt: new Date() };
        filter.status = { $ne: "Completed" };
      } else {
        filter.status = status;
      }
    }

    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    let tasks;

    // --- AGGREGATION BRANCH (for priority sort) ---
    if (sort === "priority") {
      pipeline.push({
        $addFields: {
          priorityValue: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "Low"] }, then: 1 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                { case: { $eq: ["$priority", "High"] }, then: 3 },
              ],
              default: 0,
            },
          },
        },
      });

      pipeline.push({ $sort: { priorityValue: sortOrder } });

      // --- START: Manual Population via $lookup ---

      // 1. Populate department
      pipeline.push(
        {
          $lookup: {
            from: "departments",
            localField: "department",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } }
      );

      // 2. Populate createdBy and its role
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "roles", // The collection name for your Role model
            localField: "createdBy.role",
            foreignField: "_id",
            as: "creatorRole",
          },
        },
        { $unwind: { path: "$creatorRole", preserveNullAndEmptyArrays: true } }
      );

      // 3. Populate assignedManager and its role
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "assignedManager",
            foreignField: "_id",
            as: "assignedManager",
          },
        },
        {
          $unwind: {
            path: "$assignedManager",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "roles",
            localField: "assignedManager.role",
            foreignField: "_id",
            as: "managerRole",
          },
        },
        { $unwind: { path: "$managerRole", preserveNullAndEmptyArrays: true } }
      );

      // 4. Populate assignedEmployees and their roles
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "assignedEmployees",
            foreignField: "_id",
            as: "assignedEmployees",
          },
        },
        {
          $lookup: {
            from: "roles",
            localField: "assignedEmployees.role",
            foreignField: "_id",
            as: "employeeRoles",
          },
        }
      );

      pipeline.push(
        {
          $lookup: {
            from: "teams", // Collection name for Team model
            localField: "team",
            foreignField: "_id",
            as: "team",
          },
        },
        { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } }
      );

      // --- END: Manual Population ---

      // 5. Project to match the final structure
      pipeline.push({
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          department: { _id: "$department._id", name: "$department.name" },
          createdBy: {
            _id: "$createdBy._id",
            firstName: "$createdBy.firstName",
            middleName: "$createdBy.middleName",
            lastName: "$createdBy.lastName",
            email: "$createdBy.email",
            jobTitle: "$createdBy.jobTitle",
            role: {
              _id: "$creatorRole._id",
              name: "$creatorRole.name",
            },
            profileImage: "$createdBy.profileImage"
          },
          assignedManager: {
            _id: "$assignedManager._id",
            firstName: "$assignedManager.firstName",
            middleName: "$assignedManager.middleName",
            lastName: "$assignedManager.lastName",
            email: "$assignedManager.email",
            jobTitle: "$assignedManager.jobTitle",
            role: {
              _id: "$managerRole._id",
              name: "$managerRole.name",
            },
            profileImage: "$assignedManager.profileImage"
          },
          assignedEmployees: {
            $map: {
              input: "$assignedEmployees",
              as: "emp",
              in: {
                _id: "$$emp._id",
                firstName: "$$emp.firstName",
                middleName: "$$emp.middleName",
                lastName: "$$emp.lastName",
                email: "$$emp.email",
                jobTitle: "$$emp.jobTitle", // Added
                profileImage: "$$emp.profileImage",
                role: {
                  // Added
                  $let: {
                    vars: {
                      roleObj: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$employeeRoles",
                              as: "r",
                              cond: { $eq: ["$$r._id", "$$emp.role"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: "$$roleObj._id",
                      name: "$$roleObj.name",
                    },
                  },
                },
              },
            },
          },
          team: { _id: "$team._id", name: "$team.name" },
          priority: 1,
          status: 1,
          deadline: 1,
          milestones: 1,
          dependencies: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      });

      tasks = await Task.aggregate(pipeline);

      // --- .find() BRANCH (for simple sorts) ---
    } else {
      let sortOptionsForFind = {};
      if (sort === "createdAt") {
        sortOptionsForFind.createdAt = sortOrder;
      } else {
        sortOptionsForFind.createdAt = -1; // Default
      }

      tasks = await Task.find(filter)
        .populate("department", "name")
        .populate({
          // MODIFIED
          path: "assignedManager",
          select: "firstName middleName lastName email jobTitle profileImage",
          populate: { path: "role", select: "name" },
        })
        .populate({
          // MODIFIED
          path: "assignedEmployees",
          select: "firstName middleName lastName email jobTitle profileImage",
          populate: { path: "role", select: "name" },
        })
        .populate({
          // MODIFIED for consistency
          path: "createdBy",
          select: "firstName middleName lastName email jobTitle profileImage",
          populate: { path: "role", select: "name" },
        })
        .populate("team", "name _id")
        .sort(sortOptionsForFind);
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks with filters:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask = async (req, res) => {
  const {
    title,
    description,
    department,
    assignedManager,
    deadline,
    priority,
    milestones = [],
  } = req.body;
  try {
    const manager = await User.findById(assignedManager);
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    const { firstName, lastName, email } = manager;

    const task = await Task.create({
      title,
      description,
      department,
      assignedManager,
      assignedEmployees: [],
      deadline,
      priority,
      milestones,
      organizationId: req.user.organizationId,
      createdBy: req.user._id,
    });

    if (!task)
      return res.status(400).json({ message: "Failed to create task" });

    await Department.findByIdAndUpdate(department, {
      $push: { task: task._id },
    });

    await logRecentActivity(req, "CREATE", 'Task', `Created a new task: "${task.title}"`)

    const username = `${firstName} ${lastName}`

    await sendTaskNotificationEmail({
      title,
      description,
      assignedManagerEmail: email,
      managerName: username,
      priority,
      deadline,
    });

    // ✅ Populate department and assignedManager before sending response
    const populatedTask = await Task.findById(task._id)
      .populate("assignedManager", "firstName middleName lastName email _id")
      .populate("department", "name _id");

    res.status(201).json({ message: "Task created", task: populatedTask });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const updateTitleAndDesc = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const task = await Task.findByIdAndUpdate(id, { title, description });

    await logRecentActivity(req, "UPDATE", "Task", `Updated task: "${task.title}"`)

    res.status(200).json({ task, message: "Task updated successfully!" });
  } catch (error) {
    console.log("Failed to fetch task by ID:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

export const assignTaskToTeam = async (req, res) => {
  const { taskId } = req.params;
  const { teamId } = req.body;
  const { organizationId, _id: userId } = req.user;

  if (!teamId) {
    return res.status(400).json({ message: "Team ID is required" });
  }

  try {
    const task = await Task.findOne({
      _id: taskId,
      organizationId: organizationId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const team = await Team.findOne({
      _id: teamId,
      organizationId: organizationId,
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isManager = task.assignedManager.toString() === userId.toString();
    const isCreator = task.createdBy.toString() === userId.toString();

    if (!isManager && !isCreator) {
      return res.status(403).json({
        message:
          "Not authorized. Only the task creator or assigned manager can assign a team.",
      });
    }

    if (task.department.toString() !== team.departmentId.toString()) {
      return res.status(400).json({
        message: "Team must be in the same department as the task.",
      });
    }

    const oldTeamId = task.team;

    if (oldTeamId && oldTeamId.toString() !== teamId) {
      await Team.findOneAndUpdate(
        { _id: oldTeamId, organizationId: organizationId },
        { $pull: { tasks: taskId } }
      );
    }

    const managerIdString = task.assignedManager.toString();
    const employeesToAssign = team.members.filter(
      (memberId) => memberId.toString() !== managerIdString
    )

    task.assignedEmployees = employeesToAssign;
    task.team = teamId;
    await task.save();

    await Team.findOneAndUpdate(
      { _id: teamId, organizationId: organizationId },
      { $addToSet: { tasks: taskId } }
    );

    const populatedTask = await Task.findOne({
      _id: taskId,
      organizationId: organizationId,
    })
      .populate("assignedManager", "firstName middleName lastName email jobTitle _id")
      .populate("department", "name _id")
      .populate("team", "name _id");

    await logRecentActivity(req, "ASSIGN_TEAM", "Task", `Assigned task: "${task.title}" to team: "${team.name}"`)

    res.status(200).json({
      message: "Task successfully assigned to team",
      task: populatedTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to assign team" });
  }
};

export const addEmployeeToTask = async (req, res) => {
  const { taskId } = req.params;
  const { employeeIds } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check if the current user is the assigned manager
    if (task.assignedManager.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to add employees to this task" });
    }

    // Merge existing and new employees, avoiding duplicates
    const existingIds = task.assignedEmployees.map((id) => id.toString());
    const incomingIds = employeeIds.map((id) => id.toString());

    const combinedUniqueIds = [...new Set([...existingIds, ...incomingIds])];

    // Convert back to ObjectIds
    task.assignedEmployees = combinedUniqueIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    await task.save();

    res.status(200).json({
      message: "Employees added to task successfully",
      task,
    });
  } catch (error) {
    console.error("Error adding employees to task:", error);
    res.status(500).json({ message: "Failed to add employees to task" });
  }
};

export const removeEmployeeFromTask = async (req, res) => {
  const { taskId, employeeId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.assignedEmployees = task.assignedEmployees.filter(
      (empId) => empId.toString() !== employeeId
    );

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to remove the employee from task" });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status, priority, deadline } = req.body;

  try {
    const validStatuses = ["Pending", "In Progress", "Completed", "Overdue"];
    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: `Invalid status value: ${status}` });
    }

    const validPriority = ["Low", "High", "Medium"];
    if (priority && !validPriority.includes(priority)) {
      return res
        .status(400)
        .json({ message: `Invalid priority value: ${priority}` });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          status: status,
          priority: priority,
          deadline: deadline,
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await logRecentActivity(req, "UPDATE_TASK_STATUS", "Task", `Updated status of task: "${updatedTask.title}" to "${status}"`)

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update task status" });
  }
};

export const addMilestones = async (req, res) => {
  const { taskId } = req.params;
  // 1. Expect the 'milestones' array from the frontend
  const { milestones } = req.body;

  // 2. Validate the incoming array
  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    return res.status(400).json({ message: "Milestones array is required" });
  }

  try {
    // 3. Use findByIdAndUpdate with $push to atomically update
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        // Use $push with $each to add all items from the 'milestones' array
        $push: { milestones: { $each: milestones } },
      },
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await logRecentActivity(req, "ADD_MILESTONES", "Task", `Added milestones to task: "${updatedTask.title}"`)

    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add Milestones" });
  }
};

export const updateMilestone = async (req, res) => {
  const { taskId } = req.params;
  const { milestoneId, completed } = req.body;
  const { organizationId, _id: userId } = req.user;

  if (!milestoneId) {
    return res.status(400).json({ message: "Milestone ID is required" });
  }
  if (typeof completed !== "boolean") {
    return res
      .status(400)
      .json({ message: "'completed' field must be a boolean" });
  }

  try {
    const task = await Task.findOne({
      _id: taskId,
      organizationId: organizationId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const result = await Task.updateOne(
      { _id: taskId, "milestones._id": milestoneId },
      { $set: { "milestones.$.completed": completed } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const completed = completed ? "Completed" : "Incomplete";

    await logRecentActivity(req, "UPDATE_MILESTONE", "Task", `Updated milestone of task: "${task.title}" to: ${completed}`)

    res.status(200).json({ message: "Milestone updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update Milestone " });
  }
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 2. If the task has a department, pull its ID from the department's 'task' array
    if (task.department) {
      await Department.findByIdAndUpdate(task.department._id, {
        $pull: { task: taskId }, // 'task' is the array name in your Department schema
      });
    }

    // 3. If the task is assigned to a team, pull its ID from the team's 'tasks' array
    if (task.team) {
      await Team.findByIdAndUpdate(task.team._id, {
        $pull: { tasks: taskId }, // 'tasks' is the array name in your Team schema
      });
    }

    await logRecentActivity(req, "DELETE", "Task", `Deleted task: "${task.title}"`)

    // 4. Now, permanently delete the task
    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  const { organizationId } = req.user;

  try {
    const task = await Task.findOne({ _id: id, organizationId: organizationId })
      .populate(
        "assignedManager",
        "-otp -otpExpires -password -resetToken -resetTokenExpires"
      )
      .populate(
        "assignedEmployees",
        "-otp -otpExpires -password -resetToken -resetTokenExpires"
      )
      .populate({
        path: "department", // 1. First, populate the 'department'
        populate: {
          path: "teams",
        },
      })
      .populate({
        path: "team",
        populate: {
          path: "members tasks",
          select: "-otp -otpExpires -password -resetToken -resetTokenExpires",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "-otp -otpExpires -password -resetToken -resetTokenExpires",
        },
      });
    res.status(200).json(task);
  } catch (error) {
    console.log("Failed to fetch task by ID:", error);
    res.status(500).json({ message: "Failed to fetch task by ID" });
  }
};

export const getTasks = async (req, res) => {
  const { _id: userId, role, organizationId } = req.user;

  const roleName = role.name ? role.name : role;

  let baseQuery = { organizationId: organizationId };

  if (roleName !== "Boss") {
    baseQuery.$or = [
      { createdBy: userId },
      { assignedManager: userId },
      { assignedEmployees: userId },
    ];
  }

  await applyTaskFilters(baseQuery, req, res, "No tasks found");
};