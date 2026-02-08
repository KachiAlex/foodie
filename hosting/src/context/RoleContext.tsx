import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export type Role = "buyer" | "vendor" | "admin";

export const roleOptions: { value: Role; label: string }[] = [
  { value: "buyer", label: "Buyer" },
  { value: "vendor", label: "Vendor" },
  { value: "admin", label: "Admin" },
];

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  toastMessage: string | null;
  clearToast: () => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);
const STORAGE_KEY = "homeplate_role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const analytics = useAnalytics();
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window === "undefined") return "buyer";
    const stored = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    return stored && roleOptions.some((option) => option.value === stored) ? stored : "buyer";
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const label = roleOptions.find((option) => option.value === role)?.label ?? role;
    setToastMessage(`Switched to ${label} workspace`);
    analytics.track("role_switched", { role });
    const timer = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [role, hydrated, analytics]);

  const setRole = useCallback((nextRole: Role) => {
    setRoleState(nextRole);
  }, []);

  const clearToast = useCallback(() => setToastMessage(null), []);

  return <RoleContext.Provider value={{ role, setRole, toastMessage, clearToast }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
