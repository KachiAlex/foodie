import { motion } from "framer-motion";
import type { VendorMetric } from "@/types/domain";
import { useCurrency } from "@/context/CurrencyContext";

interface VendorMetricsGridProps {
  metrics: VendorMetric[];
}

const ACCENT_BARS = ["bg-orange-500", "bg-emerald-500", "bg-blue-500"];

export function VendorMetricsGrid({ metrics }: VendorMetricsGridProps) {
  const { symbol } = useCurrency();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${ACCENT_BARS[i % ACCENT_BARS.length]} rounded-l-2xl`} />
          <div className="pl-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{metric.label}</p>
            <h3 className="mt-2 text-3xl font-extrabold text-gray-900">{symbol}{metric.value}</h3>
            <p className={`mt-1 text-sm font-semibold ${metric.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {metric.change}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
