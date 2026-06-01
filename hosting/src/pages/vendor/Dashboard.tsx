import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Inbox,
  Leaf,
  Plus,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

const statusColumns = ["New", "Cooking", "Ready", "Delivered"] as const;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const NEXT_STATUS: Partial<Record<typeof statusColumns[number], typeof statusColumns[number]>> = {
  New: "Cooking",
  Cooking: "Ready",
  Ready: "Delivered",
};

export function VendorDashboard() {
  const { vendorOpenRequests, vendorOrders, menuItems, vendorMetrics, addBid, changeVendorOrderStatus, isLoading } = useApp();
  const { user } = useAuth();
  const { symbol } = useCurrency();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const isPendingVerification = user?.verificationStatus === "pending";
  const [activeRequest, setActiveRequest] = useState<(typeof vendorOpenRequests)[number] | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidSent, setBidSent] = useState(false);
  const [promotingOrders, setPromotingOrders] = useState<Set<string>>(new Set());

  const promoteOrder = async (orderId: string, nextStatus: typeof statusColumns[number]) => {
    setPromotingOrders((prev) => new Set(prev).add(orderId));
    try {
      await changeVendorOrderStatus(orderId, nextStatus);
    } finally {
      setPromotingOrders((prev) => { const s = new Set(prev); s.delete(orderId); return s; });
    }
  };

  const bidTrend = useMemo(() => {
    const counts: Record<string, number> = {};
    DAY_LABELS.forEach((d) => { counts[d] = 0; });
    vendorOrders.forEach((order) => {
      const day = order.createdAt ? DAY_LABELS[new Date(order.createdAt).getDay()] : DAY_LABELS[new Date().getDay()];
      counts[day] = (counts[day] ?? 0) + 1;
    });
    const today = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const idx = (today - 6 + i + 7) % 7;
      const label = DAY_LABELS[idx];
      return { label, value: counts[label] ?? 0 };
    });
  }, [vendorOrders]);

  const totalBidVolume = useMemo(() => vendorOrders.length, [vendorOrders]);
  const [bidFocus, setBidFocus] = useState<{ label: string; value: number } | null>(null);
  const maxBidValue = Math.max(...bidTrend.map((day) => day.value), 1);

  const deliveredOrders = useMemo(() => vendorOrders.filter((o) => o.status === "Delivered").length, [vendorOrders]);
  const winRate = vendorOrders.length > 0 ? Math.round((deliveredOrders / vendorOrders.length) * 100) : 0;
  const totalEarned = useMemo(() => vendorMetrics.find((m) => m.label === "Total Earned")?.value ?? "0", [vendorMetrics]);

  const checklistItems = useMemo(() => [
    { label: "Menu items added", detail: `${menuItems.length} items on your menu`, complete: menuItems.length > 0 },
    { label: "Profile verified", detail: user?.verificationStatus === "verified" ? "Your account is verified" : "Pending admin review", complete: user?.verificationStatus === "verified" },
    { label: "Orders fulfilled", detail: `${deliveredOrders} orders delivered so far`, complete: deliveredOrders > 0 },
  ], [menuItems.length, user?.verificationStatus, deliveredOrders]);

  const completedChecklist = checklistItems.filter((item) => item.complete).length;
  const checklistProgress = checklistItems.length > 0 ? Math.round((completedChecklist / checklistItems.length) * 100) : 0;

  const openRequestModal = (request: (typeof vendorOpenRequests)[number]) => {
    setActiveRequest(request);
    setBidSent(false);
    setIsSubmittingBid(false);
  };

  const closeRequestModal = () => {
    setActiveRequest(null);
    setBidSent(false);
    setIsSubmittingBid(false);
  };

  const handleSubmitBid = async (values: { bidAmount: string; notes: string }) => {
    if (!activeRequest || isSubmittingBid || bidSent) return;
    setIsSubmittingBid(true);
    try {
      const price = parseInt(values.bidAmount.replace(/[^0-9]/g, ""), 10) || 0;
      const eta = values.notes.trim() || "Ready in 2 hours";
      await addBid({
        requestId: activeRequest.id,
        chef: user?.name ?? "Chef",
        price,
        eta,
        confidence: 90,
      });
      setBidSent(true);
    } catch {
      // error handled by context
    } finally {
      setIsSubmittingBid(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        sidebar={{
          title: "Vendor",
          nav: [
            { label: "Overview", to: "/dashboard/vendor", icon: <Sparkles className="h-4 w-4" /> },
            { label: "Requests", to: "/dashboard/vendor?tab=requests", icon: <ClipboardList className="h-4 w-4" /> },
            { label: "Menu", to: "/dashboard/vendor?tab=menu", icon: <Leaf className="h-4 w-4" /> },
            { label: "Settings", to: "/dashboard/vendor?tab=settings", icon: <Settings className="h-4 w-4" /> },
          ],
        }}
        title="Chef Command Hub"
        description="Bid on custom requests, manage orders, and showcase your menu."
      >
        <section className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-3xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Skeleton className="h-72 w-full rounded-3xl" />
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-56 w-full rounded-3xl" />
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebar={{
        title: "Vendor",
        nav: [
          { label: "Overview", to: "/dashboard/vendor", icon: <Sparkles className="h-4 w-4" /> },
          { label: "Requests", to: "/dashboard/vendor?tab=requests", icon: <ClipboardList className="h-4 w-4" /> },
          { label: "Menu", to: "/dashboard/vendor?tab=menu", icon: <Leaf className="h-4 w-4" /> },
          { label: "Settings", to: "/dashboard/vendor?tab=settings", icon: <Settings className="h-4 w-4" /> },
        ],
      }}
      title="Chef Command Hub"
      description="Bid on custom requests, manage orders, and showcase your menu."
      actions={
        <div className="flex gap-2">
          <Button variant="outline">Pause Orders</Button>
          <Button className="bg-orange-500 text-white">Add Menu Item</Button>
        </div>
      }
    >
      <section className="space-y-8">
        {isPendingVerification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Your account is pending verification</p>
              <p className="mt-0.5 text-sm text-amber-700">
                An admin is reviewing your kitchen documents. You can browse open requests but cannot place bids or add menu items until verified.
              </p>
            </div>
            <Link
              to="/dashboard/vendor?tab=settings"
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Learn more
            </Link>
          </motion.div>
        )}
        {activeTab === "requests" && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Open Requests</p>
                <h2 className="text-2xl font-semibold text-gray-900">Bid marketplace</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">View filters</Button>
            </div>
            <div className="mt-6 space-y-4">
              {vendorOpenRequests.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-12 text-center">
                  <Inbox className="h-8 w-8 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">No open requests right now</p>
                  <p className="text-xs text-gray-400">New buyer briefs will appear here as soon as they're posted.</p>
                </div>
              )}
              {vendorOpenRequests.map((request) => (
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
                      <Button variant="outline" size="sm" className="border-gray-200 text-gray-700" onClick={() => openRequestModal(request)}>View brief</Button>
                      <Button size="sm" className="bg-orange-500 text-white" onClick={() => openRequestModal(request)}>Submit bid</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
              <Button size="sm" className="bg-orange-500 text-white">Add menu item</Button>
            </div>
            <div className="mt-4 space-y-4">
              {menuItems.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                  <Plus className="h-7 w-7 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">Your menu is empty</p>
                  <p className="text-xs text-gray-400">Add your first dish to start receiving bids.</p>
                  <Button size="sm" className="mt-1 bg-orange-500 text-white">Add menu item</Button>
                </div>
              )}
              {menuItems.map((item) => (
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
        )}

        {activeTab === "settings" && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Settings</p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Account & Kitchen</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-700">Display name</p>
                <p className="mt-1 text-base text-gray-900">{user?.name ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-700">Email</p>
                <p className="mt-1 text-base text-gray-900">{user?.email ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-700">Verification status</p>
                <p className={`mt-1 text-sm font-semibold ${
                  user?.verificationStatus === "verified" ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {user?.verificationStatus === "verified" ? "Verified" : "Pending review"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "overview" && <>
        <div className="grid gap-4 sm:grid-cols-3">
          {vendorMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              className="rounded-3xl bg-white p-5 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-gray-500">{metric.label}</p>
              <h3 className="text-3xl font-semibold text-gray-900">{symbol}{metric.value}</h3>
              <p className={`text-sm font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-500"}`}>{metric.change}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Bid health</p>
                <h3 className="text-2xl font-semibold text-gray-900">{totalBidVolume} bids this week</h3>
                <p className="text-xs text-gray-500">Average response time 14m</p>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View playbook
              </Button>
            </div>
            <div className="mt-6 flex gap-2">
              {bidTrend.map((day) => (
                <button
                  key={day.label}
                  type="button"
                  onMouseEnter={() => setBidFocus(day)}
                  onMouseLeave={() => setBidFocus(null)}
                  onFocus={() => setBidFocus(day)}
                  onBlur={() => setBidFocus(null)}
                  className="flex-1"
                  aria-label={`${day.label} has ${day.value} bids`}
                >
                  <div className="relative h-28 rounded-2xl bg-gray-50">
                    <div
                      className={`absolute bottom-2 left-2 right-2 rounded-2xl bg-gradient-to-t from-orange-500 to-amber-400 ${
                        bidFocus?.label === day.label ? "shadow-lg" : ""
                      }`}
                      style={{ height: `${(day.value / maxBidValue) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-gray-500">{day.label}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
              {bidFocus ? (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{bidFocus.label} focus</span>
                  <span className="text-lg font-semibold text-gray-900">{bidFocus.value} bids</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>Hover bars to see demand pockets</span>
                  <span className="text-xs font-semibold text-emerald-600">+3 active briefs</span>
                </div>
              )}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Win rate", value: `${winRate}%`, icon: Activity },
                { label: "Total earned", value: `${symbol}${totalEarned}`, icon: CheckCircle2 },
                { label: "Orders done", value: `${deliveredOrders}`, icon: Clock3 },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-gray-50 p-4">
                  <stat.icon className="h-4 w-4 text-orange-500" />
                  <p className="mt-2 text-xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Kitchen readiness</p>
                <h3 className="text-2xl font-semibold text-gray-900">Keep trust signals fresh</h3>
                <p className="text-xs text-gray-500">Compliance score 92%</p>
              </div>
              <div className="text-right">
                <ShieldCheck className="ml-auto h-6 w-6 text-emerald-500" />
                <p className="mt-1 text-xs font-semibold text-emerald-600">{checklistProgress}% complete</p>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${checklistProgress}%` }} />
            </div>
            <div className="mt-6 space-y-4">
              {checklistItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${item.complete ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button className="flex-1 bg-orange-500 text-white">Update compliance kit</Button>
              <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-gray-700">
                <RefreshCcw className="h-3.5 w-3.5" /> Sync audits
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Open Requests</p>
                <h2 className="text-2xl font-semibold text-gray-900">Bid marketplace</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View filters
              </Button>
            </div>
            <div className="mt-6 space-y-4">
              {vendorOpenRequests.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-12 text-center">
                  <Inbox className="h-8 w-8 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">No open requests right now</p>
                  <p className="text-xs text-gray-400">New buyer briefs will appear here as soon as they're posted.</p>
                </div>
              )}
              {vendorOpenRequests.map((request) => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-700"
                        onClick={() => openRequestModal(request)}
                      >
                        View brief
                      </Button>
                      <Button size="sm" className="bg-orange-500 text-white" onClick={() => openRequestModal(request)}>
                        Submit bid
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Menu Highlights</h3>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
            <div className="mt-4 space-y-4">
              {menuItems.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                  <Plus className="h-7 w-7 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">Your menu is empty</p>
                  <p className="text-xs text-gray-400">Add your first dish to start receiving bids.</p>
                  <Button size="sm" className="mt-1 bg-orange-500 text-white">Add menu item</Button>
                </div>
              )}
              {menuItems.map((item) => (
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
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Orders pipeline</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Sync courier</Button>
              <Button size="sm" className="bg-orange-500 text-white">Print prep list</Button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 overflow-x-auto text-sm md:grid-cols-4">
            {statusColumns.map((status) => (
              <div key={status} className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-semibold">{status}</span>
                  <span className="text-xs">{
                    vendorOrders.filter((order) => order.status === status).length
                  } orders</span>
                </div>
                <div className="mt-4 space-y-3">
                  {vendorOrders.filter((order) => order.status === status).length === 0 && (
                    <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
                      No orders
                    </p>
                  )}
                  {vendorOrders
                    .filter((order) => order.status === status)
                    .map((order) => {
                      const nextStatus = NEXT_STATUS[status];
                      const isPromoting = promotingOrders.has(order.id);
                      return (
                        <div key={order.id} className="rounded-xl bg-white p-3 shadow-sm">
                          <p className="text-xs text-gray-400">{order.id}</p>
                          <h4 className="text-sm font-semibold text-gray-900">{order.customer}</h4>
                          <p className="text-xs text-gray-500">{order.items}</p>
                          {nextStatus && (
                            <button
                              type="button"
                              disabled={isPromoting}
                              onClick={() => promoteOrder(order.id, nextStatus)}
                              className="mt-2 w-full rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                            >
                              {isPromoting ? "Moving…" : `→ ${nextStatus}`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>}
      </section>
      {activeRequest && (
        <BidRequestModal
          request={activeRequest}
          onClose={closeRequestModal}
          isSubmitting={isSubmittingBid}
          onSubmit={handleSubmitBid}
          bidSent={bidSent}
        />
      )}
    </DashboardLayout>
  );
}

interface BidRequestModalProps {
  request: { id: string; title: string; location: string; servings: string; budget: string; deadline: string; tags: string[] };
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (values: { bidAmount: string; notes: string }) => void;
  bidSent: boolean;
}

function BidRequestModal({ request, onClose, isSubmitting, onSubmit, bidSent }: BidRequestModalProps) {
  const wizardSteps = ["Proposal", "Attachments", "Review"] as const;
  const [activeStep, setActiveStep] = useState(0);
  const [bidAmount, setBidAmount] = useState(() => request.budget.replace(/[^0-9]/g, "") ?? "");
  const [notes, setNotes] = useState("Ready to personalize spice & plating per guest.");
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["Signature menu.pdf"]);
  const attachmentLibrary = [
    "Signature menu.pdf",
    "Kitchen hygiene log.png",
    "Seasonal specials.docx",
    "Chef intro reel.mp4",
  ];

  const toggleAsset = (asset: string) => {
    setSelectedAssets((current) =>
      current.includes(asset) ? current.filter((item) => item !== asset) : [...current, asset],
    );
  };

  const handlePrimaryAction = () => {
    if (activeStep < wizardSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }
    onSubmit({ bidAmount, notes });
  };

  const handleBack = () => {
    if (activeStep === 0) return;
    setActiveStep((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{request.id}</p>
            <h3 className="text-2xl font-semibold text-gray-900">{request.title}</h3>
            <p className="text-sm text-gray-500">{request.location} • {request.servings}</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full bg-gray-100 p-1 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
          {wizardSteps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                index === activeStep ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              <span className="text-[10px]">{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
          <p>Deadline: <span className="font-semibold text-gray-900">{request.deadline}</span></p>
          <p className="mt-2">Tags: {request.tags.join(", ")}</p>
        </div>

        {activeStep === 0 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Bid amount
              <input
                type="text"
                value={bidAmount}
                onChange={(event) => setBidAmount(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-base text-gray-900"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Kitchen notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-base text-gray-900"
              />
            </label>
            <p className="text-xs text-gray-500">Tip: mention prep timeline + plating style to win trust.</p>
          </div>
        )}

        {activeStep === 1 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Attach proof of work (optional)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {attachmentLibrary.map((asset) => {
                const isSelected = selectedAssets.includes(asset);
                return (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => toggleAsset(asset)}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm ${
                      isSelected ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    {asset}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">These files help buyers pick you faster. Drop at least one hygiene proof.</p>
          </div>
        )}

        {activeStep === 2 && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Summary</h4>
              <p className="mt-2 text-sm text-gray-600">Bid: <span className="font-semibold text-gray-900">{bidAmount || "—"}</span></p>
              <p className="text-sm text-gray-600">Notes: <span className="font-semibold text-gray-900">{notes || "None"}</span></p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Attachments ({selectedAssets.length})</h4>
              {selectedAssets.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No files attached.</p>
              ) : (
                <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                  {selectedAssets.map((asset) => (
                    <li key={asset}>{asset}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">Escrow release 24h</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">Buyer rating 4.8/5</span>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1 border-gray-200 text-gray-700" onClick={activeStep === 0 ? onClose : handleBack} disabled={isSubmitting}>
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            className="flex-1 bg-orange-500 text-white"
            onClick={handlePrimaryAction}
            disabled={(activeStep === wizardSteps.length - 1 && (isSubmitting || bidSent)) || (activeStep === 0 && !bidAmount)}
          >
            {activeStep === wizardSteps.length - 1 ? (bidSent ? "Bid sent" : isSubmitting ? "Submitting…" : "Send bid") : "Next"}
          </Button>
        </div>
        {bidSent && (
          <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">
            Bid delivered to buyer inbox. We’ll ping you when they respond.
          </p>
        )}
      </div>
    </div>
  );
}
