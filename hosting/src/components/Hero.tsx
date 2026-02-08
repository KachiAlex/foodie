import { Button } from "./ui/button";
import { MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { RoleToggle } from "@/components/RoleToggle";

export function Hero() {
  const stats = [
    { label: "Home Chefs", value: "500+" },
    { label: "Happy Customers", value: "10k+" },
    { label: "Cuisines", value: "50+" },
  ];
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pt-24 pb-16 overflow-hidden"
    >
      <div className="absolute inset-y-0 -right-40 w-2/3 bg-orange-200/40 blur-3xl opacity-60" aria-hidden="true" />
      <div className="absolute -top-32 -left-10 h-72 w-72 rounded-full bg-white/60 blur-3xl" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Home-Cooked Meals
                <span className="text-orange-500"> Delivered</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl">
                Connect with talented home chefs in your neighborhood. Enjoy authentic, 
                freshly prepared meals without restaurant markups.
              </p>
            </div>

            {/* Location Input */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your delivery address"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                />
              </div>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg rounded-xl h-auto"
                asChild
              >
                <Link to="/dashboard/buyer">Find Food</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-gray-500">Preview dashboards</p>
              <p className="text-lg font-semibold text-gray-900">Switch roles to explore live workspaces</p>
              <RoleToggle
                className="mt-4"
                onRoleChange={(role) => navigate(`/dashboard/${role}`)}
              />
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1602016753553-6e4cce3587be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2hlZiUyMGNvb2tpbmclMjBmcmVzaCUyMG1lYWx8ZW58MXx8fHwxNzcwNDgzMDY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Home chef cooking"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent" />
            </div>
            {/* Floating Badge */}
            <motion.div
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fresh & Quality</div>
                  <div className="text-lg font-bold text-gray-900">100% Verified Chefs</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
