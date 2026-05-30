import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, resetPassword } from "@/services/authApi";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await requestPasswordReset(email);
      setSuccess(result.message);
      // In testing mode, the backend returns the resetToken directly
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setStep("reset");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccess("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        window.location.href = "/auth/sign-in";
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "email" ? "Reset your password" : "Create new password"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {step === "email"
              ? "Enter your email and we'll send you a reset link."
              : "Enter your new password below."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Repeat password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/auth/sign-in"
            className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
