import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { Link } from "react-router-dom";
import type { MenuItem } from "@/types/domain";

interface MenuHighlightsProps {
  items: MenuItem[];
  compact?: boolean;
  onAddMenuItem?: () => void;
}

export function MenuHighlights({ items, compact = false, onAddMenuItem }: MenuHighlightsProps) {
  const { symbol } = useCurrency();
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{compact ? "Menu Highlights" : "Menu"}</h3>
        {compact ? (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/vendor?tab=menu">Manage</Link>
          </Button>
        ) : (
          <Button size="sm" className="bg-orange-500 text-white" onClick={onAddMenuItem}>
            Add menu item
          </Button>
        )}
      </div>
      <div className="mt-4 space-y-4">
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-10 text-center">
            <Plus className="h-7 w-7 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">Your menu is empty</p>
            <p className="text-xs text-gray-400">Add your first dish to start receiving bids.</p>
            <Button size="sm" className="mt-1 bg-orange-500 text-white" onClick={onAddMenuItem}>
              Add menu item
            </Button>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.availability}</p>
              </div>
              <span className="text-xl font-semibold text-gray-900">{symbol}{item.price}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-2 py-1">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
