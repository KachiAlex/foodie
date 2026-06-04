import { motion } from "framer-motion";
import { AlertTriangle, ClipboardList, Leaf, Settings, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { toggleVendorOnline } from "@/services/vendorApi";
import { VendorMetricsGrid } from "./components/VendorMetricsGrid";
import { BidHealthChart } from "./components/BidHealthChart";
import { KitchenReadinessCard } from "./components/KitchenReadinessCard";
import { BidMarketplace } from "./components/BidMarketplace";
import { MenuHighlights } from "./components/MenuHighlights";
import { OrdersPipeline } from "./components/OrdersPipeline";
import { BidRequestModal } from "./components/BidRequestModal";
import { AddMenuItemModal } from "./components/AddMenuItemModal";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type StatusColumn = "New" | "Cooking" | "Ready" | "Delivered";

const SIDEBAR = {
  title: "Vendor",
  nav: [
    { label: "Overview", to: "/dashboard/vendor", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Requests", to: "/dashboard/vendor?tab=requests", icon: <ClipboardList className="h-4 w-4" /> },
    { label: "Menu", to: "/dashboard/vendor?tab=menu", icon: <Leaf className="h-4 w-4" /> },
    { label: "Settings", to: "/dashboard/vendor?tab=settings", icon: <Settings className="h-4 w-4" /> },
  ],
};

export function VendorDashboard() {
  const { vendorOpenRequests, vendorOrders, menuItems, vendorMetrics, addBid, changeVendorOrderStatus, addMenuItem, isLoading } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const isPendingVerification = user?.verificationStatus === "pending";
  const [activeRequest, setActiveRequest] = useState<(typeof vendorOpenRequests)[number] | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidSent, setBidSent] = useState(false);
  const [promotingOrders, setPromotingOrders] = useState<Set<string>>(new Set());
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [togglingPause, setTogglingPause] = useState(false);

  const promoteOrder = async (orderId: string, nextStatus: StatusColumn) => {
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

  const handleTogglePause = async () => {
    if (togglingPause) return;
    setTogglingPause(true);
    try {
      const newState = await toggleVendorOnline();
      setIsPaused(!newState);
      showToast(newState ? "Kitchen is now online — accepting orders." : "Kitchen paused — you won't receive new orders.");
    } catch {
      showToast("Failed to toggle kitchen status");
    } finally {
      setTogglingPause(false);
    }
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
      <DashboardLayout sidebar={SIDEBAR} title="Chef Command Hub" description="Bid on custom requests, manage orders, and showcase your menu.">
        <section className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)}
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
      sidebar={SIDEBAR}
      title="Chef Command Hub"
      description="Bid on custom requests, manage orders, and showcase your menu."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTogglePause} disabled={togglingPause}>
            {isPaused ? "Resume Orders" : "Pause Orders"}
          </Button>
          <Button className="bg-orange-500 text-white" onClick={() => setShowMenuModal(true)}>
            Add Menu Item
          </Button>
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
          <BidMarketplace requests={vendorOpenRequests} onOpenRequest={openRequestModal} />
        )}

        {activeTab === "menu" && (
          <MenuHighlights items={menuItems} />
        )}

        {activeTab === "settings" && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Settings</p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Account &amp; Kitchen</h2>
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
                <p className={`mt-1 text-sm font-semibold ${user?.verificationStatus === "verified" ? "text-emerald-600" : "text-amber-600"}`}>
                  {user?.verificationStatus === "verified" ? "Verified" : "Pending review"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "overview" && <>
          <VendorMetricsGrid metrics={vendorMetrics} />
          <div className="grid gap-4 lg:grid-cols-2">
            <BidHealthChart
              bidTrend={bidTrend}
              totalBidVolume={totalBidVolume}
              winRate={winRate}
              totalEarned={totalEarned}
              deliveredOrders={deliveredOrders}
            />
            <KitchenReadinessCard checklistItems={checklistItems} checklistProgress={checklistProgress} />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <BidMarketplace requests={vendorOpenRequests} onOpenRequest={openRequestModal} />
            <MenuHighlights items={menuItems} compact onAddMenuItem={() => setShowMenuModal(true)} />
          </div>
          <OrdersPipeline orders={vendorOrders} promotingOrders={promotingOrders} onPromote={promoteOrder} />
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
      {showMenuModal && (
        <AddMenuItemModal
          onClose={() => setShowMenuModal(false)}
          onSubmit={async (payload: import("@/services/vendorApi").AddMenuItemPayload) => {
            await addMenuItem(payload);
            setShowMenuModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
