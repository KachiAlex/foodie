import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { roleOptions, type Role } from "@/context/RoleContext";
import { useToast } from "@/context/ToastContext";

type VendorRequirementFields = {
  address: string;
  landmark: string;
  kitchenMedia: File[];
  idCardCapture: File | null;
  utilityBill: File | null;
};

const initialVendorState: VendorRequirementFields = {
  address: "",
  landmark: "",
  kitchenMedia: [],
  idCardCapture: null,
  utilityBill: null,
};

function validateVendorRequirements(details: VendorRequirementFields) {
  if (!details.address.trim()) {
    return "Vendors must provide a precise kitchen address.";
  }
  if (!details.landmark.trim()) {
    return "Add a landmark so riders can find your kitchen.";
  }
  if (details.kitchenMedia.length === 0) {
    return "Upload at least one kitchen image or video.";
  }
  if (!details.idCardCapture) {
    return "Capture your government-issued ID to continue.";
  }
  if (!details.utilityBill) {
    return "Attach a recent utility bill for address verification.";
  }
  return null;
}

export function SignUpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as Role | null) ?? roleOptions[0].value;
  const { signUp, user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: initialRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorRequirementFields>(initialVendorState);

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
      let vendorVerification;
      if (form.role === "vendor") {
        const vendorError = validateVendorRequirements(vendorDetails);
        if (vendorError) {
          throw new Error(vendorError);
        }
        vendorVerification = {
          address: vendorDetails.address.trim(),
          landmark: vendorDetails.landmark.trim(),
          kitchenMediaCount: vendorDetails.kitchenMedia.length,
          idCardProvided: Boolean(vendorDetails.idCardCapture),
          utilityBillProvided: Boolean(vendorDetails.utilityBill),
        } as const;
      }

      const registered = await signUp({ ...form, vendorVerification });
      showToast(`Welcome aboard! Redirecting to your ${registered.role} hub.`);
      navigate(`/dashboard/${registered.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
    } finally {
      setLoading(false);
    }
  }

  const handleTextChange = (field: "name" | "email" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVendorTextChange = (field: "address" | "landmark") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setVendorDetails((prev) => ({ ...prev, [field]: value }));
    };

  const handleKitchenMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files).slice(0, 6) : [];
    setVendorDetails((prev) => ({ ...prev, kitchenMedia: files }));
  };

  const handleSingleFileChange = (field: "idCardCapture" | "utilityBill") => (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ? Array.from(event.target.files) : [];
    setVendorDetails((prev) => ({ ...prev, [field]: file ?? null }));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="m-auto w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="hidden rounded-l-3xl bg-gradient-to-br from-orange-500 to-rose-500 p-12 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="flex items-center gap-3 text-2xl font-semibold">
                <ChefHat className="h-8 w-8" />
                Foodie Market
              </div>
              <p className="mt-6 text-lg text-white/80">
                Join a vibrant marketplace connecting home chefs with local food lovers. Choose your role to unlock curated tools.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">What you unlock</p>
              <ul className="space-y-2 text-white/90">
                <li>• Buyer concierge for bespoke orders</li>
                <li>• Vendor bidding and command hub</li>
                <li>• Admin-grade analytics coming soon</li>
              </ul>
            </div>
          </div>

          <motion.div
            className="p-10"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Get started</p>
              <h1 className="text-3xl font-semibold text-gray-900">Create your Foodie Market account</h1>
              <p className="text-sm text-gray-500">Pick a role now—you can add more roles later.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={handleTextChange("name")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Adaeze Emmanuel"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleTextChange("email")}
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
                  onChange={handleTextChange("password")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Choose your role</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {roleOptions.map((option) => {
                    const isActive = form.role === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, role: option.value }))}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          isActive ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500">
                          {option.value === "vendor"
                            ? "Bid on custom requests with verified kitchen"
                            : option.value === "buyer"
                            ? "Post bespoke meal briefs"
                            : "Monitor marketplace health"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.role === "vendor" && (
                <div className="space-y-5 rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-5">
                  <div>
                    <p className="text-sm font-semibold text-orange-600">Vendor verification</p>
                    <p className="text-xs text-orange-500">We need a precise kitchen location, visual proof, and identity documents before activating your stall.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="vendor-address">
                      Kitchen address (street, city, state)
                    </label>
                    <textarea
                      id="vendor-address"
                      required
                      value={vendorDetails.address}
                      onChange={handleVendorTextChange("address")}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="12 Palm Avenue, Lekki Phase 1, Lagos"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="vendor-landmark">
                      Nearest landmark (helps riders find you)
                    </label>
                    <input
                      id="vendor-landmark"
                      required
                      value={vendorDetails.landmark}
                      onChange={handleVendorTextChange("landmark")}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Opposite Palm View Hotel"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="kitchen-media">
                      Kitchen images or walkthrough video
                    </label>
                    <input
                      id="kitchen-media"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      required
                      onChange={handleKitchenMediaChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600"
                    />
                    <p className="text-xs text-gray-500">Upload up to 6 files. At least one clear photo or video of your prep area is required.</p>
                    {vendorDetails.kitchenMedia.length > 0 && (
                      <ul className="text-xs text-gray-600">
                        {vendorDetails.kitchenMedia.map((file) => (
                          <li key={file.name}>{file.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700" htmlFor="id-card">
                        Capture government ID (front)
                      </label>
                      <input
                        id="id-card"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        required
                        onChange={handleSingleFileChange("idCardCapture")}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600"
                      />
                      <p className="text-xs text-gray-500">Use your device camera to capture the ID directly. No uploads from gallery.</p>
                      {vendorDetails.idCardCapture && (
                        <p className="text-xs text-gray-600">Captured: {vendorDetails.idCardCapture.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700" htmlFor="utility-bill">
                        Latest utility bill (PDF or image)
                      </label>
                      <input
                        id="utility-bill"
                        type="file"
                        accept="application/pdf,image/*"
                        required
                        onChange={handleSingleFileChange("utilityBill")}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600"
                      />
                      <p className="text-xs text-gray-500">Upload a bill from the last 3 months showing this address.</p>
                      {vendorDetails.utilityBill && (
                        <p className="text-xs text-gray-600">Attached: {vendorDetails.utilityBill.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full bg-orange-500 text-white" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/auth/sign-in" className="text-orange-500">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
