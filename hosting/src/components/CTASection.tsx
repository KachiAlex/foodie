import { DollarSign, Calendar, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BENEFITS = [
  { icon: DollarSign, title: "Earn Extra Income", description: "Set your own prices and earn on your own terms." },
  { icon: Calendar, title: "Flexible Schedule", description: "Cook when it works for you — full-time or weekends." },
  { icon: TrendingUp, title: "Grow Your Brand", description: "Build a loyal customer base right in your neighbourhood." },
];

const METRICS = [
  { value: "$2,500+", label: "Avg. monthly earnings" },
  { value: "500+", label: "Active home chefs" },
  { value: "4.9★", label: "Average chef rating" },
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-28">
      {/* Background photo */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1800&q=80&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-gray-950/40" />
      </div>
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/15 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400"
            >
              For Home Chefs & Vendors
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="space-y-5"
            >
              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                Turn Your Passion<br />
                Into <span className="text-orange-400">Profit</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-lg">
                Join hundreds of home chefs already earning by sharing their culinary talents. No restaurant overhead — just your amazing food and our platform.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.ul
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="text-sm text-gray-400">{b.description}</p>
                  </div>
                </li>
              ))}
            </motion.ul>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-base font-bold text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all"
              >
                Start Selling Today <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-7 py-4 text-base font-semibold text-gray-300 hover:border-orange-500/40 hover:text-white transition-all"
              >
                I already have an account
              </Link>
            </motion.div>
          </div>

          {/* Right — metrics + trust */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
            className="space-y-6"
          >
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-4">
              {METRICS.map((m) => (
                <div key={m.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm">
                  <div className="text-2xl font-extrabold text-orange-400">{m.value}</div>
                  <div className="mt-1 text-xs text-gray-400">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Chef testimonial card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80&auto=format&fit=crop"
                  alt="Chef"
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div>
                  <p className="font-bold text-white">Amaka Okafor</p>
                  <p className="text-sm text-orange-400">Lagos · Jollof & Stews</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "I went from cooking for family to earning ₦180,000/month. Foodie Market gave me the platform and the customers."
              </p>
              <div className="mt-4 flex gap-2">
                {["Verified Chef", "50+ Orders", "5★ Rating"].map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Community link */}
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Explore the Food Community</p>
                <p className="text-xs text-gray-400 mt-0.5">Post requests, bid on dishes, connect with chefs</p>
              </div>
              <Link to="/community" className="flex items-center gap-1 text-sm font-bold text-orange-400 hover:text-orange-300 whitespace-nowrap ml-4">
                Go <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
