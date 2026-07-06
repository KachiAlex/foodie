import { useMemo, useState, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Flame,
  MapPin,
  Plus,
  Quote,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useCurrency } from "@/context/CurrencyContext";
import { NewRequestModal } from "@/components/NewRequestModal";
import { PaystackCheckout } from "@/components/PaystackCheckout";
import type { VendorBid } from "@/types/domain";
import { listVendors } from "@/services/vendorApi";
import type { FeaturedVendor } from "@/services/vendorApi";

export function BuyerDashboard() {
  const { requests, orders, bids, acceptBid } = useApp();
  const { symbol } = useCurrency();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [bidFilter, setBidFilter] = useState<"all" | "collecting_bids" | "in_progress" | "fulfilled">("all");
  const [timelineRequestId, setTimelineRequestId] = useState<string | null>(null);
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<{ orderId: string; amount: number; foodName: string } | null>(null);
  const [vendors, setVendors] = useState<FeaturedVendor[]>([]);
  const [expandedRequestIds, setExpandedRequestIds] = useState<Set<string>>(new Set());
  const [spendRange, setSpendRange] = useState<"7d" | "30d">("7d");
  const [hoveredSpend, setHoveredSpend] = useState<{ label: string; value: number } | null>(null);

  useEffect(() => {
    listVendors().then(setVendors).catch(() => {});
  }, []);

  const handleAcceptBid = async (bid: VendorBid, requestId: string) => {
    if (acceptingBidId) return;
    setAcceptingBidId(bid.id);
    try {
      const { order } = await acceptBid(bid.id, requestId);
      const req = requests.find((r) => r.id === requestId);
      setCheckoutOrder({ orderId: order.id, amount: order.amount, foodName: req?.title ?? bid.chef });
    } catch {
      // handled by context
    } finally {
      setAcceptingBidId(null);
    }
  };

  const toggleExpand = (id: string) =>
    setExpandedRequestIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Derived data ──────────────────────────────────────────────────────────
  const bidsByRequest = useMemo(
    () =>
      bids.reduce<Record<string, typeof bids>>((acc, bid) => {
        acc[bid.requestId] = acc[bid.requestId] ? [...acc[bid.requestId], bid] : [bid];
        return acc;
      }, {}),
    [bids],
  );

  const actionableRequests = useMemo(
    () => requests.filter((r) => r.status === "collecting_bids" && (bidsByRequest[r.id]?.length ?? 0) > 0),
    [requests, bidsByRequest],
  );

  const activeOrders = useMemo(() => orders.filter((o) => o.status !== "Delivered"), [orders]);
  const nextDelivery = activeOrders[0] ?? null;

  const activeRequestCount = requests.filter((r) => r.status !== "fulfilled").length;
  const totalSpendAll = orders.reduce((sum, o) => sum + o.amount, 0);
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const onTimeRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0;

  const filteredRequests = useMemo(
    () => requests.filter((r) => bidFilter === "all" || r.status === bidFilter),
    [requests, bidFilter],
  );

  // ── Spend trend (real dates) ──────────────────────────────────────────────
  const spendTrend = useMemo(() => {
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    if (spendRange === "7d") {
      const buckets: { label: string; date: Date; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        buckets.push({ label: DAY_LABELS[d.getDay()], date: d, value: 0 });
      }
      orders.forEach((o) => {
        const orderDate = o.createdAt ? new Date(o.createdAt) : now;
        buckets.forEach((b) => {
          if (orderDate.toDateString() === b.date.toDateString()) b.value += o.amount;
        });
      });
      return buckets.map(({ label, value }) => ({ label, value }));
    } else {
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 28);
      const weeks = ["W1", "W2", "W3", "W4"];
      const totals: Record<string, number> = { W1: 0, W2: 0, W3: 0, W4: 0 };
      orders.forEach((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : now;
        if (d < cutoff) return;
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
        const weekIdx = Math.min(3, Math.floor(diffDays / 7));
        totals[weeks[3 - weekIdx]] += o.amount;
      });
      return weeks.map((w) => ({ label: w, value: totals[w] }));
    }
  }, [orders, spendRange]);

  const maxSpendValue = Math.max(...spendTrend.map((d) => d.value), 1);
  const totalSpendPeriod = spendTrend.reduce((s, d) => s + d.value, 0);
  const avgTicket = orders.length > 0 ? Math.round(totalSpendAll / orders.length) : 0;

  // ── Fulfillment breakdown ─────────────────────────────────────────────────
  const fulfillmentBreakdown = useMemo(() => {
    const total = Math.max(orders.length, 1);
    return [
      { label: "Delivered", value: Math.round((orders.filter((o) => o.status === "Delivered").length / total) * 100), color: "bg-emerald-500" },
      { label: "Cooking", value: Math.round((orders.filter((o) => o.status === "Cooking").length / total) * 100), color: "bg-orange-300" },
      { label: "En route", value: Math.round((orders.filter((o) => o.status === "Out for delivery").length / total) * 100), color: "bg-rose-400" },
    ];
  }, [orders]);

  const handleSpendKeyNavigation = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const sibling = event.key === "ArrowRight"
      ? event.currentTarget.nextElementSibling
      : event.currentTarget.previousElementSibling;
    if (sibling instanceof HTMLButtonElement) sibling.focus();
  };

  const getTimelineForRequest = (requestId: string) => {
    const requestBids = bids.filter((b) => b.requestId === requestId);
    if (requestBids.length === 0) return [{ step: "Brief posted", time: "Pending", detail: "Waiting for chefs to submit bids." }];
    return [
      { step: "Brief posted", time: "—", detail: "Your food brief is live." },
      ...requestBids.map((b) => ({ step: `Bid from ${b.chef}`, time: `${symbol}${b.price.toLocaleString()}`, detail: b.eta })),
    ];
  };

  return (
    <DashboardLayout
      sidebar={{
        title: "Buyer",
        nav: [
          { label: "Overview", to: "/dashboard/buyer", icon: <Quote className="h-4 w-4" /> },
          { label: "Requests", to: "/dashboard/buyer?tab=requests", icon: <Plus className="h-4 w-4" /> },
          { label: "Orders", to: "/dashboard/buyer?tab=orders", icon: <Bell className="h-4 w-4" /> },
        ],
      }}
      title="Buyer Control Center"
      description="Coordinate custom food requests, bids, and direct orders."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/community/vendor-market">Find Vendors</Link>
          </Button>
          <Button className="gap-2 bg-orange-500 text-white" onClick={() => setShowNewRequest(true)}>
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── 1. Needs Action strip ─────────────────────────────────────── */}
        <AnimatePresence>
          {actionableRequests.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10 p-5"
            >
              <div className="flex items-center gap-2 text-orange-400">
                <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                <p className="text-sm font-semibold">
                  {actionableRequests.length} {actionableRequests.length === 1 ? "request needs" : "requests need"} your decision
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {actionableRequests.map((req) => {
                  const reqBids = bidsByRequest[req.id] ?? [];
                  const lowestBid = reqBids.reduce((min, b) => b.price < min.price ? b : min, reqBids[0]);
                  return (
                    <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{req.title}</p>
                        <p className="text-xs text-orange-300">{reqBids.length} bids · lowest {symbol}{lowestBid.price.toLocaleString()} · budget {symbol}{req.budget.toLocaleString()}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-500 text-white hover:bg-orange-600"
                        onClick={() => {
                          setExpandedRequestIds((prev) => { const n = new Set(prev); n.add(req.id); return n; });
                          document.getElementById(`request-${req.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                      >
                        Review bids
                      </Button>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── 2. KPI strip ──────────────────────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active briefs", value: activeRequestCount, meta: "open for bidding", icon: Flame, bg: "bg-gradient-to-br from-orange-500 to-amber-500", iconBg: "bg-white/20", text: "text-white" },
            { label: "Active orders", value: activeOrders.length, meta: "in progress", icon: CalendarClock, bg: "bg-gradient-to-br from-violet-600 to-purple-700", iconBg: "bg-white/20", text: "text-white" },
            { label: "Total spent", value: `${symbol}${totalSpendAll.toLocaleString()}`, meta: "all time", icon: CheckCircle2, bg: "bg-gradient-to-br from-emerald-500 to-teal-600", iconBg: "bg-white/20", text: "text-white" },
            { label: "On-time rate", value: `${onTimeRate}%`, meta: `${orders.length} deliveries`, icon: BadgeCheck, bg: "bg-gradient-to-br from-blue-500 to-cyan-600", iconBg: "bg-white/20", text: "text-white" },
          ].map((card) => (
            <div key={card.label} className={`relative overflow-hidden rounded-2xl p-5 shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${card.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">{card.label}</p>
                  <p className={`mt-2 text-3xl font-extrabold ${card.text}`}>{card.value}</p>
                  <p className="text-xs text-white/70 mt-0.5">{card.meta}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${card.iconBg}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* ── 3. Next delivery + spend chart ────────────────────────────── */}
        <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Spend</p>
                <h3 className="text-2xl font-extrabold text-white">{symbol}{totalSpendPeriod.toLocaleString()}</h3>
                <p className="text-xs text-gray-400">Avg ticket {symbol}{avgTicket.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {(["7d", "30d"] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setSpendRange(r)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${spendRange === r ? "bg-orange-500 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              {spendTrend.map((day) => (
                <button key={day.label} type="button"
                  onMouseEnter={() => setHoveredSpend(day)} onMouseLeave={() => setHoveredSpend(null)}
                  onFocus={() => setHoveredSpend(day)} onBlur={() => setHoveredSpend(null)}
                  onKeyDown={handleSpendKeyNavigation}
                  className="flex-1" aria-label={`${day.label}: ${symbol}${day.value}`}>
                  <div className="relative h-28 rounded-2xl bg-white/5">
                    <div className={`absolute bottom-2 left-2 right-2 rounded-2xl bg-gradient-to-t from-orange-500 to-amber-400 transition-shadow ${hoveredSpend?.label === day.label ? "shadow-lg" : ""}`}
                      style={{ height: `${(day.value / maxSpendValue) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-center text-xs text-gray-400">{day.label}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-white/5 p-3 text-sm">
              {hoveredSpend ? (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{hoveredSpend.label}</span>
                  <span className="font-semibold text-orange-400">{symbol}{hoveredSpend.value.toLocaleString()}</span>
                </div>
              ) : (
                <p className="text-gray-500">Hover a bar to inspect spend</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Empty state dashed box update */}
            {nextDelivery ? (
              <div className="rounded-2xl bg-gray-950 p-6 text-white relative overflow-hidden">
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Next delivery</p>
                <h3 className="mt-2 text-xl font-bold">{nextDelivery.chef}</h3>
                <p className="text-white/60 text-sm mt-0.5">{nextDelivery.dishes}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide">Status</p>
                    <p className="font-bold capitalize text-sm mt-1">{nextDelivery.status}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide">Amount</p>
                    <p className="font-bold text-emerald-400 text-sm mt-1">{symbol}{nextDelivery.amount.toLocaleString()}</p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center rounded-xl bg-orange-500/20 px-3 py-1.5 text-xs font-bold text-orange-300">ETA {nextDelivery.eta}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 p-8 text-center">
                <CalendarClock className="h-8 w-8 text-gray-600" />
                <p className="mt-3 text-sm font-semibold text-gray-400">No active deliveries</p>
                <Button size="sm" className="mt-4 bg-orange-500 text-white" onClick={() => setShowNewRequest(true)}>
                  Place a request
                </Button>
              </div>
            )}

            <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fulfillment</p>
              <p className="mt-1 text-2xl font-semibold text-white">{onTimeRate}% delivered</p>
              <div className="mt-4 space-y-3">
                {fulfillmentBreakdown.map((e) => (
                  <div key={e.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${e.color}`} />{e.label}</span>
                      <span>{e.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className={`h-1.5 rounded-full ${e.color}`} style={{ width: `${e.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Unified requests + bids + filter ───────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Your requests</h2>
                <p className="text-sm text-gray-400">{requests.length} total · {activeRequestCount} active</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Collecting bids", value: "collecting_bids" },
                  { label: "In progress", value: "in_progress" },
                  { label: "Fulfilled", value: "fulfilled" },
                ].map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => setBidFilter(opt.value as typeof bidFilter)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${bidFilter === opt.value ? "border-orange-500 bg-orange-500 text-white" : "border-white/15 text-gray-400 hover:border-orange-500/50 hover:text-orange-400"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 py-12 text-center">
                <Filter className="h-8 w-8 text-gray-600" />
                <p className="mt-3 text-sm font-semibold text-gray-400">No requests match this filter</p>
                <Button size="sm" variant="ghost" className="mt-2 text-orange-600" onClick={() => setBidFilter("all")}>Clear filter</Button>
              </div>
            )}

            {filteredRequests.map((request) => {
              const reqBids = bidsByRequest[request.id] ?? [];
              const isExpanded = expandedRequestIds.has(request.id);
              const hasActionable = request.status === "collecting_bids" && reqBids.length > 0;
              return (
                <motion.div
                  key={request.id}
                  id={`request-${request.id}`}
                  className={`rounded-2xl border p-5 shadow-sm transition-all ${hasActionable ? "border-orange-500/40 bg-orange-500/5 ring-1 ring-orange-500/20" : "border-white/8 bg-[#1a1d27]"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          request.status === "collecting_bids" ? "bg-amber-50 text-amber-700" :
                          request.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                          request.status === "fulfilled" ? "bg-emerald-50 text-emerald-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {request.status.replace(/_/g, " ")}
                        </span>
                        {hasActionable && <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600"><Zap className="h-3 w-3" /> Action needed</span>}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">{request.title}</h3>
                      <p className="text-sm text-gray-400">{request.cuisine} · {request.portionType} · {request.servings} servings · {request.deliveryWindow}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Budget</p>
                      <p className="text-2xl font-bold text-orange-400">{symbol}{request.budget.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{reqBids.length} bid{reqBids.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {reqBids.length > 0 && (
                    <button
                      type="button"
                      className="mt-4 flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/10"
                      onClick={() => toggleExpand(request.id)}
                    >
                      <span>{isExpanded ? "Hide" : "Show"} {reqBids.length} bid{reqBids.length !== 1 ? "s" : ""}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}

                  <AnimatePresence>
                    {isExpanded && reqBids.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {reqBids.map((bid) => (
                            <div key={bid.id} className="rounded-xl border border-white/8 bg-white/5 p-4">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-white">{bid.chef}</p>
                                <span className="text-xs text-emerald-400">{bid.confidence}% match</span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                                <span className="text-base font-bold text-orange-400">{symbol}{bid.price.toLocaleString()}</span>
                                <span>{bid.eta}</span>
                              </div>
                              {request.status === "collecting_bids" && (
                                <Button
                                  size="sm"
                                  className="mt-3 w-full bg-orange-500 text-white hover:bg-orange-600"
                                  disabled={acceptingBidId === bid.id}
                                  onClick={() => handleAcceptBid(bid, request.id)}
                                >
                                  {acceptingBidId === bid.id ? "Accepting..." : "Accept this bid"}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-500"
                      onClick={() => setTimelineRequestId(request.id)}>
                      View timeline
                    </Button>
                    <Button variant="ghost" size="sm" className="text-orange-600"
                      onClick={() => setActiveBriefId(request.id)}>
                      Details
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Sidebar: vendors + active orders ────────────────────────── */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Active orders</h3>
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">{activeOrders.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {activeOrders.length === 0 && <p className="text-sm text-gray-500">No active orders.</p>}
                {activeOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-white/8 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{order.chef}</p>
                      <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">{order.status}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                      <span>ETA: {order.eta}</span>
                      <span className="font-semibold text-emerald-400">{symbol}{order.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Verified chefs</h3>
                <Button variant="ghost" size="sm" className="text-xs text-orange-600" asChild>
                  <Link to="/dashboard/buyer">View all</Link>
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {vendors.length === 0 && <p className="text-sm text-gray-500">No verified chefs yet.</p>}
                {vendors.slice(0, 4).map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{vendor.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {vendor.city || "Lagos"}
                      </p>
                    </div>
                    <BadgeCheck className="h-4 w-4 text-orange-400" />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewRequest(true)}
              className="w-full rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-left text-white hover:opacity-90 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              <Zap className="h-6 w-6 opacity-80" />
              <h3 className="mt-3 text-lg font-semibold">Post a new request</h3>
              <p className="mt-1 text-sm text-white/80">Describe your food brief and get bids from verified chefs.</p>
            </button>
          </div>
        </section>
      </div>

      <BidTimelineModal
        requestId={timelineRequestId}
        onClose={() => setTimelineRequestId(null)}
        timeline={timelineRequestId ? getTimelineForRequest(timelineRequestId) : undefined}
        bids={timelineRequestId ? bidsByRequest[timelineRequestId] ?? [] : []}
      />

      <BriefDetailModal
        brief={activeBriefId ? requests.find((r) => r.id === activeBriefId) ?? null : null}
        onClose={() => setActiveBriefId(null)}
      />

      {showNewRequest && <NewRequestModal onClose={() => setShowNewRequest(false)} />}

      {checkoutOrder && (
        <PaystackCheckout
          orderId={checkoutOrder.orderId}
          orderAmount={checkoutOrder.amount}
          foodName={checkoutOrder.foodName}
          onClose={() => setCheckoutOrder(null)}
          onSuccess={() => setCheckoutOrder(null)}
        />
      )}
    </DashboardLayout>
  );
}

interface BidTimelineModalProps {
  requestId: string | null;
  timeline?: Array<{ step: string; time: string; detail: string }>;
  bids: VendorBid[];
  onClose: () => void;
}

function BidTimelineModal({ requestId, timeline, bids, onClose }: BidTimelineModalProps) {
  if (!requestId || !timeline) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{requestId}</p>
            <h3 className="text-2xl font-semibold text-gray-900">Bid timeline</h3>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Milestones</p>
            <div className="mt-4 space-y-4">
              {timeline.map((entry) => (
                <div key={entry.step} className="relative border-l-2 border-orange-200 pl-4">
                  <span className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-orange-500" />
                  <p className="text-xs text-gray-500">{entry.time}</p>
                  <h4 className="text-sm font-semibold text-gray-900">{entry.step}</h4>
                  <p className="text-sm text-gray-600">{entry.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Active bids</p>
            <div className="mt-4 space-y-3">
              {bids.length === 0 && <p className="text-sm text-gray-500">No bids submitted yet.</p>}
              {bids.map((bid) => (
                <div key={bid.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{bid.chef}</p>
                      <p className="text-xs text-gray-500">{bid.eta}</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">${bid.price}</span>
                  </div>
                  <p className="text-xs text-emerald-600">{bid.confidence}% kitchen confidence</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BriefDetailModalProps {
  brief: import("@/types/domain").BuyerRequest | null;
  onClose: () => void;
}

function BriefDetailModal({ brief, onClose }: BriefDetailModalProps) {
  const { symbol } = useCurrency();
  if (!brief) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{brief.id.slice(-8).toUpperCase()}</p>
            <h3 className="text-2xl font-semibold text-gray-900">{brief.title}</h3>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Cuisine</p><p className="font-semibold text-gray-900">{brief.cuisine}</p></div>
          <div><p className="text-gray-500">Servings</p><p className="font-semibold text-gray-900">{brief.servings} × {brief.portionType}</p></div>
          <div><p className="text-gray-500">Budget</p><p className="font-semibold text-gray-900">{symbol}{brief.budget.toLocaleString()}</p></div>
          <div><p className="text-gray-500">Delivery</p><p className="font-semibold text-gray-900">{brief.deliveryWindow}</p></div>
          <div><p className="text-gray-500">Status</p><p className="font-semibold text-orange-600">{brief.status}</p></div>
          <div><p className="text-gray-500">Bids</p><p className="font-semibold text-gray-900">{brief.bids}</p></div>
        </div>
      </div>
    </div>
  );
}
