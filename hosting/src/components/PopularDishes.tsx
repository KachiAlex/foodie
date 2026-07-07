import { useEffect, useState } from "react";
import { Heart, ArrowRight, Flame, Loader2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCommunityVendors } from "@/services/vendorApi";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=600&q=80&auto=format&fit=crop";

interface Dish {
  id: string;
  name: string;
  chef: string;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  hot: boolean;
}

function FavBtn({ dishId }: { dishId: string }) {
  const [fav, setFav] = useState(() => localStorage.getItem(`fav_${dishId}`) === "1");
  return (
    <button
      onClick={(e) => { e.stopPropagation(); const n = !fav; setFav(n); localStorage.setItem(`fav_${dishId}`, n ? "1" : ""); }}
      className="absolute top-3 right-3 rounded-full bg-black/40 p-2 backdrop-blur-sm hover:bg-black/60 transition-colors"
      aria-label="Toggle favourite"
    >
      <Heart className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : "text-white"}`} />
    </button>
  );
}

export function PopularDishes() {
  const { symbol } = useCurrency();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [tabs, setTabs] = useState<string[]>(["All"]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchCommunityVendors()
      .then((vendors) => {
        if (!mounted) return;
        const all = vendors.flatMap((v) =>
          v.menuItems
            .filter((m) => m.isAvailable)
            .map((m) => ({
              id: m.id,
              name: m.name,
              chef: v.user.name,
              price: Number(m.price),
              image: m.imageUrl || FALLBACK_IMAGE,
              category: m.category,
              isVegetarian: false,
              hot: false,
            }))
        );
        setDishes(all);
        const categories = Array.from(new Set(all.map((d) => d.category))).sort();
        setTabs(["All", ...categories.slice(0, 5)]);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load dishes");
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = active === "All" ? dishes : dishes.filter((d) => d.category === active);

  if (loading) {
    return (
      <section className="relative bg-gray-950 py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(251,146,60,0.08),_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading dishes…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative bg-gray-950 py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(251,146,60,0.08),_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 text-center text-red-400">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(251,146,60,0.08),_transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <motion.p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Today's Menu
            </motion.p>
            <motion.h2 className="text-4xl sm:text-5xl font-extrabold text-white" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Popular Dishes
            </motion.h2>
          </div>
          <Link to="/dashboard/buyer" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Explore All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active === tab
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "border border-white/20 bg-white/5 text-gray-300 hover:border-orange-500/40 hover:text-orange-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dish, i) => (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="group rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:border-orange-500/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                  <FavBtn dishId={dish.id} />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {dish.isVegetarian && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">Veg</span>}
                    {dish.hot && <span className="flex items-center gap-0.5 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white"><Flame className="h-3 w-3" />Hot</span>}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">{dish.category}</p>
                  <h3 className="text-base font-bold text-white mb-0.5 line-clamp-1">{dish.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">by {dish.chef}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-white">{symbol}{dish.price.toLocaleString()}</span>
                    </div>
                    <Link
                      to="/dashboard/buyer"
                      className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
                    >
                      Order
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="relative text-center text-gray-400 mt-8">No dishes available in this category.</p>
        )}

        <div className="mt-8 sm:hidden text-center">
          <Link to="/dashboard/buyer" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400">
            Explore All Dishes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
