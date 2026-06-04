import { useState } from "react";
import { Inbox, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import type { VendorOpenRequest } from "@/types/domain";

interface BidMarketplaceProps {
  requests: VendorOpenRequest[];
  onOpenRequest: (request: VendorOpenRequest) => void;
}

export function BidMarketplace({ requests, onOpenRequest }: BidMarketplaceProps) {
  const { symbol } = useCurrency();
  const [showFilters, setShowFilters] = useState(false);
  const [filterCuisine, setFilterCuisine] = useState("");

  const cuisines = Array.from(new Set(requests.flatMap((r) => r.tags)));
  const filteredRequests = filterCuisine
    ? requests.filter((r) => r.tags.includes(filterCuisine))
    : requests;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Open Requests</p>
          <h2 className="text-2xl font-semibold text-gray-900">Bid marketplace</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="mr-1 h-4 w-4" />
          {showFilters ? "Hide filters" : "View filters"}
        </Button>
      </div>

      {showFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filterCuisine === "" ? "default" : "outline"}
            className={filterCuisine === "" ? "bg-orange-500 text-white" : "border-gray-200 text-gray-700"}
            onClick={() => setFilterCuisine("")}
          >
            All
          </Button>
          {cuisines.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={filterCuisine === c ? "default" : "outline"}
              className={filterCuisine === c ? "bg-orange-500 text-white" : "border-gray-200 text-gray-700"}
              onClick={() => setFilterCuisine(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {requests.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-12 text-center">
            <Inbox className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No open requests right now</p>
            <p className="text-xs text-gray-400">New buyer briefs will appear here as soon as they're posted.</p>
          </div>
        )}
        {filteredRequests.map((request) => (
          <div key={request.id} className="rounded-2xl border border-gray-200 p-4 lg:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{request.id}</p>
                <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                <p className="text-sm text-gray-500">{request.location} • {request.servings}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Budget</p>
                <p className="text-xl font-bold text-gray-900">{symbol}{request.budget}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">{request.deadline}</span>
              {request.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1">{tag}</span>
              ))}
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" className="border-gray-200 text-gray-700" onClick={() => onOpenRequest(request)}>
                  View brief
                </Button>
                <Button size="sm" className="bg-orange-500 text-white" onClick={() => onOpenRequest(request)}>
                  Submit bid
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
