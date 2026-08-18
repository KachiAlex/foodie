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
import { VendorProfile } from "@/pages/community/VendorProfile";
import { DishDetails } from "@/pages/community/DishDetails";
import { VendorBids } from "@/pages/community/VendorBids";
import { TasteMatch } from "@/pages/community/TasteMatch";
import { FoodCircles } from "@/pages/community/FoodCircles";

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
        <Route path="/community/vendors/:id" element={<VendorProfile />} />
        <Route path="/community/dishes/:id" element={<DishDetails />} />
        <Route path="/community/vendor-bids" element={<VendorBids />} />
        <Route path="/community/taste-match" element={<TasteMatch />} />
        <Route path="/community/circles" element={<FoodCircles />} />
        <Route path="/community/circles/:id" element={<FoodCircles />} />
        <Route path="/dashboard" element={<DashboardLanding />} />
        <Route path="/dashboard/:roleSlug" element={<DashboardGuard />} />
      </Routes>
      <ToastViewport />
    </ErrorBoundary>
  );
}
