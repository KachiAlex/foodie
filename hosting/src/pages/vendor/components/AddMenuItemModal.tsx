import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddMenuItemPayload } from "@/services/vendorApi";

interface AddMenuItemModalProps {
  onClose: () => void;
  onSubmit: (payload: AddMenuItemPayload) => void;
}

export function AddMenuItemModal({ onClose, onSubmit }: AddMenuItemModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        price: price.trim(),
        availability: availability.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Add Menu Item</h3>
            <p className="text-sm text-gray-500">List a new dish on your menu</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full bg-gray-100 p-1 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="item-name" className="text-sm font-semibold text-gray-700">Dish name</label>
            <input
              id="item-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="e.g., Jollof Rice Special"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="item-price" className="text-sm font-semibold text-gray-700">Price</label>
            <input
              id="item-price"
              type="text"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="e.g., 2500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="item-availability" className="text-sm font-semibold text-gray-700">Availability</label>
            <select
              id="item-availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option>Available</option>
              <option>Lunch only</option>
              <option>Dinner only</option>
              <option>Weekends only</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="item-tags" className="text-sm font-semibold text-gray-700">Tags (comma separated)</label>
            <input
              id="item-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="spicy, gluten-free, vegetarian"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 border-gray-200 text-gray-700" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 text-white" disabled={submitting || !name.trim() || !price.trim()}>
              {submitting ? "Adding..." : "Add to menu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
