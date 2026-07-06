import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
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
      { label: "Command Center", to: "/dashboard/admin", icon: <Activity className="h-4 w-4" /> },
      { label: "Orders", to: "/dashboard/admin?tab=orders", icon: <Briefcase className="h-4 w-4" /> },
      { label: "Vendors", to: "/dashboard/admin?tab=vendors", icon: <Users className="h-4 w-4" /> },
      { label: "Compliance", to: "/dashboard/admin?tab=compliance", icon: <Shield className="h-4 w-4" /> },
    ],
  };

  if (isLoading) {
    return (
      <DashboardLayout sidebar={SIDEBAR} title="Marketplace Control" description="Monitor fulfillment health, vendor trust, and escalations.">
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-28 rounded-3xl bg-gray-100" />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="h-64 rounded-3xl bg-gray-100" />
            <div className="h-64 rounded-3xl bg-gray-100" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 rounded-3xl bg-gray-100" />
            <div className="h-72 rounded-3xl bg-gray-100" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebar={SIDEBAR}
      title="Marketplace Control"
      description="Monitor fulfillment health, vendor trust, and escalations."
    >
      <section className="space-y-8">

        {/* ── 1. Priority alert bar ──────────────────────────────────────── */}
        <AnimatePresence>
          {priorityAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2"
            >
              {priorityAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-center justify-between rounded-2xl px-5 py-3 ${alert.severity === "High" ? "border border-red-200 bg-red-50" : "border border-amber-200 bg-amber-50"}`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.severity === "High" ? "text-red-500" : "text-amber-500"}`} />
                    <div>
                      <p className={`text-sm font-semibold ${alert.severity === "High" ? "text-red-800" : "text-amber-800"}`}>{alert.label}</p>
                      <p className={`text-xs ${alert.severity === "High" ? "text-red-600" : "text-amber-600"}`}>{alert.detail}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${alert.severity === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2. Color-coded KPI strip ───────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total Requests", value: metrics?.totalRequests ?? "—", prefix: "", accent: "text-gray-900", bg: "bg-white" },
            { label: "Active Bids", value: metrics?.activeBids ?? "—", prefix: "", accent: "text-gray-900", bg: "bg-white" },
            { label: "Escrow Held", value: metrics ? Number(metrics.escrowHeld).toLocaleString() : "—", prefix: symbol, accent: "text-amber-600", bg: "bg-amber-50" },
            { label: "Open Disputes", value: metrics?.pendingDisputes ?? "—", prefix: "", accent: (metrics?.pendingDisputes ?? 0) > 3 ? "text-red-600" : "text-gray-900", bg: (metrics?.pendingDisputes ?? 0) > 3 ? "bg-red-50" : "bg-white" },
            { label: "Pending Vendors", value: metrics?.newVendors ?? "—", prefix: "", accent: (metrics?.newVendors ?? 0) > 0 ? "text-amber-600" : "text-gray-900", bg: (metrics?.newVendors ?? 0) > 0 ? "bg-amber-50" : "bg-white" },
          ].map((metric) => (
            <motion.div key={metric.label} className={`rounded-3xl p-6 shadow-sm ${metric.bg}`} whileHover={{ y: -3 }}>
              <p className="text-sm text-gray-500">{metric.label}</p>
              <h3 className={`mt-3 text-3xl font-semibold ${metric.accent}`}>{metric.prefix}{metric.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* ── 3. Orders table + Payout queue ────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Orders</p>
                <h2 className="text-2xl font-semibold text-gray-900">Network performance</h2>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-gray-100 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order, buyer, vendor"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Buyer</th>
                    <th className="pb-3">Item</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="text-gray-700">
                      <td className="py-3 font-semibold text-gray-900">{order.id.slice(-8).toUpperCase()}</td>
                      <td className="py-3">{order.buyer?.name ?? "—"}</td>
                      <td className="py-3">{order.request?.foodName ?? "—"}</td>
                      <td className="py-3 font-semibold">{symbol}{Number(order.totalAmount).toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === "completed" ? "bg-emerald-50 text-emerald-700" : order.status === "dispute" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => setActiveOrderId(order.id)}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-sm text-gray-500">No orders match "{orderSearch}"</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Payout queue</p>
                <h3 className="text-2xl font-semibold text-gray-900">{symbol}{payoutTotal.toLocaleString()}</h3>
                <p className="text-xs text-gray-500">{payoutQueue.length} pending · awaiting release</p>
              </div>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-4 space-y-3">
              {payoutQueue.length === 0 && (
                <p className="rounded-2xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">No pending payouts.</p>
              )}
              {payoutQueue.map((payout) => (
                <div key={payout.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{payout.vendor}</p>
                      <p className="text-xs text-gray-500">Age {payout.age}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-gray-900">{symbol}{payout.amount.toLocaleString()}</p>
                      <span className="text-xs font-semibold text-amber-600">{payout.status}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-orange-500 text-white hover:bg-orange-600"
                    disabled={approvingPayoutId === payout.id}
                    onClick={() => handleApprovePayout(payout.id)}
                  >
                    {approvingPayoutId === payout.id ? "Releasing..." : "Approve payout"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. Open disputes + Vendor KYC queue ───────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Open disputes</h3>
                <p className="text-sm text-gray-500">{openDisputes.length} requiring resolution</p>
              </div>
              <AlertTriangle className={`h-5 w-5 ${openDisputes.length > 3 ? "text-red-500" : "text-amber-500"}`} />
            </div>
            <div className="mt-4 space-y-3">
              {adminDisputes.length === 0 && <p className="text-sm text-gray-400">No disputes found.</p>}
              {adminDisputes.map((dispute) => (
                <div key={dispute.id} className={`rounded-2xl border p-4 ${dispute.status === "open" ? "border-amber-100 bg-amber-50/40" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dispute.reason}</p>
                      <p className="text-xs text-gray-500">By {dispute.openedBy?.name ?? "Unknown"} · Order {dispute.order?.id?.slice(-8).toUpperCase() ?? "—"}</p>
                      <p className="text-xs text-gray-400">{new Date(dispute.openedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${dispute.status === "open" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
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
                      <Button size="sm" variant="outline" className="border-gray-200 text-gray-700"
                        onClick={() => { const o = adminOrders.find((ord) => ord.id === dispute.order?.id); if (o) setActiveOrderId(o.id); }}>
                        View order
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vendor KYC queue</h3>
                <p className="text-sm text-gray-500">{pendingVendors.length} pending · {adminVendors.length} total</p>
              </div>
              <Shield className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-gray-100 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Search vendor or ID"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400" />
            </div>
            <div className="mt-4 space-y-3">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{vendor.name}</h4>
                      <p className="text-xs text-gray-500">{vendor.kitchenName || `${vendor.streetAddress}, ${vendor.city}` || vendor.id}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${vendor.kycStatus === "Approved" ? "bg-emerald-50 text-emerald-700" : vendor.kycStatus === "Pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                      <CheckCircle2 className="mr-1 inline h-3 w-3" />{vendor.kycStatus}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-700" onClick={() => setActiveVendorId(vendor.id)}>
                      View dossier
                    </Button>
                    <Button variant="ghost" size="sm" className="text-orange-600"
                      disabled={isSchedulingAudit === vendor.id}
                      onClick={() => handleTriggerAudit(vendor.id)}>
                      {isSchedulingAudit === vendor.id ? "Scheduling..." : recentAudits[vendor.id] ? "Audit scheduled ✓" : "Trigger audit"}
                    </Button>
                    {vendor.kycStatus !== "Approved" && (
                      <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleVerifyVendor(vendor.id)}>
                        Approve KYC
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredVendors.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No vendors match "{vendorSearch}"
                </div>
              )}
            </div>
          </div>
        </div>

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{order.id}</p>
            <h3 className="text-2xl font-semibold text-gray-900">Order detail</h3>
            <p className="text-sm text-gray-500">{symbol}{Number(order.totalAmount).toLocaleString()} · {order.status}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Buyer</p>
              <p className="mt-1 font-semibold text-gray-900">{order.buyer?.name ?? "—"}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Item</p>
              <p className="mt-1 font-semibold text-gray-900">{order.request?.foodName ?? "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Request ID</p>
              <p className="mt-1 font-semibold text-gray-900">{order.request?.id ?? "—"}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Total amount</p>
              <p className="mt-1 font-semibold text-gray-900">{symbol}{Number(order.totalAmount).toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Created</p>
            <p className="mt-1 text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{vendor.id}</p>
            <h3 className="text-2xl font-semibold text-gray-900">Vendor detail</h3>
            <p className="text-sm text-gray-500">{vendor.name} · {vendor.kitchenName}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 space-y-4 text-sm">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Contact</p>
            <p className="mt-1 font-semibold text-gray-900">{vendor.email}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Address</p>
            <p className="mt-1 text-gray-900">{vendor.streetAddress || "—"}</p>
            <p className="text-gray-500">{vendor.city}{vendor.city && vendor.state ? ", " : ""}{vendor.state}</p>
            <p className="text-gray-500">{vendor.landmark}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">KYC status</p>
              <p className={`mt-1 font-semibold ${vendor.kycStatus === "Approved" ? "text-emerald-700" : "text-amber-700"}`}>{vendor.kycStatus}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Orders</p>
              <p className="mt-1 font-semibold text-gray-900">{vendor.totalOrders}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Documents ({documents.length})</p>
            {documents.length === 0 && (
              <p className="mt-2 text-gray-500">No documents submitted.</p>
            )}
            <div className="mt-2 space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 hover:opacity-80"
                  >
                    <p className="font-semibold text-gray-900 capitalize">{doc.type.replace("_", " ")}</p>
                    <p className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </a>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${doc.status === "approved" ? "bg-emerald-50 text-emerald-600" : doc.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
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
