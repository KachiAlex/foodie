import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed, ClipboardList, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export function FoodCommunity() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            Food Community
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600"
          >
            Two ways to eat. Choose how you want to find your next meal.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
              <ClipboardList className="h-7 w-7 text-orange-600" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-gray-900">Buyer Market</h2>
            <p className="mt-3 text-gray-600">
              Tell home chefs what you want. Post a brief, compare bids, and pick the best offer.
            </p>
            <Link
              to="/community/buyer-market"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700"
            >
              Post a request <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <UtensilsCrossed className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-gray-900">Vendor Market</h2>
            <p className="mt-3 text-gray-600">
              Browse ready-made dishes from verified home chefs. Request a dish or negotiate a custom order.
            </p>
            <Link
              to="/community/vendor-market"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Browse dishes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
