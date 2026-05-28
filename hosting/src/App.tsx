import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/Landing";
import { DashboardLanding } from "@/pages/DashboardLanding";
import { DashboardGuard } from "@/pages/DashboardGuard";
import { ToastViewport } from "@/components/ToastViewport";
import { SignUpPage } from "@/pages/auth/SignUp";
import { SignInPage } from "@/pages/auth/SignIn";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/dashboard" element={<DashboardLanding />} />
        <Route path="/dashboard/:roleSlug" element={<DashboardGuard />} />
      </Routes>
      <ToastViewport />
    </>
  );
}
