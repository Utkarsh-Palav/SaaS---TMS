import Role from "../models/Role.model.js";

/**
 * Requires the authenticated user's role to be "Boss" (org owner).
 * Uses req.user.role as ObjectId (not populated by verifyToken).
 */
const requireBoss = async (req, res, next) => {
  try {
    const roleId = req.user?.role?._id ?? req.user?.role;
    if (!roleId) {
      return res.status(403).json({ message: "No role assigned." });
    }

    const role = await Role.findById(roleId).lean();
    if (!role || role.name !== "Boss") {
      return res
        .status(403)
        .json({ message: "Only the Boss can manage roles and permissions." });
    }

    next();
  } catch (err) {
    console.error("requireBoss:", err);
    res.status(500).json({ message: "Authorization check failed." });
  }
};

export default requireBoss;
