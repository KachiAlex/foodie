import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/Landing";
import { DashboardLanding } from "@/pages/DashboardLanding";
import { DashboardGuard } from "@/pages/DashboardGuard";
import { useRole } from "@/context/RoleContext";
import { RoleToast } from "@/components/RoleToast";

export default function App() {
  const { toastMessage, clearToast } = useRole();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLanding />} />
        <Route path="/dashboard/:roleSlug" element={<DashboardGuard />} />
      </Routes>
      <RoleToast message={toastMessage} onDismiss={clearToast} />
    </>
  );
}
