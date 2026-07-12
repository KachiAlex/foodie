import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/Landing";
import { DashboardLanding } from "@/pages/DashboardLanding";
import { DashboardGuard } from "@/pages/DashboardGuard";
import { ToastViewport } from "@/components/ToastViewport";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SignUpPage } from "@/pages/auth/SignUp";
import { SignInPage } from "@/pages/auth/SignIn";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPassword";
import { FoodCommunity } from "@/pages/community/FoodCommunity";
import { BuyerMarket } from "@/pages/community/BuyerMarket";
import { VendorMarket } from "@/pages/community/VendorMarket";
import { VendorBids } from "@/pages/community/VendorBids";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/community" element={<FoodCommunity />} />
        <Route path="/community/buyer-market" element={<BuyerMarket />} />
        <Route path="/community/vendor-market" element={<VendorMarket />} />
        <Route path="/community/vendor-bids" element={<VendorBids />} />
        <Route path="/dashboard" element={<DashboardLanding />} />
        <Route path="/dashboard/:roleSlug" element={<DashboardGuard />} />
      </Routes>
      <ToastViewport />
    </ErrorBoundary>
  );
}
