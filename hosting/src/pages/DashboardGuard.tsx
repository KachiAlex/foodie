import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BuyerDashboard } from "@/pages/buyer/Dashboard";
import { VendorDashboard } from "@/pages/vendor/Dashboard";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { roleOptions, useRole } from "@/context/RoleContext";
import type { Role } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";

const roleComponentMap: Record<Role, JSX.Element> = {
  buyer: <BuyerDashboard />,
  vendor: <VendorDashboard />,
  admin: <AdminDashboard />,
};

function isRole(value: string | undefined): value is Role {
  return Boolean(value && roleOptions.some((option) => option.value === value));
}

export function DashboardGuard() {
  const { roleSlug } = useParams();
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate(`/auth/sign-in?role=${roleSlug ?? "buyer"}`, { replace: true });
      return;
    }
    if (!roleSlug) return;
    if (!isRole(roleSlug)) {
      navigate(`/dashboard/${roleOptions[0].value}`, { replace: true });
      return;
    }
    if (user.role !== roleSlug) {
      navigate(`/dashboard/${user.role}`, { replace: true });
      return;
    }
    if (role !== roleSlug) {
      setRole(roleSlug);
    }
  }, [roleSlug, role, setRole, navigate, user]);

  if (!roleSlug || !isRole(roleSlug) || !user || user.role !== roleSlug) {
    return null;
  }

  return roleComponentMap[roleSlug];
}
