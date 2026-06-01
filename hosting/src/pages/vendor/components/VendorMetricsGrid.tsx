import { motion } from "framer-motion";
import type { VendorMetric } from "@/types/domain";
import { useCurrency } from "@/context/CurrencyContext";

interface VendorMetricsGridProps {
  metrics: VendorMetric[];
}

export function VendorMetricsGrid({ metrics }: VendorMetricsGridProps) {
  const { symbol } = useCurrency();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <motion.div
          key={metric.label}
          className="rounded-3xl bg-white p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-gray-500">{metric.label}</p>
          <h3 className="text-3xl font-semibold text-gray-900">{symbol}{metric.value}</h3>
          <p className={`text-sm font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-500"}`}>
            {metric.change}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
