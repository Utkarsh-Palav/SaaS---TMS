/** Standard CRUD permission names: "action:resource" (e.g. create:employee). */

export const ACTIONS = ["create", "read", "update", "delete"];

/** Mongoose-backed resources that expose API surface area. */
export const RESOURCES = [
  "employee",
  "department",
  "organization",
  "task",
  "team",
  "meeting",
  "room",
  "comment",
  "activityLog",
  "recentActivity",
  "chat",
  "dashboard",
  "subscription",
  "transaction",
];

export const permissionName = (action, resource) => `${action}:${resource}`;

export const allCrudPermissionNames = () => {
  const names = [];
  for (const action of ACTIONS) {
    for (const resource of RESOURCES) {
      names.push(permissionName(action, resource));
    }
  }
  return names;
};
