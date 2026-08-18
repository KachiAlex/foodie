import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Star, MapPin, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getMatchedVendors, type VendorMatchScore } from "@/services/tasteMatchApi";

function getMatchColor(score: number) {
  if (score >= 75) return { bg: "bg-emerald-500", text: "text-emerald-600", label: "Great match" };
  if (score >= 50) return { bg: "bg-orange-500", text: "text-orange-600", label: "Good match" };
  if (score >= 30) return { bg: "bg-yellow-500", text: "text-yellow-600", label: "Fair match" };
  return { bg: "bg-gray-400", text: "text-gray-500", label: "Low match" };
}

export function TasteMatch() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<VendorMatchScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getMatchedVendors()
      .then(setVendors)
      .catch(() => showToast("Failed to load taste matches"))
      .finally(() => setIsLoading(false));
  }, [user, showToast]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-32 pb-16 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Sign in to see your taste matches</h1>
          <p className="mt-2 text-gray-600">We'll recommend vendors based on your order history and reviews.</p>
          <Button className="mt-6 bg-orange-500 hover:bg-orange-600" asChild>
            <a href="/auth/sign-in">Sign in</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recommended for You</h1>
            <p className="mt-1 text-gray-600">Vendors matched to your taste profile based on your orders and reviews.</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" asChild>
            <a href="/community/vendor-market">Browse all vendors</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/community/circles">Food Circles</a>
          </Button>
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        )}

        {!isLoading && vendors.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-4 text-sm font-semibold text-gray-600">No matches yet</p>
            <p className="text-xs text-gray-400">Place a few orders and leave reviews to get personalized recommendations.</p>
          </div>
        )}

        {!isLoading && vendors.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor, idx) => {
              const match = getMatchColor(vendor.matchScore);
              return (
                <motion.div
                  key={vendor.vendorId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={`/community/vendors/${vendor.vendorId}`}
                    className="block rounded-3xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{vendor.kitchenName}</h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {vendor.rating.toFixed(1)}
                          </span>
                          {(vendor.city || vendor.state) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${match.bg} text-white shadow-md`}>
                          <span className="text-lg font-bold">{vendor.matchScore}%</span>
                        </div>
                        <span className={`mt-1 text-xs font-medium ${match.text}`}>{match.label}</span>
                      </div>
                    </div>
                    {vendor.specialties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {vendor.specialties.slice(0, 4).map((s) => (
                          <span key={s} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
