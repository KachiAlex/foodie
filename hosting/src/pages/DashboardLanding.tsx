import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/context/RoleContext";

export function DashboardLanding() {
  const { role } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/dashboard/${role}`, { replace: true });
  }, [navigate, role]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-3xl bg-white px-8 py-10 text-center shadow-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Redirecting</p>
        <p className="mt-2 text-lg text-gray-600">Loading your {role} workspace...</p>
      </div>
    </div>
  );
}
