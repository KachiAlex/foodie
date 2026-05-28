import { Clock, ShoppingBag, Utensils } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorks() {
  const steps = [
    {
      icon: Clock,
      title: "Order Ahead",
      description: "Browse menus from verified home chefs around you and schedule delivery"
    },
    {
      icon: Utensils,
      title: "Chef Prepares",
      description: "Your selected chef cooks with fresh ingredients right from their kitchen"
    },
    {
      icon: ShoppingBag,
      title: "Enjoy Local",
      description: "Meals arrive hot and ready—support local chefs and eat better at home"
    }
  ];

  return (
    <motion.section
      className="py-20 bg-white relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.15),_transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <motion.p className="text-sm uppercase tracking-[0.3em] text-orange-500" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Simple Process
          </motion.p>
          <motion.h2 className="text-4xl font-bold text-gray-900" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            How Foodie Market Works
          </motion.h2>
          <motion.p className="text-lg text-gray-600 max-w-2xl mx-auto" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            Place an order in minutes and get homestyle meals cooked by neighborhood chefs.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="rounded-3xl border border-gray-200 bg-white/80 p-8 text-left shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-orange-500 mb-2">Step {index + 1}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
