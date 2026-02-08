import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/context/RoleContext";

export function SignInPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedRole = (params.get("role") as Role | null) ?? undefined;
  const [form, setForm] = useState({ email: "", password: "", role: preselectedRole ?? "buyer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [navigate, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const authenticated = await signIn(form);
      navigate(`/dashboard/${authenticated.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="m-auto w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="hidden rounded-l-3xl bg-gray-900 p-12 text-white md:flex md:flex-col">
            <div className="flex items-center gap-3 text-2xl font-semibold">
              <ChefHat className="h-8 w-8 text-orange-400" /> Foodie Market
            </div>
            <p className="mt-8 text-lg text-white/80">
              Welcome back! Track your bespoke requests, manage vendor bids, and keep dinner plans on autopilot.
            </p>
            <div className="mt-auto space-y-3 text-sm text-white/70">
              <p>New here?</p>
              <Link to="/auth/sign-up" className="inline-flex items-center gap-2 text-white">
                Create an account →
              </Link>
            </div>
          </div>

          <motion.div className="p-10" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8 space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Welcome back</p>
              <h1 className="text-3xl font-semibold text-gray-900">Sign in to continue</h1>
              <p className="text-sm text-gray-500">Use the email you registered with. Role determines which workspace opens.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="you@foodie.market"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="role">
                  Workspace to open
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="buyer">Buyer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full bg-orange-500 text-white" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              Need an account?{" "}
              <Link to="/auth/sign-up" className="text-orange-500">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
