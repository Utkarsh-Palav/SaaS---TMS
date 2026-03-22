import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = import.meta.env.VITE_API_URL;

/** Short hints for default roles (custom roles show name only). */
const ROLE_HINTS = {
  Manager: "Lead people & approve work in their department",
  Employee: "Day-to-day tasks, chat, and assigned work",
  "Team Leader": "Coordinate a team within a department",
};

/**
 * Dropdown of predefined roles from the API (excludes Boss).
 * Controlled by `value` / `onChange` using the role name string (matches backend `roleName`).
 */
export default function RoleSelect({
  value,
  onChange,
  disabled,
  className = "",
  required = false,
}) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/api/employee/role-options`, {
          withCredentials: true,
        });
        if (!cancelled) {
          setRoles(Array.isArray(res.data) ? res.data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || "Could not load roles");
          setRoles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const triggerBase = cn(
    "w-full min-h-[42px] h-auto py-2.5 px-3 rounded-xl border-slate-200 bg-slate-50",
    "text-left font-normal shadow-none hover:bg-slate-100/80 hover:border-slate-300",
    "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500/20 data-[state=open]:border-blue-500",
    "[&_svg]:text-slate-500",
    error && "border-red-200 bg-red-50/50"
  );

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 w-full min-h-[42px] px-3 py-2.5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/80 text-sm text-slate-500",
          className
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-slate-700 font-medium">Loading roles</span>
          <span className="text-xs text-slate-400">Fetching permission profiles…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5">
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled || !!error}
        required={required}
      >
        <SelectTrigger
          className={cn(triggerBase, className)}
          aria-invalid={!!error}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 border border-blue-600/15">
              <Shield className="h-4 w-4" strokeWidth={2} />
            </div>
            <SelectValue placeholder="Choose a system role…" />
          </div>
        </SelectTrigger>
        <SelectContent
          position="popper"
          className={cn(
            "rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/50",
            "max-h-[min(320px,var(--radix-select-content-available-height))] z-[100]"
          )}
          sideOffset={6}
          align="start"
        >
          {roles.length === 0 && !error ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-800">No roles available</p>
              <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                Add roles under{" "}
                <span className="font-medium text-slate-700">Settings → Roles & permissions</span>{" "}
                (Boss only).
              </p>
            </div>
          ) : (
            roles.map((r) => {
              const hint = ROLE_HINTS[r.name];
              return (
                <SelectItem
                  key={r.name}
                  value={r.name}
                  className={cn(
                    "rounded-lg cursor-pointer py-2.5 pl-3 pr-8 my-0.5",
                    "focus:bg-blue-50 focus:text-slate-900 data-[highlighted]:bg-blue-50",
                    "data-[state=checked]:bg-blue-50/80"
                  )}
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-medium text-slate-900">{r.name}</span>
                    {hint ? (
                      <span className="text-[11px] text-slate-500 font-normal leading-snug max-w-[260px]">
                        {hint}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-normal">
                        Custom role
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
