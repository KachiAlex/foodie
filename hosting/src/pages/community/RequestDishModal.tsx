import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { createOffer } from "@/services/communityApi";
import type { CommunityVendor, CommunityMenuItem } from "@/services/communityApi";

interface RequestDishModalProps {
  vendor: CommunityVendor;
  item: CommunityMenuItem;
  onClose: () => void;
}

export function RequestDishModal({ vendor, item, onClose }: RequestDishModalProps) {
  const { symbol } = useCurrency();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [servings, setServings] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const [proposedPrice, setProposedPrice] = useState(Number(item.price) || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await createOffer({
        menuItemId: item.id,
        vendorId: vendor.userId,
        quantity,
        servings,
        deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        note,
        proposedPrice,
      });
      showToast("Offer sent to the vendor");
      onClose();
    } catch {
      showToast("Failed to send offer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Request dish</h3>
            <p className="text-sm text-gray-500">
              {item.name} from {vendor.kitchenName}
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full bg-gray-100 p-1 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="servings" className="text-sm font-semibold text-gray-700">
                Servings
              </label>
              <input
                id="servings"
                type="number"
                min={1}
                required
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="delivery" className="text-sm font-semibold text-gray-700">
              Delivery date & time
            </label>
            <input
              id="delivery"
              type="datetime-local"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-semibold text-gray-700">
              Proposed price ({symbol})
            </label>
            <input
              id="price"
              type="number"
              min={0}
              required
              value={proposedPrice}
              onChange={(e) => setProposedPrice(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-semibold text-gray-700">
              Note to vendor
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., less spicy, no onions, birthday event"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 border-gray-200 text-gray-700" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 text-white"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
