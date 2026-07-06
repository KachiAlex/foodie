import { Search, UtensilsCrossed, PackageCheck } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Browse & Request",
      description: "Find verified home chefs near you, explore their menus, or post a custom food request.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: UtensilsCrossed,
      title: "Chef Cooks Fresh",
      description: "Your chef prepares your meal to order with quality ingredients straight from their kitchen.",
      color: "from-rose-500 to-orange-500",
    },
    {
      icon: PackageCheck,
      title: "Delivered to You",
      description: "Your food arrives hot and ready. Pay securely through escrow — only released when satisfied.",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section className="relative bg-gray-950 py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,146,60,0.08),_transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <motion.p
            className="text-sm uppercase tracking-[0.3em] text-orange-500 font-semibold"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          >
            Simple Process
          </motion.p>
          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold text-white"
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          >
            From craving to doorstep in three easy steps.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-orange-500/40 via-rose-500/40 to-emerald-500/40" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover:border-orange-500/40 hover:-translate-y-1 hover:bg-white/8 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              {/* Step number */}
              <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
                <step.icon className="h-7 w-7 text-white" />
              </div>
              <div className="absolute top-8 right-8 text-5xl font-black text-white/5 select-none leading-none">
                0{index + 1}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Step {index + 1}</div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
