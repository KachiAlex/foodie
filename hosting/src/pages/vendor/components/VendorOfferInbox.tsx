import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, MessageSquare, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { getOffers, updateOffer } from "@/services/communityApi";
import type { VendorMarketOffer } from "@/services/communityApi";

export function VendorOfferInbox() {
  const { symbol } = useCurrency();
  const { showToast } = useToast();
  const [offers, setOffers] = useState<VendorMarketOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getOffers()
      .then(setOffers)
      .catch(() => showToast("Failed to load offers"))
      .finally(() => setIsLoading(false));
  }, [showToast]);

  const handleAction = async (offer: VendorMarketOffer, status: "accepted" | "rejected", counterPrice?: number, counterNote?: string) => {
    setActionId(offer.id);
    try {
      await updateOffer(offer.id, {
        status: counterPrice ? "countered" : status,
        proposedPrice: counterPrice,
        note: counterNote,
      });
      showToast(status === "accepted" ? "Offer accepted" : "Offer rejected");
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, status: counterPrice ? "countered" : status } : o)));
    } catch {
      showToast("Failed to update offer");
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Inbox className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-4 text-sm font-semibold text-gray-600">No offers yet</p>
        <p className="text-xs text-gray-400">Buyers will appear here when they request your dishes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{offer.menuItem.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    offer.status === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : offer.status === "accepted"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {offer.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                From {offer.buyer.name} • {offer.quantity} × {offer.servings ?? 1} serving
                {offer.servings && offer.servings > 1 ? "s" : ""}
              </p>
              {offer.deliveryDate && (
                <p className="mt-1 text-sm text-gray-500">
                  Delivery: {new Date(offer.deliveryDate).toLocaleString()}
                </p>
              )}
              {offer.note && (
                <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {offer.note}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {symbol}{Number(offer.proposedPrice).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Proposed price</p>
            </div>
          </div>

          {offer.status === "pending" && (
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-100 text-red-600 hover:bg-red-50"
                disabled={actionId === offer.id}
                onClick={() => handleAction(offer, "rejected")}
              >
                <X className="mr-2 h-4 w-4" /> Decline
              </Button>
              <Button
                className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
                disabled={actionId === offer.id}
                onClick={() => handleAction(offer, "accepted")}
              >
                <Check className="mr-2 h-4 w-4" /> Accept
              </Button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
