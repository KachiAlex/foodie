import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  DollarSign,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";
import { approvePayoutRequest, triggerVendorAudit, getPendingVendors, verifyVendor, getDashboardMetrics, getAdminOrders, getEscrowTransactions, getAdminDisputes, resolveDispute, flagVendor, approveDocument, rejectDocument } from "@/services/adminApi";
import type { DashboardMetrics, AdminOrder, EscrowTransaction, AdminDispute } from "@/services/adminApi";

export function AdminDashboard() {
  const { symbol } = useCurrency();
  const { showToast } = useToast();

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  const [approvingPayoutId, setApprovingPayoutId] = useState<string | null>(null);
  const [isSchedulingAudit, setIsSchedulingAudit] = useState<string | null>(null);
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [recentAudits, setRecentAudits] = useState<Record<string, string>>({});
  const [adminVendors, setAdminVendors] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [escrowTxns, setEscrowTxns] = useState<EscrowTransaction[]>([]);
  const [adminDisputes, setAdminDisputes] = useState<AdminDispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") ?? "overview";

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      getPendingVendors().then((vendors) =>
        setAdminVendors(vendors.map((v) => ({
          id: v.user.id,
          name: v.user.name,
          email: v.user.email,
          kycStatus: v.verified ? "Approved" : "Pending",
          kitchenName: v.kitchenName,
          streetAddress: v.streetAddress,
          city: v.city,
          state: v.state,
          landmark: v.landmark,
          rating: 0,
          totalOrders: 0,
          documents: v.documents || [],
        })))
      ),
      getDashboardMetrics().then(setMetrics),
      getAdminOrders().then(setAdminOrders),
      getEscrowTransactions().then(setEscrowTxns),
      getAdminDisputes().then(setAdminDisputes),
    ]).finally(() => setIsLoading(false));
  }, []);

  const payoutQueue = useMemo(
    () =>
      escrowTxns
        .filter((t) => t.status !== "completed")
        .map((t) => ({
          id: t.id,
          vendor: t.vendor?.name ?? "Unknown",
          amount: Number(t.amount),
          status: t.status === "pending" ? "Ready" : t.status,
          age: new Date(t.createdAt).toLocaleDateString(),
        })),
    [escrowTxns],
  );

  const payoutTotal = useMemo(() => payoutQueue.reduce((s, p) => s + p.amount, 0), [payoutQueue]);
  const openDisputes = useMemo(() => adminDisputes.filter((d) => d.status === "open"), [adminDisputes]);
  const pendingVendors = useMemo(() => adminVendors.filter((v) => v.kycStatus === "Pending"), [adminVendors]);

  const priorityAlerts = useMemo(() => {
    const alerts: { id: string; label: string; detail: string; severity: "High" | "Medium" }[] = [];
    if ((metrics?.pendingDisputes ?? 0) > 3)
      alerts.push({ id: "disputes", label: `${metrics!.pendingDisputes} open disputes`, detail: "Require admin resolution", severity: "High" });
    if ((metrics?.escrowHeld ?? 0) > 10000)
      alerts.push({ id: "escrow", label: `${symbol}${Number(metrics!.escrowHeld).toLocaleString()} in escrow backlog`, detail: "Payout approval needed", severity: "High" });
    if ((metrics?.newVendors ?? 0) > 0)
      alerts.push({ id: "kyc", label: `${metrics!.newVendors} vendors awaiting KYC`, detail: "Review and approve", severity: "Medium" });
    return alerts;
  }, [metrics, symbol]);


  const filteredVendors = useMemo(
    () =>
      adminVendors.filter((vendor) =>
        [vendor.name, vendor.id].some((value) => value.toLowerCase().includes(vendorSearch.toLowerCase())),
      ),
    [adminVendors, vendorSearch],
  );

  const filteredOrders = useMemo(
    () =>
      adminOrders.filter((order) =>
        [order.id, order.buyer?.name ?? "", order.request?.foodName ?? "", order.status]
          .map((value) => value.toLowerCase())
          .some((value) => value.includes(orderSearch.toLowerCase())),
      ),
    [adminOrders, orderSearch],
  );

  const handleApprovePayout = async (payoutId: string) => {
    if (approvingPayoutId) return;
    setApprovingPayoutId(payoutId);
    try {
      const response = await approvePayoutRequest(payoutId);
      setEscrowTxns((prev) => prev.map((t) => t.id === payoutId ? { ...t, status: "completed" } : t));
      showToast(response.message);
    } catch {
      showToast("Error approving payout");
    } finally {
      setApprovingPayoutId(null);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    if (resolvingDisputeId) return;
    setResolvingDisputeId(disputeId);
    try {
      await resolveDispute(disputeId, "Resolved by admin via dashboard");
      setAdminDisputes((prev) => prev.map((d) => d.id === disputeId ? { ...d, status: "resolved" } : d));
      showToast("Dispute resolved");
    } catch {
      showToast("Error resolving dispute — marking locally");
      setAdminDisputes((prev) => prev.map((d) => d.id === disputeId ? { ...d, status: "resolved" } : d));
    } finally {
      setResolvingDisputeId(null);
    }
  };

  const handleTriggerAudit = async (vendorId: string) => {
    if (isSchedulingAudit === vendorId) return;
    setIsSchedulingAudit(vendorId);
    try {
      const response = await triggerVendorAudit(vendorId);
      showToast(response.message);
      setRecentAudits((prev) => ({
        ...prev,
        [vendorId]: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
    } catch {
      showToast("Error scheduling audit");
    } finally {
      setIsSchedulingAudit(null);
    }
  };

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      const response = await verifyVendor(vendorId);
      showToast(`Vendor ${response.user.name} verified successfully`);
      setAdminVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, kycStatus: "Approved" } : v))
      );
    } catch {
      showToast("Error verifying vendor");
    }
  };

  const SIDEBAR = {
    title: "Admin",
    nav: [
      { label: "Overview",         to: "/dashboard/admin",                  icon: <Activity  className="h-4 w-4" /> },
      { label: "Orders & Payouts", to: "/dashboard/admin?tab=orders",       icon: <Briefcase className="h-4 w-4" /> },
      { label: "Vendors",          to: "/dashboard/admin?tab=vendors",      icon: <Users     className="h-4 w-4" /> },
      { label: "Compliance",       to: "/dashboard/admin?tab=compliance",   icon: <Shield    className="h-4 w-4" /> },
    ],
  };

  if (isLoading) {
    return (
      <DashboardLayout sidebar={SIDEBAR} title="Marketplace Control" description="Monitor fulfillment health, vendor trust, and escalations.">
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/5" />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {[1,2,3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}
          </div>
          <div className="h-64 rounded-2xl bg-white/5" />
        </div>
      </DashboardLayout>
    );
  }

  const TAB_META: Record<string, { title: string; description: string }> = {
    overview:   { title: "Marketplace Control",  description: "Monitor fulfillment health, vendor trust, and escalations." },
    orders:     { title: "Orders & Payouts",     description: "Manage all marketplace orders and release vendor payouts." },
    vendors:    { title: "Vendor Management",    description: "Approve KYC, review documents, flag or audit vendor accounts." },
    compliance: { title: "Compliance",           description: "Resolve disputes and monitor escrow backlog alerts." },
  };
  const { title: pageTitle, description: pageDesc } = TAB_META[activeTab] ?? TAB_META.overview;

  return (
    <DashboardLayout
      sidebar={SIDEBAR}
      title={pageTitle}
      description={pageDesc}
    >
      <section className="space-y-6">

        {/* ════════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* Clickable KPI cards */}
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Total Requests", value: metrics?.totalRequests ?? "—", prefix: "", bg: "bg-gradient-to-br from-orange-500 to-amber-500", to: null },
                { label: "Active Bids",    value: metrics?.activeBids    ?? "—", prefix: "", bg: "bg-gradient-to-br from-violet-600 to-purple-700", to: null },
                { label: "Escrow Held",   value: metrics ? Number(metrics.escrowHeld).toLocaleString() : "—", prefix: symbol, bg: "bg-gradient-to-br from-emerald-500 to-teal-600", to: "/dashboard/admin?tab=orders" },
                { label: "Open Disputes", value: metrics?.pendingDisputes ?? "—", prefix: "", bg: (metrics?.pendingDisputes ?? 0) > 3 ? "bg-gradient-to-br from-red-600 to-rose-700" : "bg-gradient-to-br from-blue-500 to-cyan-600", to: "/dashboard/admin?tab=compliance" },
                { label: "Pending KYC",   value: metrics?.newVendors     ?? "—", prefix: "", bg: (metrics?.newVendors ?? 0) > 0 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-slate-600 to-slate-700", to: "/dashboard/admin?tab=vendors" },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  className={`relative rounded-2xl p-5 shadow-lg ${card.bg} ${card.to ? "cursor-pointer" : ""}`}
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => card.to && navigate(card.to)}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">{card.label}</p>
                  <h3 className="mt-3 text-3xl font-extrabold text-white">{card.prefix}{card.value}</h3>
                  {card.to && <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-white/40" />}
                </motion.div>
              ))}
            </div>

            {/* Action banners — only shown when there's something to act on */}
            <AnimatePresence>
              {priorityAlerts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  {priorityAlerts.map((alert) => {
                    const dest = alert.id === "disputes" ? "/dashboard/admin?tab=compliance"
                               : alert.id === "escrow"   ? "/dashboard/admin?tab=orders"
                               : "/dashboard/admin?tab=vendors";
                    return (
                      <button
                        key={alert.id}
                        onClick={() => navigate(dest)}
                        className={`flex w-full items-center justify-between rounded-2xl px-5 py-3 text-left transition-opacity hover:opacity-90 ${alert.severity === "High" ? "border border-red-500/30 bg-red-500/10" : "border border-amber-500/30 bg-amber-500/10"}`}
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.severity === "High" ? "text-red-400" : "text-amber-400"}`} />
                          <div>
                            <p className={`text-sm font-semibold ${alert.severity === "High" ? "text-red-300" : "text-amber-300"}`}>{alert.label}</p>
                            <p className={`text-xs ${alert.severity === "High" ? "text-red-400/70" : "text-amber-400/70"}`}>{alert.detail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${alert.severity === "High" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>{alert.severity}</span>
                          <ArrowRight className="h-4 w-4 text-white/30" />
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overview summary row: recent orders + pending KYC snapshot */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              {/* Recent orders preview */}
              <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent orders</p>
                    <h2 className="text-xl font-extrabold text-white">Network activity</h2>
                  </div>
                  <button onClick={() => navigate("/dashboard/admin?tab=orders")} className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="pb-3">Order</th>
                        <th className="pb-3">Buyer</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="cursor-pointer hover:bg-white/3" onClick={() => setActiveOrderId(order.id)}>
                          <td className="py-2.5 font-semibold text-orange-400">{order.id.slice(-8).toUpperCase()}</td>
                          <td className="py-2.5 text-gray-300">{order.buyer?.name ?? "—"}</td>
                          <td className="py-2.5 font-semibold text-emerald-400">{symbol}{Number(order.totalAmount).toLocaleString()}</td>
                          <td className="py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${order.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : order.status === "dispute" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-gray-400"}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {adminOrders.length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-sm text-gray-500">No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending KYC snapshot */}
              <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending KYC</p>
                    <h3 className="text-xl font-extrabold text-white">{pendingVendors.length} awaiting review</h3>
                  </div>
                  <button onClick={() => navigate("/dashboard/admin?tab=vendors")} className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300">
                    Manage <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {pendingVendors.slice(0, 4).map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{v.name}</p>
                        <p className="text-xs text-gray-400">{v.kitchenName || v.city || "—"}</p>
                      </div>
                      <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 h-7 text-xs px-3" onClick={() => handleVerifyVendor(v.id)}>
                        Approve
                      </Button>
                    </div>
                  ))}
                  {pendingVendors.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-gray-500">No pending vendors.</p>
                  )}
                  {pendingVendors.length > 4 && (
                    <p className="text-center text-xs text-gray-500">+{pendingVendors.length - 4} more in <button onClick={() => navigate("/dashboard/admin?tab=vendors")} className="text-orange-400 underline">Vendors</button></p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            ORDERS & PAYOUTS TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total orders", value: adminOrders.length, bg: "bg-gradient-to-br from-orange-500 to-amber-500" },
                { label: "Pending payouts", value: payoutQueue.length, bg: "bg-gradient-to-br from-emerald-500 to-teal-600" },
                { label: "Escrow held", value: `${symbol}${payoutTotal.toLocaleString()}`, bg: "bg-gradient-to-br from-violet-600 to-purple-700" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-5 ${s.bg}`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">{s.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              {/* Full orders table */}
              <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">All orders</p>
                <h2 className="mt-0.5 text-2xl font-extrabold text-white">Order management</h2>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order, buyer, item, status"
                    className="w-full bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-500" />
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="pb-3">Order</th>
                        <th className="pb-3">Buyer</th>
                        <th className="pb-3">Item</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/3">
                          <td className="py-3 font-semibold text-orange-400">{order.id.slice(-8).toUpperCase()}</td>
                          <td className="py-3 text-gray-300">{order.buyer?.name ?? "—"}</td>
                          <td className="py-3 text-gray-300">{order.request?.foodName ?? "—"}</td>
                          <td className="py-3 font-semibold text-emerald-400">{symbol}{Number(order.totalAmount).toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : order.status === "dispute" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-gray-400"}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300" onClick={() => setActiveOrderId(order.id)}>
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr><td colSpan={6} className="py-6 text-center text-sm text-gray-500">No orders match &quot;{orderSearch}&quot;</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payout queue */}
              <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Payout queue</p>
                    <h3 className="text-2xl font-extrabold text-white">{symbol}{payoutTotal.toLocaleString()}</h3>
                    <p className="text-xs text-gray-400">{payoutQueue.length} pending · awaiting release</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/15 p-2.5"><DollarSign className="h-5 w-5 text-emerald-400" /></div>
                </div>
                <div className="mt-4 space-y-3">
                  {payoutQueue.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-gray-500">No pending payouts.</p>
                  )}
                  {payoutQueue.map((payout) => (
                    <div key={payout.id} className="rounded-xl border border-white/8 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{payout.vendor}</p>
                          <p className="text-xs text-gray-400">{payout.age}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-emerald-400">{symbol}{payout.amount.toLocaleString()}</p>
                          <span className="text-xs font-semibold text-amber-400">{payout.status}</span>
                        </div>
                      </div>
                      <Button size="sm" className="mt-3 w-full bg-orange-500 text-white hover:bg-orange-600"
                        disabled={approvingPayoutId === payout.id}
                        onClick={() => handleApprovePayout(payout.id)}>
                        {approvingPayoutId === payout.id ? "Releasing..." : "Approve payout"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            VENDORS TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "vendors" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total vendors",   value: adminVendors.length,   bg: "bg-gradient-to-br from-orange-500 to-amber-500" },
                { label: "Pending KYC",     value: pendingVendors.length, bg: "bg-gradient-to-br from-amber-500 to-orange-600" },
                { label: "Approved",        value: adminVendors.filter((v) => v.kycStatus === "Approved").length, bg: "bg-gradient-to-br from-emerald-500 to-teal-600" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-5 ${s.bg}`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">{s.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Vendor management</p>
                  <h2 className="text-2xl font-extrabold text-white">KYC Queue</h2>
                </div>
                <div className="rounded-xl bg-orange-500/15 p-2.5"><Shield className="h-5 w-5 text-orange-400" /></div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search vendor name or ID"
                  className="w-full bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-500" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVendors.map((vendor) => (
                  <div key={vendor.id} className="rounded-xl border border-white/8 bg-white/5 p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{vendor.name}</h4>
                        <p className="text-xs text-gray-400 truncate">{vendor.kitchenName || `${vendor.streetAddress}, ${vendor.city}` || vendor.id}</p>
                        <p className="text-xs text-gray-500">{vendor.email}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${vendor.kycStatus === "Approved" ? "bg-emerald-500/20 text-emerald-400" : vendor.kycStatus === "Pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                        {vendor.kycStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10 h-7 text-xs" onClick={() => setActiveVendorId(vendor.id)}>
                        View dossier
                      </Button>
                      <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 h-7 text-xs"
                        disabled={isSchedulingAudit === vendor.id}
                        onClick={() => handleTriggerAudit(vendor.id)}>
                        {isSchedulingAudit === vendor.id ? "Scheduling…" : recentAudits[vendor.id] ? "Audit ✓" : "Trigger audit"}
                      </Button>
                      {vendor.kycStatus !== "Approved" && (
                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 h-7 text-xs" onClick={() => handleVerifyVendor(vendor.id)}>
                          Approve KYC
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredVendors.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-500">
                    No vendors match &quot;{vendorSearch}&quot;
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            COMPLIANCE TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "compliance" && (
          <div className="space-y-4">
            {/* Compliance KPI strip */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Open disputes",  value: openDisputes.length,  bg: openDisputes.length > 3 ? "bg-gradient-to-br from-red-600 to-rose-700" : "bg-gradient-to-br from-amber-500 to-orange-600" },
                { label: "Resolved",       value: adminDisputes.filter((d) => d.status !== "open").length, bg: "bg-gradient-to-br from-emerald-500 to-teal-600" },
                { label: "Escrow backlog", value: `${symbol}${payoutTotal.toLocaleString()}`, bg: "bg-gradient-to-br from-violet-600 to-purple-700" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-5 ${s.bg}`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">{s.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Alert banners */}
            <AnimatePresence>
              {priorityAlerts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  {priorityAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center justify-between rounded-2xl px-5 py-3 ${alert.severity === "High" ? "border border-red-500/30 bg-red-500/10" : "border border-amber-500/30 bg-amber-500/10"}`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.severity === "High" ? "text-red-400" : "text-amber-400"}`} />
                        <div>
                          <p className={`text-sm font-semibold ${alert.severity === "High" ? "text-red-300" : "text-amber-300"}`}>{alert.label}</p>
                          <p className={`text-xs ${alert.severity === "High" ? "text-red-400/70" : "text-amber-400/70"}`}>{alert.detail}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${alert.severity === "High" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>{alert.severity}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full disputes list */}
            <div className="rounded-2xl bg-[#1a1d27] border border-white/8 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Disputes</p>
                  <h2 className="text-2xl font-extrabold text-white">All disputes</h2>
                  <p className="text-sm text-gray-400">{adminDisputes.length} total · {openDisputes.length} open</p>
                </div>
                <div className={`rounded-xl p-2.5 ${openDisputes.length > 3 ? "bg-red-500/15" : "bg-amber-500/15"}`}>
                  <AlertTriangle className={`h-5 w-5 ${openDisputes.length > 3 ? "text-red-400" : "text-amber-400"}`} />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {adminDisputes.length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-500">No disputes found.</p>
                )}
                {adminDisputes.map((dispute) => (
                  <div key={dispute.id} className={`rounded-xl border p-4 ${dispute.status === "open" ? "border-amber-500/30 bg-amber-500/5" : "border-white/8 bg-white/5"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{dispute.reason}</p>
                        <p className="text-xs text-gray-400">By {dispute.openedBy?.name ?? "Unknown"} · Order {dispute.order?.id?.slice(-8).toUpperCase() ?? "—"}</p>
                        <p className="text-xs text-gray-500">{new Date(dispute.openedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${dispute.status === "open" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {dispute.status}
                      </span>
                    </div>
                    {dispute.status === "open" && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700"
                          disabled={resolvingDisputeId === dispute.id}
                          onClick={() => handleResolveDispute(dispute.id)}>
                          {resolvingDisputeId === dispute.id ? "Resolving..." : "Resolve"}
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10"
                          onClick={() => { const o = adminOrders.find((ord) => ord.id === dispute.order?.id); if (o) setActiveOrderId(o.id); }}>
                          View order
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <AdminOrderDetailModal
          order={activeOrderId ? adminOrders.find((o) => o.id === activeOrderId) ?? null : null}
          onClose={() => setActiveOrderId(null)}
        />
        <VendorDossierModal
          vendor={activeVendorId ? adminVendors.find((v) => v.id === activeVendorId) ?? null : null}
          onClose={() => setActiveVendorId(null)}
        />
      </section>
    </DashboardLayout>
  );
}

interface AdminOrderDetailModalProps {
  order: import("@/services/adminApi").AdminOrder | null;
  onClose: () => void;
}

function AdminOrderDetailModal({ order, onClose }: AdminOrderDetailModalProps) {
  const { symbol } = useCurrency();
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[#1a1d27] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">{order.id}</p>
            <h3 className="text-2xl font-bold text-white">Order detail</h3>
            <p className="text-sm text-gray-400">{symbol}{Number(order.totalAmount).toLocaleString()} · {order.status}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/8 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Buyer</p>
              <p className="mt-1 font-semibold text-white">{order.buyer?.name ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/8 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Item</p>
              <p className="mt-1 font-semibold text-white">{order.request?.foodName ?? "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/8 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Request ID</p>
              <p className="mt-1 font-semibold text-orange-400">{order.request?.id ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/8 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total amount</p>
              <p className="mt-1 font-semibold text-emerald-400">{symbol}{Number(order.totalAmount).toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Created</p>
            <p className="mt-1 text-gray-300">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VendorDossierModalProps {
  vendor: { id: string; name: string; email: string; kycStatus: string; kitchenName: string; streetAddress: string; city: string; state: string; landmark: string; rating: number; totalOrders: number; documents: Array<{ id: string; type: string; url: string; status: string; uploadedAt: string }> } | null;
  onClose: () => void;
}

function VendorDossierModal({ vendor, onClose }: VendorDossierModalProps) {
  const { showToast } = useToast();
  const [flagging, setFlagging] = useState(false);
  const [documents, setDocuments] = useState(vendor?.documents ?? []);
  const [reviewingDocId, setReviewingDocId] = useState<string | null>(null);
  if (!vendor) return null;

  const handleFlag = async () => {
    if (flagging) return;
    setFlagging(true);
    try {
      await flagVendor(vendor.id, "Flagged from dossier review");
      showToast("Vendor flagged successfully.");
    } catch {
      showToast("Failed to flag vendor.");
    } finally {
      setFlagging(false);
    }
  };

  const handleApproveDoc = async (docId: string) => {
    if (reviewingDocId) return;
    setReviewingDocId(docId);
    try {
      await approveDocument(docId);
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, status: "approved" } : d));
      showToast("Document approved.");
    } catch {
      showToast("Failed to approve document.");
    } finally {
      setReviewingDocId(null);
    }
  };

  const handleRejectDoc = async (docId: string) => {
    if (reviewingDocId) return;
    setReviewingDocId(docId);
    try {
      await rejectDocument(docId, "Does not meet requirements");
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, status: "rejected" } : d));
      showToast("Document rejected.");
    } catch {
      showToast("Failed to reject document.");
    } finally {
      setReviewingDocId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-[#1a1d27] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">{vendor.id}</p>
            <h3 className="text-2xl font-bold text-white">Vendor detail</h3>
            <p className="text-sm text-gray-400">{vendor.name} · {vendor.kitchenName}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 space-y-3 text-sm">
          <div className="rounded-xl bg-white/5 border border-white/8 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</p>
            <p className="mt-1 font-semibold text-white">{vendor.email}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Address</p>
            <p className="mt-1 text-gray-200">{vendor.streetAddress || "—"}</p>
            <p className="text-gray-400">{vendor.city}{vendor.city && vendor.state ? ", " : ""}{vendor.state}</p>
            <p className="text-gray-500">{vendor.landmark}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/8 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">KYC status</p>
              <p className={`mt-1 font-bold ${vendor.kycStatus === "Approved" ? "text-emerald-400" : "text-amber-400"}`}>{vendor.kycStatus}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/8 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Orders</p>
              <p className="mt-1 font-semibold text-white">{vendor.totalOrders}</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Documents ({documents.length})</p>
            {documents.length === 0 && (
              <p className="mt-2 text-gray-500">No documents submitted.</p>
            )}
            <div className="mt-2 space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 hover:opacity-80"
                  >
                    <p className="font-semibold text-white capitalize">{doc.type.replace("_", " ")}</p>
                    <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </a>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${doc.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : doc.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {doc.status}
                    </span>
                    {doc.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-emerald-200 text-emerald-700"
                          disabled={reviewingDocId === doc.id}
                          onClick={() => handleApproveDoc(doc.id)}
                        >
                          {reviewingDocId === doc.id ? "..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-red-200 text-red-700"
                          disabled={reviewingDocId === doc.id}
                          onClick={() => handleRejectDoc(doc.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button className="bg-red-500 text-white" disabled={flagging} onClick={handleFlag}>
            {flagging ? "Flagging..." : "Flag account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
