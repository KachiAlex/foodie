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
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Bid health</p>
          <h3 className="text-2xl font-semibold text-gray-900">{totalBidVolume} bids this week</h3>
          <p className="text-xs text-gray-500">Average response time 14m</p>
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
            <div className="relative h-28 rounded-2xl bg-gray-50">
              <div
                className={`absolute bottom-2 left-2 right-2 rounded-2xl bg-gradient-to-t from-orange-500 to-amber-400 ${
                  bidFocus?.label === day.label ? "shadow-lg" : ""
                }`}
                style={{ height: `${(day.value / maxBidValue) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">{day.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
        {bidFocus ? (
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{bidFocus.label} focus</span>
            <span className="text-lg font-semibold text-gray-900">{bidFocus.value} bids</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span>Hover bars to see demand pockets</span>
            <span className="text-xs font-semibold text-emerald-600">+3 active briefs</span>
          </div>
        )}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Win rate", value: `${winRate}%`, icon: Activity },
          { label: "Total earned", value: `${symbol}${totalEarned}`, icon: CheckCircle2 },
          { label: "Orders done", value: `${deliveredOrders}`, icon: Clock3 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-gray-50 p-4">
            <stat.icon className="h-4 w-4 text-orange-500" />
            <p className="mt-2 text-xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
