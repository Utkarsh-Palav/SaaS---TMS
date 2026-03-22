import mongoose from "mongoose";
import Role from "../models/Role.model.js";
import Permission from "../models/Permission.model.js";
import User from "../models/user.model.js";
import { clearRoleCache } from "../middlewares/authorizePermission.js";

const BOSS_NAME = "Boss";

const validatePermissionIds = async (ids) => {
  const unique = [...new Set((ids || []).filter(Boolean))];
  for (const id of unique) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { ok: false, error: "Invalid permission id", unique: [] };
    }
  }
  const count = await Permission.countDocuments({ _id: { $in: unique } });
  if (count !== unique.length) {
    return { ok: false, error: "One or more permissions do not exist", unique: [] };
  }
  return { ok: true, unique };
};

export const listRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate("permissions", "name description")
      .sort({ name: 1 })
      .lean();
    res.json(roles);
  } catch (err) {
    console.error("listRoles:", err);
    res.status(500).json({ message: "Failed to list roles" });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate("permissions", "name description")
      .lean();
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(role);
  } catch (err) {
    console.error("getRoleById:", err);
    res.status(500).json({ message: "Failed to load role" });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, permissionIds } = req.body;
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      return res.status(400).json({ message: "Role name is required" });
    }
    if (trimmed === BOSS_NAME) {
      return res.status(400).json({ message: `The name "${BOSS_NAME}" is reserved` });
    }

    const { ok, error, unique } = await validatePermissionIds(permissionIds);
    if (!ok) {
      return res.status(400).json({ message: error });
    }

    const role = await Role.create({
      name: trimmed,
      permissions: unique,
    });
    await role.populate("permissions", "name description");
    clearRoleCache(role._id);
    res.status(201).json(role.toObject());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A role with this name already exists" });
    }
    console.error("createRole:", err);
    res.status(500).json({ message: "Failed to create role" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissionIds } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (typeof name === "string" && name.trim() && name.trim() !== role.name) {
      if (role.name === BOSS_NAME) {
        return res.status(400).json({ message: "Cannot rename the Boss role" });
      }
      if (name.trim() === BOSS_NAME) {
        return res.status(400).json({ message: `The name "${BOSS_NAME}" is reserved` });
      }
      role.name = name.trim();
    }

    if (permissionIds !== undefined) {
      const { ok, error, unique } = await validatePermissionIds(permissionIds);
      if (!ok) {
        return res.status(400).json({ message: error });
      }
      if (role.name === BOSS_NAME && unique.length === 0) {
        return res
          .status(400)
          .json({ message: "Boss role must keep at least one permission" });
      }
      role.permissions = unique;
    }

    await role.save();
    await role.populate("permissions", "name description");
    clearRoleCache(role._id);
    res.json(role.toObject());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A role with this name already exists" });
    }
    console.error("updateRole:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    if (role.name === BOSS_NAME) {
      return res.status(400).json({ message: "Cannot delete the Boss role" });
    }

    const assigned = await User.countDocuments({ role: role._id });
    if (assigned > 0) {
      return res.status(400).json({
        message: `Cannot delete role: ${assigned} user(s) still have this role. Reassign them first.`,
      });
    }

    await Role.deleteOne({ _id: role._id });
    clearRoleCache(role._id);
    res.json({ message: "Role deleted" });
  } catch (err) {
    console.error("deleteRole:", err);
    res.status(500).json({ message: "Failed to delete role" });
  }
};
