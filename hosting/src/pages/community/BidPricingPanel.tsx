import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, TrendingUp, TrendingDown, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBidRecommendation, type BidRecommendation } from "@/services/bidPricingApi";
import { useCurrency } from "@/context/CurrencyContext";

interface BidPricingPanelProps {
  requestId: string;
  onApplySuggestion?: (amount: number) => void;
}

export function BidPricingPanel({ requestId, onApplySuggestion }: BidPricingPanelProps) {
  const { symbol } = useCurrency();
  const [recommendation, setRecommendation] = useState<BidRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !requestId) return;
    setIsLoading(true);
    getBidRecommendation(requestId)
      .then(setRecommendation)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen, requestId]);

  const confidenceColor = {
    high: "text-emerald-600 bg-emerald-50",
    medium: "text-orange-600 bg-orange-50",
    low: "text-gray-500 bg-gray-100",
  };

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4">
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="flex w-full items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <Lightbulb className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">AI Bid Assistant</span>
        </div>
        <span className="text-sm text-gray-500">{isOpen ? "Hide" : "Show"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {isLoading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing bid history...
              </div>
            )}

            {!isLoading && recommendation && (
              <div className="mt-4 space-y-4">
                {/* Suggested bid */}
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Suggested Bid</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {symbol}{recommendation.suggestedBid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Win Probability</p>
                      <p className={`mt-1 text-2xl font-bold ${
                        recommendation.winProbability >= 60 ? "text-emerald-600" :
                        recommendation.winProbability >= 40 ? "text-orange-500" : "text-red-500"
                      }`}>
                        {recommendation.winProbability}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${confidenceColor[recommendation.confidence]}`}>
                      {recommendation.confidence} confidence
                    </span>
                    <span className="text-xs text-gray-400">
                      Based on {recommendation.bidCount} past bids
                    </span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Avg winning bid
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">
                      {symbol}{recommendation.averageWinningBid.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <TrendingDown className="h-3.5 w-3.5" />
                      Min profitable
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">
                      {symbol}{recommendation.minProfitableBid.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Apply button */}
                {onApplySuggestion && (
                  <Button
                    type="button"
                    className="w-full bg-orange-500 text-white hover:bg-orange-600"
                    onClick={() => onApplySuggestion(recommendation.suggestedBid)}
                  >
                    Use suggested bid
                  </Button>
                )}

                <div className="flex items-start gap-1.5 text-xs text-gray-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Recommendations are based on historical winning bids, your win rate, and the buyer's budget range.
                    Always use your own judgment when pricing.
                  </span>
                </div>
              </div>
            )}

            {!isLoading && !recommendation && (
              <p className="mt-4 text-sm text-gray-500">Unable to generate a recommendation. Try again later.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
