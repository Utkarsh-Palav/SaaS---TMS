import Permission from "../models/Permission.model.js";

/** List all predefined permissions (for role editor UI). Boss-only via route. */
export const listPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find()
      .select("name description")
      .sort({ name: 1 })
      .lean();
    res.json(permissions);
  } catch (err) {
    console.error("listPermissions:", err);
    res.status(500).json({ message: "Failed to list permissions" });
  }
};
