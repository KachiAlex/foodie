import { useEffect, useState } from "react";
import { Star, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCommunityVendors, type CommunityVendor } from "@/services/vendorApi";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=600&q=80&auto=format&fit=crop";

const BADGE_COLORS: Record<string, string> = {
  "Top Rated": "bg-orange-500",
  "Verified": "bg-blue-500",
  "Popular": "bg-purple-500",
  "Healthy": "bg-emerald-500",
};

interface Chef {
  id: string;
  name: string;
  kitchenName: string;
  specialty: string;
  rating: number;
  reviews: number;
  distance: string;
  deliveryTime: string;
  image: string;
  badge: string;
}

function mapVendorToChef(v: CommunityVendor, index: number): Chef {
  const badge = v.rating >= 4.8 ? "Top Rated" : v.verified ? "Verified" : "";
  const image = v.menuItems.find((m) => m.imageUrl)?.imageUrl || FALLBACK_IMAGE;
  return {
    id: v.userId,
    name: v.user.name,
    kitchenName: v.kitchenName,
    specialty: v.specialties.slice(0, 2).join(", ") || "Local Nigerian",
    rating: v.rating,
    reviews: Math.max(0, Math.floor(v.totalOrders * 1.2) + 5),
    distance: `${(1 + (index * 0.7)).toFixed(1)} miles`,
    deliveryTime: `${20 + index * 5}-${30 + index * 5} min`,
    image,
    badge,
  };
}

export function FeaturedChefs() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchCommunityVendors()
      .then((vendors) => {
        if (!mounted) return;
        const mapped = vendors
          .filter((v) => v.verified)
          .slice(0, 4)
          .map(mapVendorToChef);
        setChefs(mapped);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load chefs");
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="relative bg-gray-950 py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,146,60,0.08),_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading chefs…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative bg-gray-950 py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,146,60,0.08),_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 text-center text-red-400">{error}</div>
      </section>
    );
  }

  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,146,60,0.08),_transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <motion.p
              className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Hand-Picked
            </motion.p>
            <motion.h2
              className="text-4xl sm:text-5xl font-extrabold text-white"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            >
              Featured Home Chefs
            </motion.h2>
          </div>
          <Link
            to="/dashboard/buyer"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            View All Chefs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefs.map((chef, i) => (
            <motion.div
              key={chef.id}
              className="group rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:border-orange-500/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                {chef.badge && (
                  <span className={`absolute top-3 left-3 ${BADGE_COLORS[chef.badge]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {chef.badge}
                  </span>
                )}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-white">{chef.rating}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white">{chef.name}</h3>
                  <p className="text-sm text-orange-400 font-medium">{chef.kitchenName}</p>
                  <p className="text-xs text-gray-400">{chef.specialty}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-200">{chef.rating}</span>
                  <span>({chef.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/10">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-orange-400" />{chef.distance}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-orange-400" />{chef.deliveryTime}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {chefs.length === 0 && (
          <p className="relative text-center text-gray-400 mt-8">No featured chefs available.</p>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            to="/dashboard/buyer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            View All Chefs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
