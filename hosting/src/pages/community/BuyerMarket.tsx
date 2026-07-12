import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  Store,
  Star,
  MapPin,
  BadgeCheck,
  ChefHat,
  MessageSquare,
  Check,
  X,
  UtensilsCrossed,
  Filter,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  fetchMarketRequests,
  placeBid,
  updateBid,
  counterBid,
  rejectBid,
  selectBid,
} from "@/services/marketApi";
import type { MarketRequest, MarketBid, MarketBidVendor } from "@/services/marketApi";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function isCounter(message?: string | null) {
  return message?.startsWith("Counter:") ?? false;
}

function counterText(message?: string | null) {
  return message?.replace(/^Counter:\s*/, "") ?? "";
}

interface VendorProfileModalProps {
  vendor: MarketBidVendor;
  onClose: () => void;
}

function VendorProfileModal({ vendor, onClose }: VendorProfileModalProps) {
  const profile = vendor.vendorProfile;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-white">
              {initials(vendor.name)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{profile?.kitchenName || vendor.name}</h3>
              <p className="text-sm text-gray-500">{vendor.email}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-1 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <div className="flex flex-wrap gap-2">
            {profile?.verified && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            {profile?.isOnline ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">Online</span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-500">Offline</span>
            )}
          </div>
          {profile?.rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold text-gray-900">{profile.rating.toFixed(1)}</span>
              <span>({profile.totalOrders || 0} orders)</span>
            </div>
          )}
          {profile?.specialties?.length ? (
            <div className="flex items-start gap-2">
              <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>{profile.specialties.slice(0, 5).join(", ")}</span>
            </div>
          ) : null}
          {(profile?.city || profile?.state) && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>{[profile.city, profile.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BidModalProps {
  request: MarketRequest;
  bid?: MarketBid;
  mode: "place" | "edit";
  onClose: () => void;
  onSubmit: (values: {
    bidAmount: number;
    prepTimeMinutes: number;
    estimatedDeliveryTime: string;
    message: string;
  }) => void;
  isSubmitting: boolean;
}

function BidModal({ request, bid, mode, onClose, onSubmit, isSubmitting }: BidModalProps) {
  const [amount, setAmount] = useState(bid?.bidAmount ? Number(bid.bidAmount) : request.budgetMax || 0);
  const [prep, setPrep] = useState(bid?.prepTimeMinutes || 60);
  const [eta, setEta] = useState(bid?.estimatedDeliveryTime || "");
  const [message, setMessage] = useState(bid?.message?.startsWith("Counter:") ? "" : bid?.message || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{mode === "place" ? "Place bid" : "Edit bid"}</h3>
            <p className="text-sm text-gray-500">{request.foodName}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-1 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ bidAmount: amount, prepTimeMinutes: prep, estimatedDeliveryTime: eta, message });
          }}
          className="mt-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Bid amount</label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Prep time (minutes)</label>
              <input
                type="number"
                min={0}
                required
                value={prep}
                onChange={(e) => setPrep(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Estimated delivery time</label>
            <input
              type="text"
              required
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              placeholder="e.g., 45 mins"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Message to buyer</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce your kitchen and explain your offer"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-200 text-gray-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-orange-500 text-white">
              {isSubmitting ? "Saving..." : mode === "place" ? "Submit bid" : "Update bid"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CounterModalProps {
  bid: MarketBid;
  onClose: () => void;
  onSubmit: (amount: number, message: string) => void;
  isSubmitting: boolean;
}

function CounterModal({ bid, onClose, onSubmit, isSubmitting }: CounterModalProps) {
  const [amount, setAmount] = useState(Number(bid.bidAmount));
  const [message, setMessage] = useState(counterText(bid.message));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Counter offer</h3>
            <p className="text-sm text-gray-500">
              Propose a new price to {bid.vendor.vendorProfile?.kitchenName || bid.vendor.name}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-1 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(amount, message);
          }}
          className="mt-6 space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Your counter amount</label>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why this price works for you"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-200 text-gray-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-orange-500 text-white">
              {isSubmitting ? "Sending..." : "Send counter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BuyerMarket() {
  const { symbol } = useCurrency();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minBudget, setMinBudget] = useState<number | "">("");
  const [maxBudget, setMaxBudget] = useState<number | "">("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [hasBids, setHasBids] = useState<"" | "yes" | "no">("");
  const [sortBy, setSortBy] = useState<"newest" | "budget-low" | "budget-high" | "most-bids">("newest");
  const [bidRequest, setBidRequest] = useState<MarketRequest | null>(null);
  const [editBid, setEditBid] = useState<MarketBid | null>(null);
  const [counterTarget, setCounterTarget] = useState<MarketBid | null>(null);
  const [profileVendor, setProfileVendor] = useState<MarketBidVendor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMarketRequests();
      setRequests(data);
    } catch {
      showToast("Failed to load buyer market");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [showToast]);

  const categories = useMemo(
    () => Array.from(new Set(requests.map((r) => r.category))),
    [requests]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minB = minBudget === "" ? 0 : Number(minBudget);
    const maxB = maxBudget === "" ? Infinity : Number(maxBudget);
    const selectedDate = deliveryDate ? new Date(deliveryDate).setHours(0, 0, 0, 0) : null;

    const list = requests
      .filter((r) => {
        const matchesCategory = !category || r.category === category;
        const matchesSearch =
          !q ||
          r.foodName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.deliveryAddress.toLowerCase().includes(q) ||
          r.buyer.name.toLowerCase().includes(q);
        const matchesBudget = r.budgetMax >= minB && r.budgetMin <= maxB;
        const matchesBids =
          hasBids === "" ||
          (hasBids === "yes" ? r.bids.length > 0 : r.bids.length === 0);
        const matchesDate =
          !selectedDate ||
          new Date(r.deliveryDateTime).setHours(0, 0, 0, 0) === selectedDate;
        return matchesCategory && matchesSearch && matchesBudget && matchesBids && matchesDate && r.status === "open";
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "budget-low":
            return a.budgetMin - b.budgetMin;
          case "budget-high":
            return b.budgetMax - a.budgetMax;
          case "most-bids":
            return b.bids.length - a.bids.length;
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });

    return list;
  }, [requests, search, category, minBudget, maxBudget, deliveryDate, hasBids, sortBy]);

  const activeFilterCount = [
    minBudget !== "",
    maxBudget !== "",
    !!deliveryDate,
    !!hasBids,
    sortBy !== "newest",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setMinBudget("");
    setMaxBudget("");
    setDeliveryDate("");
    setHasBids("");
    setSortBy("newest");
  };

  const isBuyer = (request: MarketRequest) => user?.role === "buyer" && user?.id === request.buyer.id;
  const isVendor = () => user?.role === "vendor";
  const ownsBid = (bid: MarketBid) => user?.id === bid.vendorId;

  const handlePlaceBid = async (values: {
    bidAmount: number;
    prepTimeMinutes: number;
    estimatedDeliveryTime: string;
    message: string;
  }) => {
    if (!bidRequest || !user) return;
    setSubmitting(true);
    try {
      await placeBid({ requestId: bidRequest.id, ...values });
      showToast("Bid placed");
      setBidRequest(null);
      await load();
    } catch {
      showToast("Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBid = async (values: {
    bidAmount: number;
    prepTimeMinutes: number;
    estimatedDeliveryTime: string;
    message: string;
  }) => {
    if (!editBid || !user) return;
    setSubmitting(true);
    try {
      await updateBid(editBid.id, values);
      showToast("Bid updated");
      setEditBid(null);
      await load();
    } catch {
      showToast("Failed to update bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCounter = async (amount: number, message: string) => {
    if (!counterTarget || !user) return;
    setSubmitting(true);
    try {
      await counterBid(counterTarget.id, amount, message);
      showToast("Counter offer sent");
      setCounterTarget(null);
      await load();
    } catch {
      showToast("Failed to send counter offer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (bid: MarketBid) => {
    setSubmitting(true);
    try {
      await rejectBid(bid.id);
      showToast("Bid rejected");
      await load();
    } catch {
      showToast("Failed to reject bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = async (bid: MarketBid) => {
    setSubmitting(true);
    try {
      await selectBid(bid.id);
      showToast("Vendor selected");
      await load();
    } catch {
      showToast("Failed to select vendor");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBid = (request: MarketRequest) => request.bids.find((b) => b.status === "selected");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Market</h1>
            <p className="mt-1 text-gray-600">
              Open food requests from buyers. Vendors bid, buyers negotiate, then pick the best vendor.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/community">Back to Food Community</Link>
          </Button>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests, cuisines, or locations"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-gray-200 text-gray-700"
              onClick={() => setShowFilters((s) => !s)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Min budget</label>
                <input
                  type="number"
                  min={0}
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Min budget"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Max budget</label>
                <input
                  type="number"
                  min={0}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Max budget"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Delivery date</label>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bids</label>
                <select
                  value={hasBids}
                  onChange={(e) => setHasBids(e.target.value as "" | "yes" | "no")}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                >
                  <option value="">Any</option>
                  <option value="yes">Has bids</option>
                  <option value="no">No bids yet</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sort by</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "newest", label: "Newest" },
                    { value: "budget-low", label: "Budget: low to high" },
                    { value: "budget-high", label: "Budget: high to low" },
                    { value: "most-bids", label: "Most bids" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortBy(option.value as typeof sortBy)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        sortBy === option.value
                          ? "bg-orange-500 text-white"
                          : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="ml-auto flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" /> Clear filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {!user && (
          <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-sm text-orange-700">
            <Link to="/auth/sign-in" className="font-semibold underline">
              Sign in
            </Link>{" "}
            to place bids, counter offers, or select a vendor.
          </div>
        )}

        {isLoading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-4 text-sm font-semibold text-gray-600">No open requests match your search</p>
            <p className="text-xs text-gray-400">Post a request or check back later.</p>
          </div>
        )}

        <div className="mt-8 space-y-8">
          {filtered.map((request) => {
            const chosen = selectedBid(request);
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">{request.foodName}</h2>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                          {request.category}
                        </span>
                        {chosen && (
                          <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                            Bid selected
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Posted by {request.buyer.name} • Delivery by {formatDate(request.deliveryDateTime)}
                      </p>
                      <p className="text-sm text-gray-500">{request.deliveryAddress}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-xl font-bold text-gray-900">
                        {symbol}
                        {Number(request.budgetMin).toLocaleString()} - {symbol}
                        {Number(request.budgetMax).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.quantity} {request.unit}
                      </p>
                    </div>
                  </div>

                  {request.instructions && (
                    <p className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">{request.instructions}</p>
                  )}

                  {isVendor() && !chosen && (
                    <Button
                      className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
                      onClick={() => setBidRequest(request)}
                    >
                      <ChefHat className="mr-2 h-4 w-4" /> Place bid
                    </Button>
                  )}
                  {user?.role === "buyer" && user?.id === request.buyer.id && !chosen && (
                    <Button className="mt-4" variant="outline" asChild>
                      <Link to="/dashboard/buyer">
                        Manage request <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="border-t border-gray-100 bg-gray-50/50 p-5 sm:p-6">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
                    Bids ({request.bids.length})
                  </h3>
                  {request.bids.length === 0 ? (
                    <p className="text-sm text-gray-500">No bids yet. Be the first to bid.</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {request.bids.map((bid) => (
                        <div
                          key={bid.id}
                          className={`rounded-2xl border p-4 ${
                            bid.status === "selected"
                              ? "border-emerald-200 bg-emerald-50/50"
                              : bid.status === "rejected"
                              ? "border-gray-200 bg-gray-100/50 opacity-60"
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button
                              onClick={() => setProfileVendor(bid.vendor)}
                              className="flex items-center gap-3 text-left hover:opacity-80"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">
                                {initials(bid.vendor.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {bid.vendor.vendorProfile?.kitchenName || bid.vendor.name}
                                </p>
                                <p className="text-xs text-gray-500">{bid.vendor.name}</p>
                              </div>
                            </button>
                            {bid.vendor.vendorProfile?.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                          </div>

                          <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                              <span>Bid</span>
                              <span className="font-semibold text-gray-900">
                                {symbol}
                                {Number(bid.bidAmount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Prep</span>
                              <span>{formatMinutes(bid.prepTimeMinutes)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>ETA</span>
                              <span>{bid.estimatedDeliveryTime}</span>
                            </div>
                          </div>

                          {bid.message && (
                            <div
                              className={`mt-3 rounded-xl px-3 py-2 text-xs ${
                                isCounter(bid.message) ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              {isCounter(bid.message) ? <span className="font-semibold">Counter: </span> : null}
                              {isCounter(bid.message) ? counterText(bid.message) : bid.message}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {isBuyer(request) && bid.status === "active" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                                  onClick={() => handleSelect(bid)}
                                  disabled={submitting}
                                >
                                  <Check className="mr-1 h-3.5 w-3.5" /> Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                  onClick={() => setCounterTarget(bid)}
                                  disabled={submitting}
                                >
                                  <MessageSquare className="mr-1 h-3.5 w-3.5" /> Counter
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-200 text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleReject(bid)}
                                  disabled={submitting}
                                >
                                  <X className="mr-1 h-3.5 w-3.5" /> Reject
                                </Button>
                              </>
                            )}
                            {isVendor() && ownsBid(bid) && bid.status !== "selected" && bid.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-200 text-gray-700"
                                onClick={() => setEditBid(bid)}
                                disabled={submitting}
                              >
                                Edit bid
                              </Button>
                            )}
                            {bid.status === "selected" && (
                              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                                Selected
                              </span>
                            )}
                            {bid.status === "rejected" && (
                              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {bidRequest && (
        <BidModal
          request={bidRequest}
          mode="place"
          onClose={() => setBidRequest(null)}
          onSubmit={handlePlaceBid}
          isSubmitting={submitting}
        />
      )}
      {editBid && (
        <BidModal
          request={requests.find((r) => r.id === editBid.requestId)!}
          bid={editBid}
          mode="edit"
          onClose={() => setEditBid(null)}
          onSubmit={handleUpdateBid}
          isSubmitting={submitting}
        />
      )}
      {counterTarget && (
        <CounterModal
          bid={counterTarget}
          onClose={() => setCounterTarget(null)}
          onSubmit={handleCounter}
          isSubmitting={submitting}
        />
      )}
      {profileVendor && <VendorProfileModal vendor={profileVendor} onClose={() => setProfileVendor(null)} />}
    </div>
  );
}
