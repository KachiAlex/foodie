import { MapPin, ArrowRight, ShieldCheck, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CATEGORIES = ["Jollof Rice", "Shawarma", "Egusi Soup", "Pasta", "Grilled Fish", "Puff Puff", "Fried Rice", "Pepper Soup"];

const LIVE_ORDERS = [
  { name: "Aisha O.", meal: "Jollof Rice & Chicken", time: "2 min ago", avatar: "A" },
  { name: "Tunde B.", meal: "Egusi Soup + Pounded Yam", time: "5 min ago", avatar: "T" },
];

export function Hero() {
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const stats = [
    { label: "Home Chefs", value: "500+", icon: Users },
    { label: "Happy Customers", value: "10k+", icon: Star },
    { label: "Cuisines", value: "50+", icon: ShieldCheck },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("foodie_location");
    if (saved) setLocation(saved);
    const interval = setInterval(() => setActiveCategory((c) => (c + 1) % CATEGORIES.length), 2500);
    return () => clearInterval(interval);
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    if (value.trim()) localStorage.setItem("foodie_location", value.trim());
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0f0f0f]">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1800&q=80&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-40"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Glow blobs */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-500/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-amber-400/15 blur-[90px]" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT ── */}
          <div className="space-y-8">
            {/* Trust pill */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400 backdrop-blur-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              100% Verified Home Chefs · Escrow Protected
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white">
                Real Food,<br />
                Real <span className="text-orange-400">Chefs</span>,<br />
                Your Door.
              </h1>
              <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                Skip the restaurant. Order from talented home cooks near you — authentic, fresh, and fairly priced.
              </p>
            </motion.div>

            {/* Rotating category pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {CATEGORIES.map((cat, i) => (
                <span
                  key={cat}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-500 ${
                    i === activeCategory
                      ? "bg-orange-500 text-white scale-105 shadow-lg shadow-orange-500/30"
                      : "bg-white/10 text-gray-300 border border-white/20"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                <input
                  type="text"
                  value={location}
                  onChange={handleLocationChange}
                  placeholder="Enter your delivery address"
                  className="w-full rounded-2xl border border-white/20 bg-white/10 pl-12 pr-4 py-4 text-white placeholder:text-gray-400 backdrop-blur-md focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-base"
                />
              </div>
              <Button
                size="lg"
                className="h-auto rounded-2xl bg-orange-500 px-7 py-4 text-base font-semibold text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30"
                asChild
              >
                <Link to={`/dashboard/buyer${location ? `?search=${encodeURIComponent(location)}` : ""}`}>
                  Find Food <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Secondary links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <Link to="/community" className="flex items-center gap-1 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                Explore Food Community <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="h-4 w-px bg-white/20" />
              <Link to="/auth/sign-up" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                Sell your cooking →
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-10 border-t border-white/10 pt-8"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT ── */}
          <div className="hidden lg:block relative">
            {/* Main card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop"
                alt="Delicious home-cooked food"
                className="w-full h-[540px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
              {/* Bottom label */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 px-4 py-3">
                <div>
                  <p className="text-xs text-gray-300">Most ordered today</p>
                  <p className="font-bold text-white">Jollof Rice & Grilled Chicken</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-white">
                  <Star className="h-3.5 w-3.5 fill-white" /> 4.9
                </div>
              </div>
            </motion.div>

            {/* Live order toasts */}
            {LIVE_ORDERS.map((order, i) => (
              <motion.div
                key={order.name}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.2 }}
                className={`absolute flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl ${
                  i === 0 ? "-left-10 top-10" : "-right-8 bottom-36"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {order.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{order.name} just ordered</p>
                  <p className="text-xs text-gray-500 max-w-[140px] truncate">{order.meal}</p>
                  <p className="text-[10px] text-orange-500">{order.time}</p>
                </div>
              </motion.div>
            ))}

            {/* Verified badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl whitespace-nowrap"
            >
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <div>
                <p className="text-xs text-gray-500">All chefs are</p>
                <p className="text-sm font-bold text-gray-900">Identity & Kitchen Verified</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
