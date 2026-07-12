import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Inbox, ChefHat } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";
import { fetchMyBids } from "@/services/marketApi";
import type { MyBid } from "@/services/marketApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function VendorBids() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { symbol } = useCurrency();
  const [bids, setBids] = useState<MyBid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetchMyBids(statusFilter, debouncedSearch, page);
      setBids(res.data);
      setPagination(res.pagination);
    } catch {
      showToast("Failed to load your bids");
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter, debouncedSearch, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const statuses = useMemo(
    () => Array.from(new Set(bids.map((b) => b.status))),
    [bids]
  );

  if (user?.role !== "vendor") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 text-center">
          <p className="text-gray-600">Only vendors can view this page.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link to="/community">Back to Community</Link>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
            <p className="mt-1 text-gray-600">
              Track every bid you have placed on buyer requests.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link to="/community/vendor-market">
                <ArrowLeft className="mr-2 h-4 w-4" /> Vendor Market
              </Link>
            </Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600" asChild>
              <Link to="/community/buyer-market">Find requests</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by request or message..."
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
        </div>

        {statuses.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => { setStatusFilter(""); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                statusFilter === "" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                  statusFilter === s ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        )}

        {!isLoading && bids.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-4 text-sm font-semibold text-gray-600">No bids found</p>
            <p className="text-xs text-gray-400">
              {statusFilter || debouncedSearch ? "Try adjusting your filters." : "Head to the buyer market to place your first bid."}
            </p>
            {!statusFilter && !debouncedSearch && (
              <Button className="mt-4 bg-orange-500 text-white hover:bg-orange-600" asChild>
                <Link to="/community/buyer-market">Browse requests</Link>
              </Button>
            )}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {bids.map((bid) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{bid.request.foodName}</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        bid.status === "selected"
                          ? "bg-emerald-50 text-emerald-700"
                          : bid.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : bid.status === "active"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {bid.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Bid placed on {formatDate(bid.createdAt)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {symbol}
                    {Number(bid.bidAmount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Your bid</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                <div>
                  <span className="text-gray-400">Prep time</span>
                  <p className="font-medium text-gray-900">{formatMinutes(bid.prepTimeMinutes)}</p>
                </div>
                <div>
                  <span className="text-gray-400">ETA</span>
                  <p className="font-medium text-gray-900">{bid.estimatedDeliveryTime}</p>
                </div>
                <div>
                  <span className="text-gray-400">Request status</span>
                  <p className="font-medium capitalize text-gray-900">{bid.request.status.replace("_", " ")}</p>
                </div>
              </div>

              {bid.message && (
                <p className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
                  {bid.message}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/community/buyer-market">
                    <ChefHat className="mr-2 h-4 w-4" /> View request
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
