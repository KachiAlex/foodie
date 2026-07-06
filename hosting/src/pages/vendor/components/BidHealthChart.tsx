import { useState } from "react";
import { Activity, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

interface BidDay {
  label: string;
  value: number;
}

interface BidHealthChartProps {
  bidTrend: BidDay[];
  totalBidVolume: number;
  winRate: number;
  totalEarned: string;
  deliveredOrders: number;
}

export function BidHealthChart({ bidTrend, totalBidVolume, winRate, totalEarned, deliveredOrders }: BidHealthChartProps) {
  const { symbol } = useCurrency();
  const { showToast } = useToast();
  const [bidFocus, setBidFocus] = useState<BidDay | null>(null);
  const maxBidValue = Math.max(...bidTrend.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Bid health</p>
          <h3 className="text-2xl font-extrabold text-white">{totalBidVolume} bids this week</h3>
          <p className="text-xs text-gray-400">Average response time 14m</p>
        </div>
        <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => showToast("Bid playbook — coming soon.")}>View playbook</Button>
      </div>
      <div className="mt-6 flex gap-2">
        {bidTrend.map((day) => (
          <button
            key={day.label}
            type="button"
            onMouseEnter={() => setBidFocus(day)}
            onMouseLeave={() => setBidFocus(null)}
            onFocus={() => setBidFocus(day)}
            onBlur={() => setBidFocus(null)}
            className="flex-1"
            aria-label={`${day.label} has ${day.value} bids`}
          >
            <div className="relative h-28 rounded-2xl bg-white/5">
              <div
                className={`absolute bottom-2 left-2 right-2 rounded-2xl bg-gradient-to-t from-orange-500 to-amber-400 ${
                  bidFocus?.label === day.label ? "shadow-lg" : ""
                }`}
                style={{ height: `${(day.value / maxBidValue) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">{day.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm">
        {bidFocus ? (
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{bidFocus.label} focus</span>
            <span className="text-lg font-extrabold text-orange-400">{bidFocus.value} bids</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Hover bars to see demand pockets</span>
            <span className="text-xs font-semibold text-emerald-400">+3 active briefs</span>
          </div>
        )}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Win rate", value: `${winRate}%`, icon: Activity, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Total earned", value: `${symbol}${totalEarned}`, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Orders done", value: `${deliveredOrders}`, icon: Clock3, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.bg}`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <p className={`mt-2 text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs uppercase tracking-widest text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
