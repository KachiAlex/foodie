import { useMemo, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  CalendarClock,
  Copy,
  Edit3,
  Filter,
  Flame,
  Heart,
  MapPin,
  Plus,
  Quote,
  Search,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  buyerOrders,
  buyerRequests,
  featuredVendors,
  vendorBids,
} from "@/data/mock";

const savedBriefs = [
  {
    id: "SB-203",
    title: "Family brunch tasting",
    updated: "Updated 2 days ago",
    tags: ["Brunch", "12 guests", "Lekki"],
    overview: "Curated tasting menu for extended family visiting from Abuja. Prioritize palm wine pairings.",
  },
  {
    id: "SB-117",
    title: "Weekly soup rotation",
    updated: "Updated yesterday",
    tags: ["Soups", "6 portions", "Vegetarian"],
    overview: "Alternating vegan soups (afang, egusi, edikaikong) delivered every Sunday evening.",
  },
];

export function BuyerDashboard() {
  const [bidFilter, setBidFilter] = useState<"all" | "collecting_bids" | "in_progress" | "fulfilled">("all");
  const [timelineRequestId, setTimelineRequestId] = useState<string | null>(null);
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);
  const activeRequests = buyerRequests.filter((request) => request.status !== "fulfilled").length;
  const onDeckOrders = buyerOrders.filter((order) => order.status !== "Delivered");
  const todayDeliveries = onDeckOrders.filter((order) => order.eta.includes("Today")).length;
  const favoriteVendors = featuredVendors.slice(0, 3);

  const insightCards = [
    {
      label: "Live briefs",
      value: activeRequests,
      meta: "open for bidding",
      icon: Flame,
      accent: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Today's drops",
      value: todayDeliveries,
      meta: "on the way",
      icon: CalendarClock,
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Favorite chefs",
      value: favoriteVendors.length,
      meta: "ready for repeat",
      icon: Heart,
      accent: "bg-rose-500/10 text-rose-600",
    },
  ];

  const nextDelivery = onDeckOrders[0];

  const bidsByRequest = vendorBids.reduce<Record<string, typeof vendorBids>>((acc, bid) => {
    acc[bid.requestId] = acc[bid.requestId] ? [...acc[bid.requestId], bid] : [bid];
    return acc;
  }, {});

  const spendTrend: Record<"7d" | "30d", Array<{ label: string; value: number }>> = {
    "7d": [
      { label: "Mon", value: 180 },
      { label: "Tue", value: 220 },
      { label: "Wed", value: 140 },
      { label: "Thu", value: 260 },
      { label: "Fri", value: 310 },
      { label: "Sat", value: 190 },
      { label: "Sun", value: 240 },
    ],
    "30d": [
      { label: "W1", value: 920 },
      { label: "W2", value: 1080 },
      { label: "W3", value: 860 },
      { label: "W4", value: 1130 },
      { label: "W5", value: 975 },
    ],
  };

  const [spendRange, setSpendRange] = useState<"7d" | "30d">("7d");
  const [hoveredSpend, setHoveredSpend] = useState<{ label: string; value: number } | null>(null);
  const activeSpendHistory = spendTrend[spendRange];
  const maxSpendValue = Math.max(...activeSpendHistory.map((day) => day.value), 1);
  const totalSpend = activeSpendHistory.reduce((sum, day) => sum + day.value, 0);
  const averageTicket = Math.round(totalSpend / activeSpendHistory.length);

  const handleSpendKeyNavigation = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const target = event.currentTarget;
    const nextElement = event.key === "ArrowRight" ? target.nextElementSibling : target.previousElementSibling;
    if (nextElement instanceof HTMLButtonElement) {
      nextElement.focus();
    }
  };

  const fulfillmentBreakdown = [
    { label: "On-time", value: 82, color: "bg-emerald-500" },
    { label: "Early", value: 10, color: "bg-orange-300" },
    { label: "Delayed", value: 8, color: "bg-rose-400" },
  ];
  const fulfillmentTotal = 25;

  const bidTimelines: Record<
    string,
    Array<{
      step: string;
      time: string;
      detail: string;
    }>
  > = {
    "REQ-2012": [
      { step: "Brief logged", time: "09:10", detail: "Buyer shared portion sizes & venue details" },
      { step: "Chefs invited", time: "09:22", detail: "6 chefs notified" },
      { step: "First bid", time: "09:41", detail: "Chef Amaka submitted $305" },
      { step: "Revision requested", time: "10:05", detail: "Buyer asked for suya add-on" },
    ],
    "REQ-0894": [
      { step: "Brief logged", time: "Yesterday", detail: "Weekly soup rotation requirements" },
      { step: "Chefs invited", time: "Yesterday", detail: "3 vegan-specialist chefs" },
      { step: "Bid shortlist", time: "Today", detail: "Chef Ada & Chef Mimi shortlisted" },
    ],
  };

  const filteredBidRequests = useMemo(
    () =>
      buyerRequests.filter((request) =>
        bidFilter === "all" ? true : request.status === bidFilter,
      ),
    [bidFilter],
  );

  const getTimelineForRequest = (requestId: string) =>
    bidTimelines[requestId] ?? [
      {
        step: "Tracking starts",
        time: "Pending",
        detail: "Milestones will show here once bids begin flowing for this request.",
      },
    ];

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
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" /> Find Vendors
          </Button>
          <Button className="gap-2 bg-orange-500 text-white">
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-3">
          {insightCards.map((card) => (
            <div key={card.label} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{card.value}</p>
                  <p className="text-xs font-medium text-gray-500">{card.meta}</p>
                </div>
                <span className={`rounded-2xl p-3 ${card.accent}`}>
                  <card.icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Spend velocity</p>
                <h3 className="text-2xl font-semibold text-gray-900">${totalSpend}</h3>
                <p className="text-xs text-gray-500">Average ticket ${averageTicket}</p>
              </div>
              <div className="flex gap-2">
                {["7d", "30d"].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setSpendRange(range as typeof spendRange)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      spendRange === range ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              {activeSpendHistory.map((day) => (
                <button
                  key={day.label}
                  type="button"
                  onMouseEnter={() => setHoveredSpend(day)}
                  onMouseLeave={() => setHoveredSpend(null)}
                  onFocus={() => setHoveredSpend(day)}
                  onBlur={() => setHoveredSpend(null)}
                  onKeyDown={handleSpendKeyNavigation}
                  className="flex-1"
                  aria-label={`Spent $${day.value} on ${day.label}`}
                >
                  <div className="relative h-32 rounded-2xl bg-gray-50">
                    <div
                      className={`absolute bottom-2 left-2 right-2 rounded-2xl bg-gradient-to-t from-orange-500 to-amber-400 ${
                        hoveredSpend?.label === day.label ? "shadow-lg" : ""
                      }`}
                      style={{ height: `${(day.value / maxSpendValue) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-gray-500">{day.label}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
              {hoveredSpend ? (
                <div className="flex items-center justify-between">
                  <span>
                    <span className="font-semibold text-gray-900">{hoveredSpend.label}</span>
                    <span className="ml-2 text-gray-500">spend</span>
                  </span>
                  <span className="text-lg font-semibold text-gray-900">${hoveredSpend.value}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>Hover a bar to inspect spend</span>
                  <span className="text-xs font-semibold text-emerald-600">+12% vs prior</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Fulfillment rate</p>
                <h3 className="text-2xl font-semibold text-gray-900">94% on-time</h3>
                <p className="text-xs text-gray-500">Across last {fulfillmentTotal} deliveries</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">SLA target 90%</span>
            </div>
            <div className="mt-6 space-y-4">
              {fulfillmentBreakdown.map((entry) => (
                <div key={entry.label} className="space-y-2 rounded-2xl bg-gray-50 p-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${entry.color}`} />
                      {entry.label}
                    </span>
                    <span>
                      {entry.value}% · {Math.round((entry.value / 100) * fulfillmentTotal)} drops
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white">
                    <div className={`h-2 rounded-full ${entry.color}`} style={{ width: `${entry.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {nextDelivery && (
          <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
            <div className="rounded-3xl bg-gray-900 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Next delivery</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{nextDelivery.chef}</h3>
                  <p className="text-white/70">{nextDelivery.dishes}</p>
                </div>
                <span className="rounded-2xl bg-white/10 px-4 py-1 text-sm font-semibold">ETA {nextDelivery.eta}</span>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-white/80 sm:grid-cols-3">
                <div>
                  <p className="text-white/50">Order ID</p>
                  <p className="font-semibold">{nextDelivery.id}</p>
                </div>
                <div>
                  <p className="text-white/50">Status</p>
                  <p className="font-semibold capitalize">{nextDelivery.status}</p>
                </div>
                <div>
                  <p className="text-white/50">Amount</p>
                  <p className="font-semibold text-emerald-300">${nextDelivery.amount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Favorite chefs</p>
              <div className="mt-4 space-y-3">
                {favoriteVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-3">
                    <div>
                      <p className="text-sm text-gray-500">{vendor.specialty}</p>
                      <p className="text-base font-semibold text-gray-900">{vendor.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star className="h-4 w-4 fill-orange-500" />
                      <span className="font-semibold text-gray-900">{vendor.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Live Requests</p>
                  <h2 className="text-2xl font-semibold text-gray-900">Your open bids</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  Manage
                </Button>
              </div>
              <div className="mt-6 space-y-4">
                {buyerRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    className="rounded-2xl border border-gray-200 p-4 lg:p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">{request.id}</p>
                        <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-sm text-gray-500">{request.cuisine} • {request.portionType} • {request.servings} servings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-2xl font-bold text-gray-900">${request.budget}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">{request.status.replace("_", " ")}</span>
                      <span>{request.deliveryWindow}</span>
                      <span>{request.bids} bids</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Orders</p>
                  <h2 className="text-2xl font-semibold text-gray-900">Current deliveries</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {buyerOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="rounded-2xl border border-gray-200 p-5"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{order.id}</p>
                        <h3 className="text-lg font-semibold text-gray-900">{order.chef}</h3>
                        <p className="text-sm text-gray-500">{order.dishes}</p>
                      </div>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{order.status}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>ETA: {order.eta}</span>
                      <span className="text-lg font-bold text-gray-900">${order.amount}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bid insights</h3>
                <Button variant="ghost" size="sm">
                  View Bid Room
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Filter className="h-4 w-4" /> Filter by status
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All", value: "all" },
                    { label: "Collecting bids", value: "collecting_bids" },
                    { label: "In progress", value: "in_progress" },
                    { label: "Fulfilled", value: "fulfilled" },
                  ].map((option) => {
                    const isActive = bidFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBidFilter(option.value as typeof bidFilter)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          isActive ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-6 space-y-5">
                {filteredBidRequests.slice(0, 2).map((request) => {
                  const requestBids = bidsByRequest[request.id] ?? [];
                  return (
                    <div key={request.id} className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{request.id}</p>
                          <h4 className="text-lg font-semibold text-gray-900">{request.title}</h4>
                          <p className="text-sm text-gray-500">{request.bids} bids • budget ${request.budget}</p>
                        </div>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                          {request.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        {requestBids.length === 0 && <p className="text-sm text-gray-500">No bids yet</p>}
                        {requestBids.map((bid) => (
                          <div key={bid.id} className="rounded-2xl bg-gray-50 p-3">
                            <div className="flex items-center justify-between text-sm">
                              <p className="font-semibold text-gray-900">{bid.chef}</p>
                              <span className="text-xs font-semibold text-emerald-600">{bid.confidence}% confidence</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                              <span>${bid.price}</span>
                              <span>{bid.eta}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-700">
                          Compare bids
                        </Button>
                        <Button variant="ghost" size="sm" className="text-orange-600">
                          Message chefs
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => setTimelineRequestId(request.id)}>
                          View timeline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Featured Vendors</h3>
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {featuredVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                    <div>
                      <p className="text-sm text-gray-500">{vendor.specialty}</p>
                      <h4 className="text-lg font-semibold text-gray-900">{vendor.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {vendor.distance} away
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star className="h-4 w-4 fill-orange-500" />
                      <span className="font-semibold text-gray-900">{vendor.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Need something specific?</p>
              <h3 className="mt-3 text-2xl font-semibold">Connect with a food concierge</h3>
              <p className="mt-2 text-white/80">Share portion sizes, dietary needs, and delivery logistics—we will route to verified chefs.</p>
              <div className="mt-4 flex flex-col gap-2 text-sm text-white/90">
                <p className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" /> Curated shortlist in 2 hours
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Local-only sourcing
                </p>
              </div>
              <Button variant="outline" className="mt-4 border-white text-white hover:bg-white/10">
                Talk to concierge
              </Button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Saved briefs</h3>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {savedBriefs.map((brief) => (
                  <div key={brief.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{brief.id}</p>
                        <h4 className="text-base font-semibold text-gray-900">{brief.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500">{brief.updated}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      {brief.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-gray-50 px-3 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <Button variant="outline" size="sm" className="gap-1 border-gray-200 text-gray-700">
                        <Copy className="h-3.5 w-3.5" /> Duplicate
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 border-gray-200 text-gray-700">
                        <Edit3 className="h-3.5 w-3.5" /> Edit brief
                      </Button>
                      <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => setActiveBriefId(brief.id)}>
                        View details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
        brief={activeBriefId ? savedBriefs.find((brief) => brief.id === activeBriefId) ?? null : null}
        onClose={() => setActiveBriefId(null)}
      />
    </DashboardLayout>
  );
}

interface BidTimelineModalProps {
  requestId: string | null;
  timeline?: Array<{ step: string; time: string; detail: string }>;
  bids: typeof vendorBids;
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
  brief: (typeof savedBriefs)[number] | null;
  onClose: () => void;
}

function BriefDetailModal({ brief, onClose }: BriefDetailModalProps) {
  if (!brief) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{brief.id}</p>
            <h3 className="text-2xl font-semibold text-gray-900">{brief.title}</h3>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-600">Overview</p>
        <p className="text-sm text-gray-700">{brief.overview}</p>
        <p className="mt-4 text-sm font-semibold text-gray-600">Tags</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
          {brief.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-gray-50 px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
          <Button variant="outline" size="sm" className="gap-1 border-gray-200 text-gray-700">
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" className="gap-1 border-gray-200 text-gray-700">
            <Edit3 className="h-3.5 w-3.5" /> Edit brief
          </Button>
        </div>
      </div>
    </div>
  );
}
