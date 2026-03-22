import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API = import.meta.env.VITE_API_URL;

const parsePerm = (name) => {
  const i = name.indexOf(":");
  if (i === -1) return { action: name, resource: "other" };
  return { action: name.slice(0, i), resource: name.slice(i + 1) };
};

const ACTIONS_ORDER = ["create", "read", "update", "delete"];

function RolesSettings() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState([]);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formName, setFormName] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axios.get(`${API}/api/roles`, { withCredentials: true }),
        axios.get(`${API}/api/roles/permissions`, { withCredentials: true }),
      ]);
      setRoles(rolesRes.data);
      setPermissionsCatalog(permsRes.data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const permById = useMemo(() => {
    const m = new Map();
    for (const p of permissionsCatalog) {
      m.set(p._id, p);
    }
    return m;
  }, [permissionsCatalog]);

  const groupedCatalog = useMemo(() => {
    const byResource = new Map();
    for (const p of permissionsCatalog) {
      const { resource } = parsePerm(p.name);
      if (!byResource.has(resource)) byResource.set(resource, []);
      byResource.get(resource).push(p);
    }
    for (const [, list] of byResource) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    const resources = [...byResource.keys()].sort((a, b) =>
      a.localeCompare(b)
    );
    return { byResource, resources };
  }, [permissionsCatalog]);

  const filteredResources = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groupedCatalog.resources;
    return groupedCatalog.resources.filter((r) => r.toLowerCase().includes(q));
  }, [groupedCatalog.resources, search]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setSelectedIds(new Set());
    setDialogOpen(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setFormName(role.name);
    setSelectedIds(new Set((role.permissions || []).map((p) => p._id)));
    setDialogOpen(true);
  };

  const togglePerm = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleResourceRow = (resource) => {
    const list = groupedCatalog.byResource.get(resource) || [];
    const ids = list.map((p) => p._id);
    const allOn = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOn) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAllVisible = () => {
    const ids = [];
    for (const r of filteredResources) {
      for (const p of groupedCatalog.byResource.get(r) || []) {
        ids.push(p._id);
      }
    }
    const allOn = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOn) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSave = async () => {
    const name = formName.trim();
    if (!name) {
      toast.error("Role name is required");
      return;
    }
    const permissionIds = [...selectedIds];
    setSaving(true);
    try {
      if (editing) {
        const payload = { permissionIds };
        if (editing.name !== "Boss") {
          payload.name = name;
        }
        await axios.put(`${API}/api/roles/${editing._id}`, payload, {
          withCredentials: true,
        });
        toast.success("Role updated");
      } else {
        await axios.post(
          `${API}/api/roles`,
          { name, permissionIds },
          { withCredentials: true }
        );
        toast.success("Role created");
      }
      setDialogOpen(false);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/roles/${deleteTarget._id}`, {
        withCredentials: true,
      });
      toast.success("Role deleted");
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading roles…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Roles & permissions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create roles and assign fine-grained access. Only you (Boss) can
            change this.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          New role
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role._id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{role.name}</div>
                    {role.name === "Boss" && (
                      <p className="text-xs text-amber-700 mt-0.5">
                        System owner — cannot be deleted or renamed
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {(role.permissions?.length ?? 0)} selected
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(role)}
                      className="border-slate-200"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    {role.name !== "Boss" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTarget(role)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {roles.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500 text-sm">
            No roles found. Run the permission seed on the server if the database
            is new.
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit role: ${editing.name}` : "Create role"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role name
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                disabled={editing?.name === "Boss"}
                placeholder="e.g. Manager"
                className="border-slate-200"
              />
              {editing?.name === "Boss" && (
                <p className="text-xs text-slate-500 mt-1">
                  The Boss role name cannot be changed.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter resources…"
                  className="pl-9 border-slate-200"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllVisible}
                className="border-slate-200 shrink-0"
              >
                Toggle all visible
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-[minmax(8rem,1fr)_repeat(4,minmax(0,5rem))] gap-px bg-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <div className="bg-slate-50 px-3 py-2">Resource</div>
                {ACTIONS_ORDER.map((a) => (
                  <div key={a} className="bg-slate-50 px-1 py-2 text-center">
                    {a}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-slate-200 bg-white max-h-[min(50vh,360px)] overflow-y-auto">
                {filteredResources.length === 0 && (
                  <p className="px-3 py-6 text-sm text-slate-500 text-center">
                    No resources match your filter.
                  </p>
                )}
                {filteredResources.map((resource) => {
                  const perms = groupedCatalog.byResource.get(resource) || [];
                  const byAction = Object.fromEntries(
                    ACTIONS_ORDER.map((a) => {
                      const p = perms.find((x) => parsePerm(x.name).action === a);
                      return [a, p];
                    })
                  );
                  const rowIds = perms.map((p) => p._id);
                  const rowAll =
                    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));

                  return (
                    <div
                      key={resource}
                      className="grid grid-cols-[minmax(8rem,1fr)_repeat(4,minmax(0,5rem))] gap-px bg-slate-100 items-stretch"
                    >
                      <button
                        type="button"
                        onClick={() => toggleResourceRow(resource)}
                        className="bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                      >
                        {rowAll ? (
                          <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <span className="break-words capitalize">
                          {resource.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </button>
                      {ACTIONS_ORDER.map((a) => {
                        const p = byAction[a];
                        if (!p) {
                          return (
                            <div
                              key={a}
                              className="bg-white flex items-center justify-center text-slate-300 text-xs"
                            >
                              —
                            </div>
                          );
                        }
                        const on = selectedIds.has(p._id);
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => togglePerm(p._id)}
                            className={`bg-white flex items-center justify-center py-2 transition-colors ${
                              on
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-slate-50 text-slate-400"
                            }`}
                            title={permById.get(p._id)?.name}
                          >
                            {on ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {selectedIds.size} permission
              {selectedIds.size === 1 ? "" : "s"} selected
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Users must not be assigned to{" "}
              <strong>{deleteTarget?.name}</strong> before deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => handleDelete()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default RolesSettings;
