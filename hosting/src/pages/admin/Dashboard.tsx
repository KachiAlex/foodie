import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Gavel,
  Inbox,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";
import { approvePayoutRequest, createOrderEscalation, triggerVendorAudit, getPendingVendors, verifyVendor, getDashboardMetrics, getAdminOrders, getEscrowTransactions, getAdminDisputes } from "@/services/adminApi";
import type { DashboardMetrics, AdminOrder, EscrowTransaction, AdminDispute } from "@/services/adminApi";

export function AdminDashboard() {
  const { symbol } = useCurrency();
  const ESCALATION_CAP = 5;
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  const [isApprovingPayout, setIsApprovingPayout] = useState(false);
  const [isEscalatingOrder, setIsEscalatingOrder] = useState(false);
  const [isSchedulingAudit, setIsSchedulingAudit] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [recentAudits, setRecentAudits] = useState<Record<string, string>>({});
  const [adminVendors, setAdminVendors] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [escrowTxns, setEscrowTxns] = useState<EscrowTransaction[]>([]);
  const [adminDisputes, setAdminDisputes] = useState<AdminDispute[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    getPendingVendors()
      .then((vendors) => {
        setAdminVendors(
          vendors.map((v) => ({
            id: v.user.id,
            name: v.user.name,
            email: v.user.email,
            kycStatus: v.verified ? "Approved" : "Pending",
            kitchenName: v.kitchenName,
            address: v.address,
            landmark: v.landmark,
            rating: 0,
            totalOrders: 0,
          }))
        );
      })
      .catch((err) => console.error("Failed to load pending vendors", err));

    getDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.error("Failed to load metrics", err));

    getAdminOrders()
      .then(setAdminOrders)
      .catch((err) => console.error("Failed to load admin orders", err));

    getEscrowTransactions()
      .then(setEscrowTxns)
      .catch((err) => console.error("Failed to load escrow transactions", err));

    getAdminDisputes()
      .then(setAdminDisputes)
      .catch((err) => console.error("Failed to load disputes", err));
  }, []);

  const [escalationQueue, setEscalationQueue] = useState([
    { id: "ESC-491", title: "Buyer flagged late delivery", owner: "Joy", severity: "High", eta: "Respond in 30m" },
    { id: "ESC-523", title: "Vendor disputes refund", owner: "Kachi", severity: "Medium", eta: "Due in 1h" },
    { id: "ESC-537", title: "Chef onboarding docs missing", owner: "Amaka", severity: "Low", eta: "Due tomorrow" },
  ]);

  const moderationQueue = [
    { id: "MOD-204", flag: "Menu photo quality", vendor: "Lagos Test Kitchen", status: "Needs review" },
    { id: "MOD-205", flag: "Pricing mismatch", vendor: "Chef Mimi", status: "Resolved" },
    { id: "MOD-206", flag: "Hygiene certificate expiring", vendor: "Chef Zubair", status: "Pending" },
  ];

  const opsAlerts = [
    { label: "SLA risk", value: "3 routes", detail: "+1 vs avg", severity: "High" },
    { label: "Disputes awaiting vendor", value: "4 cases", detail: "avg age 42m", severity: "Medium" },
    { label: "Payout backlog", value: `${symbol}18k`, detail: "2 vendors flagged", severity: "High" },
  ];

  const payoutQueue = useMemo(
    () =>
      escrowTxns
        .filter((t) => t.status !== "completed")
        .map((t) => ({
          id: t.id,
          vendor: t.vendor?.name ?? "Unknown",
          amount: `${symbol}${Number(t.amount).toLocaleString()}`,
          status: t.status === "pending" ? "Ready" : t.status,
          age: new Date(t.createdAt).toLocaleDateString(),
        })),
    [escrowTxns, symbol]
  );

  const trustTasks = [
    { id: "TS-11", title: "Re-review flagged media", owner: "Ada", due: "Today", status: "In progress" },
    { id: "TS-09", title: "Confirm bank change", owner: "Tobi", due: "2h", status: "Waiting" },
    { id: "TS-06", title: "Schedule kitchen audit", owner: "Joy", due: "Tomorrow", status: "Backlog" },
  ];

  const orderProfiles = useMemo(
    () =>
      adminOrders.reduce<Record<string, { buyer: string; vendor: string; contact: string; timeline: Array<{ step: string; time: string }> }>>(
        (acc, order) => {
          acc[order.id] = {
            buyer: order.buyer?.name ?? "Unknown",
            vendor: order.request?.foodName ?? "Unknown",
            contact: "ops@foodiemarket.com",
            timeline: [
              { step: "Order submitted", time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
              { step: "Vendor accepted", time: "—" },
              { step: "Kitchen prep", time: "—" },
              { step: order.status, time: "Now" },
            ],
          };
          return acc;
        },
        {},
      ),
    [adminOrders],
  );

  const vendorProfiles = useMemo(
    () =>
      adminVendors.reduce<Record<string, { documents: Array<{ type: string; status: string }>; notes: string }>>((acc, vendor) => {
        acc[vendor.id] = {
          documents: [
            { type: "ID Verification", status: vendor.kycStatus === "Approved" ? "Verified" : "Pending" },
            { type: "Kitchen inspection", status: vendor.kycStatus === "Flagged" ? "Action required" : "Valid" },
            { type: "Bank account", status: "Synced" },
          ],
          notes: "Last audit 2 weeks ago. Maintain photo freshness for listings.",
        };
        return acc;
      }, {}),
    [],
  );

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

  const payoutTotal = useMemo(
    () =>
      payoutQueue.reduce<number>((sum, item) => sum + Number(String(item.amount).replace(/[^0-9.]/g, "")), 0),
    [payoutQueue],
  );

  const handleApproveNextPayout = async () => {
    if (isApprovingPayout || payoutQueue.length === 0) return;
    setIsApprovingPayout(true);
    try {
      const firstId = payoutQueue[0].id;
      const response = await approvePayoutRequest(firstId);
      setEscrowTxns((prev) => prev.map((t) => t.id === firstId ? { ...t, status: "completed" } : t));
      showToast(response.message);
    } catch {
      showToast("Error approving payout");
    } finally {
      setIsApprovingPayout(false);
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

  const handleCreateEscalation = async (orderId: string) => {
    if (isEscalatingOrder) return;
    setIsEscalatingOrder(true);
    try {
      const response = await createOrderEscalation(orderId);
      setEscalationQueue((prev) => [
        {
          id: `ESC-${Date.now().toString().slice(-4)}`,
          title: response.message,
          owner: "Ops bot",
          severity: "Medium",
          eta: "Review ASAP",
        },
        ...prev,
      ].slice(0, ESCALATION_CAP));
      showToast(response.message);
    } catch {
      showToast("Error creating escalation");
    } finally {
      setIsEscalatingOrder(false);
    }
  };

  const handleResolveEscalation = (ticketId: string) => {
    setEscalationQueue((prev) => prev.filter((ticket) => ticket.id !== ticketId));
    showToast(`Escalation ${ticketId} resolved`);
  };

  const handleSnoozeEscalation = (ticketId: string) => {
    setEscalationQueue((prev) => {
      const target = prev.find((ticket) => ticket.id === ticketId);
      if (!target) return prev;
      const updated = prev.filter((ticket) => ticket.id !== ticketId);
      return [...updated, { ...target, eta: "Snoozed +1h" }];
    });
    showToast(`Escalation ${ticketId} snoozed`);
  };

  return (
    <DashboardLayout
      sidebar={{
        title: "Admin",
        nav: [
          { label: "Command Center", to: "/dashboard/admin", icon: <Activity className="h-4 w-4" /> },
          { label: "Orders", to: "/dashboard/admin?tab=orders", icon: <Briefcase className="h-4 w-4" /> },
          { label: "Vendors", to: "/dashboard/admin?tab=vendors", icon: <Users className="h-4 w-4" /> },
          { label: "Compliance", to: "/dashboard/admin?tab=compliance", icon: <Shield className="h-4 w-4" /> },
        ],
      }}
      title="Marketplace Control"
      description="Monitor fulfillment health, vendor trust, and escalations."
      actions={
        <div className="flex gap-2">
          <Button variant="outline">Download report</Button>
          <Button className="bg-orange-500 text-white">Trigger alert</Button>
        </div>
      }
    >
      <section className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total Requests", value: metrics?.totalRequests ?? "—", prefix: "" },
            { label: "Active Bids", value: metrics?.activeBids ?? "—", prefix: "" },
            { label: "Escrow Held", value: metrics ? Number(metrics.escrowHeld).toLocaleString() : "—", prefix: symbol },
            { label: "Open Disputes", value: metrics?.pendingDisputes ?? "—", prefix: "" },
            { label: "Pending Vendors", value: metrics?.newVendors ?? "—", prefix: "" },
          ].map((metric) => (
            <motion.div
              key={metric.label}
              className="rounded-3xl bg-white p-6 shadow-sm"
              whileHover={{ y: -4 }}
            >
              <p className="text-sm text-gray-500">{metric.label}</p>
              <div className="mt-3">
                <h3 className="text-3xl font-semibold text-gray-900">{metric.prefix}{metric.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Ops signals</p>
                <h3 className="text-2xl font-semibold text-gray-900">Control tower</h3>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {opsAlerts.map((alert) => (
                <div key={alert.label} className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{alert.label}</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">{alert.value}</p>
                  <p className="text-xs text-gray-500">{alert.detail}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${
                      alert.severity === "High"
                        ? "bg-red-50 text-red-600"
                        : alert.severity === "Medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Payout queue</p>
                <h3 className="text-2xl font-semibold text-gray-900">{symbol}{payoutTotal.toLocaleString()}</h3>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </div>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-4 space-y-3">
              {payoutQueue.map((payout) => (
                <div key={payout.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{payout.id}</p>
                      <p className="text-sm font-semibold text-gray-900">{payout.vendor}</p>
                      <p className="text-xs text-gray-500">Age {payout.age}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{payout.amount}</p>
                      <span className="text-xs font-semibold text-amber-600">{payout.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="mt-4 w-full bg-orange-500 text-white"
              onClick={handleApproveNextPayout}
              disabled={isApprovingPayout || payoutQueue.length === 0}
            >
              {isApprovingPayout ? "Releasing payout..." : "Approve next payout"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Orders</p>
                <h2 className="text-2xl font-semibold text-gray-900">Network performance</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View all
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-gray-100 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
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
                    <th className="pb-3">Vendor</th>
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
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
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
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                        No orders match “{orderSearch}”. Try another buyer, vendor, or status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Vendor compliance</h3>
              <Button variant="ghost" size="sm">See queue</Button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-gray-100 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={vendorSearch}
                onChange={(event) => setVendorSearch(event.target.value)}
                placeholder="Search vendor or ID"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="mt-4 space-y-4">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{vendor.id}</p>
                      <h4 className="text-lg font-semibold text-gray-900">{vendor.name}</h4>
                      <p className="text-sm text-gray-500">{vendor.totalOrders} lifetime orders</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          vendor.kycStatus === "Approved"
                            ? "bg-green-50 text-green-600"
                            : vendor.kycStatus === "Pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> {vendor.kycStatus}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-gray-900">⭐ {vendor.rating}</p>
                      {recentAudits[vendor.id] && (
                        <p className="text-xs text-emerald-600">Audit scheduled {recentAudits[vendor.id]}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-700" onClick={() => setActiveVendorId(vendor.id)}>
                      View dossier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-600"
                      onClick={() => handleTriggerAudit(vendor.id)}
                      disabled={isSchedulingAudit === vendor.id}
                    >
                      {isSchedulingAudit === vendor.id ? "Scheduling..." : recentAudits[vendor.id] ? "Audit scheduled" : "Trigger audit"}
                    </Button>
                    {vendor.kycStatus !== "Approved" && (
                      <Button size="sm" className="bg-green-600 text-white" onClick={() => handleVerifyVendor(vendor.id)}>
                        Approve KYC
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredVendors.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No vendors match “{vendorSearch}”. Double-check the ID or adjust your filters.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Audit log</h3>
              <Button variant="ghost" size="sm">Export</Button>
            </div>
            <div className="mt-4 space-y-4">
              {adminDisputes.length === 0 && (
                <p className="text-sm text-gray-400">No disputes found.</p>
              )}
              {adminDisputes.map((dispute) => (
                <div key={dispute.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{dispute.openedBy?.name ?? "Unknown"}</p>
                    <p className="text-sm text-gray-500">{dispute.reason}</p>
                    <p className="text-xs text-gray-400">Order: {dispute.order?.id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-semibold ${dispute.status === "open" ? "text-amber-600" : "text-green-600"}`}>
                    {dispute.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Escalation queue</h3>
              <Inbox className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-4 space-y-4">
              {escalationQueue.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <p className="uppercase tracking-[0.3em]">{ticket.id}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                        ticket.severity === "High"
                          ? "bg-red-50 text-red-600"
                          : ticket.severity === "Medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {ticket.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{ticket.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Owner: {ticket.owner}</span>
                    <span>{ticket.eta}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-700" onClick={() => handleResolveEscalation(ticket.id)}>
                      Resolve
                    </Button>
                    <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => handleSnoozeEscalation(ticket.id)}>
                      Snooze 1h
                    </Button>
                  </div>
                </div>
              ))}
              {escalationQueue.length === 0 && (
                <p className="rounded-2xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                  All clear. No open escalations right now.
                </p>
              )}
            </div>
            <Button variant="outline" className="mt-4 w-full border-gray-200">Assign next</Button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Moderation actions</h3>
              <Gavel className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-4 space-y-4">
              {moderationQueue.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{item.id}</p>
                      <p className="text-sm font-semibold text-gray-900">{item.flag}</p>
                      <p className="text-xs text-gray-500">{item.vendor}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.status === "Needs review"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full bg-orange-500 text-white">Open moderation room</Button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Trust tasks</h3>
              <ClipboardCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-4 space-y-4">
              {trustTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{task.id}</p>
                      <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">Owner {task.owner} • Due {task.due}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full border-gray-200">Dispatch to on-call</Button>
          </div>
        </div>
        <AdminOrderDetailModal
          order={activeOrderId ? adminOrders.find((order) => order.id === activeOrderId) ?? null : null}
          profile={activeOrderId ? orderProfiles[activeOrderId] ?? null : null}
          isEscalating={isEscalatingOrder}
          onCreateEscalation={handleCreateEscalation}
          onClose={() => setActiveOrderId(null)}
        />
        <VendorDossierModal
          vendor={activeVendorId ? adminVendors.find((vendor) => vendor.id === activeVendorId) ?? null : null}
          dossier={activeVendorId ? vendorProfiles[activeVendorId] ?? null : null}
          onClose={() => setActiveVendorId(null)}
        />
      </section>
    </DashboardLayout>
  );
}

interface AdminOrderDetailModalProps {
  order: import("@/services/adminApi").AdminOrder | null;
  profile: { buyer: string; vendor: string; contact: string; timeline: Array<{ step: string; time: string }> } | null;
  isEscalating: boolean;
  onCreateEscalation: (orderId: string) => void;
  onClose: () => void;
}

function AdminOrderDetailModal({ order, profile, isEscalating, onCreateEscalation, onClose }: AdminOrderDetailModalProps) {
  const { symbol } = useCurrency();
  if (!order || !profile) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{order.id}</p>
            <h3 className="text-2xl font-semibold text-gray-900">Order dossier</h3>
            <p className="text-sm text-gray-500">{symbol}{Number(order.totalAmount).toLocaleString()} · {order.status}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Parties</p>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Buyer</p>
                <p className="font-semibold text-gray-900">{profile.buyer}</p>
              </div>
              <div>
                <p className="text-gray-500">Vendor</p>
                <p className="font-semibold text-gray-900">{profile.vendor}</p>
              </div>
              <div>
                <p className="text-gray-500">Ops contact</p>
                <p className="font-semibold text-gray-900">{profile.contact}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Timeline</p>
            <div className="mt-3 space-y-3 text-sm">
              {profile.timeline.map((event) => (
                <div key={event.step} className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{event.step}</p>
                  <span className="text-gray-500">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-gray-100 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Actions</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="outline" className="border-gray-200 text-gray-700">
              Pause payouts
            </Button>
            <Button variant="outline" className="border-gray-200 text-gray-700">
              Message buyer
            </Button>
            <Button
              className="bg-orange-500 text-white"
              disabled={isEscalating}
              onClick={() => onCreateEscalation(order.id)}
            >
              {isEscalating ? "Creating..." : "Create escalation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VendorDossierModalProps {
  vendor: { id: string; name: string; email: string; kycStatus: string; kitchenName: string; address: string; landmark: string; rating: number; totalOrders: number } | null;
  dossier: { documents: Array<{ type: string; status: string }>; notes: string } | null;
  onClose: () => void;
}

function VendorDossierModal({ vendor, dossier, onClose }: VendorDossierModalProps) {
  if (!vendor || !dossier) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{vendor.id}</p>
            <h3 className="text-2xl font-semibold text-gray-900">Vendor dossier</h3>
            <p className="text-sm text-gray-500">{vendor.name} • {vendor.totalOrders} orders</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Documents</p>
          <div className="mt-3 space-y-3 text-sm">
            {dossier.documents.map((doc) => (
              <div key={doc.type} className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{doc.type}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">{doc.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Notes</p>
          <p className="mt-2 text-gray-700">{dossier.notes}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" className="border-gray-200 text-gray-700">
            Request kitchen visit
          </Button>
          <Button variant="outline" className="border-gray-200 text-gray-700">
            Message vendor
          </Button>
          <Button className="bg-red-500 text-white">Flag account</Button>
        </div>
      </div>
    </div>
  );
}
