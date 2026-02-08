import { Button } from "./ui/button";
import { ChefHat, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RoleToggle } from "@/components/RoleToggle";
import { useRole } from "@/context/RoleContext";

export function CTASection() {
  const { role } = useRole();
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Extra Income",
      description: "Set your own prices and schedule"
    },
    {
      icon: Calendar,
      title: "Flexible Hours",
      description: "Cook when it works for you"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Build a loyal customer base"
    }
  ];

  return (
    <motion.section
      className="py-20 bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div className="space-y-8" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <ChefHat className="w-5 h-5" />
              <span className="font-semibold">For Home Chefs & Vendors</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold">Turn Your Passion Into Profit</h2>
                <RoleToggle tone="dark" className="text-sm" />
              </div>
              <p className="text-xl text-white/90">
                Join hundreds of home chefs already earning money by sharing their 
                culinary talents. No restaurant overhead, just your amazing food.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl h-auto shadow-lg shadow-orange-900/20"
                asChild
              >
                <Link to={`/dashboard/${role}`}>Open {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl h-auto"
                asChild
              >
                <Link to="/dashboard/vendor">Browse Chef Playbook</Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Benefits Grid */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-white/80">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold">$2,500+</div>
                <div className="text-white/90">Average monthly earnings for active chefs</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
