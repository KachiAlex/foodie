import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  BuyerRequest,
  BuyerOrder,
  VendorBid,
  VendorOrderStage,
  MenuItem,
  VendorMetric,
  VendorOpenRequest,
} from "@/data/mock";
import {
  fetchRequests,
  createRequest,
  updateRequestStatus,
  fetchBids,
  createBid,
  selectBid,
} from "@/services/requestApi";
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  fetchVendorOrders,
  updateVendorOrderStatus,
} from "@/services/orderApi";
import {
  fetchVendorMetrics,
  fetchMenuItems,
  addMenuItem as addVendorMenuItem,
  fetchVendorOpenRequests,
} from "@/services/vendorApi";
import type { CreateRequestPayload, CreateBidPayload } from "@/services/requestApi";
import type { CreateOrderPayload, UpdateOrderStatusPayload } from "@/services/orderApi";
import type { AddMenuItemPayload } from "@/services/vendorApi";
import { useToast } from "@/context/ToastContext";

interface AppState {
  requests: BuyerRequest[];
  orders: BuyerOrder[];
  bids: VendorBid[];
  vendorOrders: VendorOrderStage[];
  menuItems: MenuItem[];
  vendorMetrics: VendorMetric[];
  vendorOpenRequests: VendorOpenRequest[];
  isLoading: boolean;
  isInitialized: boolean;
}

interface AppContextValue extends AppState {
  refresh: () => Promise<void>;
  addRequest: (payload: CreateRequestPayload) => Promise<BuyerRequest>;
  changeRequestStatus: (id: string, status: BuyerRequest["status"]) => Promise<BuyerRequest>;
  addBid: (payload: CreateBidPayload) => Promise<VendorBid>;
  acceptBid: (bidId: string, requestId: string) => Promise<VendorBid>;
  addOrder: (payload: CreateOrderPayload) => Promise<BuyerOrder>;
  changeOrderStatus: (payload: UpdateOrderStatusPayload) => Promise<BuyerOrder>;
  changeVendorOrderStatus: (id: string, status: VendorOrderStage["status"]) => Promise<VendorOrderStage>;
  addMenuItem: (payload: AddMenuItemPayload) => Promise<MenuItem>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [bids, setBids] = useState<VendorBid[]>([]);
  const [vendorOrders, setVendorOrders] = useState<VendorOrderStage[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [vendorMetrics, setVendorMetrics] = useState<VendorMetric[]>([]);
  const [vendorOpenRequests, setVendorOpenRequests] = useState<VendorOpenRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        reqData,
        orderData,
        bidData,
        venOrderData,
        menuData,
        metricData,
        openReqData,
      ] = await Promise.all([
        fetchRequests(),
        fetchOrders(),
        fetchBids(),
        fetchVendorOrders(),
        fetchMenuItems(),
        fetchVendorMetrics(),
        fetchVendorOpenRequests(),
      ]);
      setRequests(reqData);
      setOrders(orderData);
      setBids(bidData);
      setVendorOrders(venOrderData);
      setMenuItems(menuData);
      setVendorMetrics(metricData);
      setVendorOpenRequests(openReqData);
      setIsInitialized(true);
    } catch (error) {
      showToast("Failed to sync with database");
      console.error("[AppContext] Refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRequest = useCallback(
    async (payload: CreateRequestPayload) => {
      const created = await createRequest(payload);
      setRequests((prev) => [created, ...prev]);
      showToast("Request created successfully");
      return created;
    },
    [showToast]
  );

  const changeRequestStatus = useCallback(
    async (id: string, status: BuyerRequest["status"]) => {
      const updated = await updateRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast(`Request status updated to ${status.replace("_", " ")}`);
      return updated;
    },
    [showToast]
  );

  const addBid = useCallback(
    async (payload: CreateBidPayload) => {
      const created = await createBid(payload);
      setBids((prev) => [...prev, created]);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === payload.requestId ? { ...r, bids: r.bids + 1 } : r
        )
      );
      showToast("Bid submitted successfully");
      return created;
    },
    [showToast]
  );

  const acceptBid = useCallback(
    async (bidId: string, requestId: string) => {
      const updated = await selectBid(bidId);
      setBids((prev) => prev.map((b) => b.id === bidId ? { ...b } : b));
      setRequests((prev) =>
        prev.map((r) => r.id === requestId ? { ...r, status: "in_progress" as const } : r)
      );
      showToast("Bid accepted! Order is now in progress.");
      return updated;
    },
    [showToast]
  );

  const addOrder = useCallback(
    async (payload: CreateOrderPayload) => {
      const created = await createOrder(payload);
      setOrders((prev) => [created, ...prev]);
      showToast("Order created successfully");
      return created;
    },
    [showToast]
  );

  const changeOrderStatus = useCallback(
    async (payload: UpdateOrderStatusPayload) => {
      const updated = await updateOrderStatus(payload);
      setOrders((prev) =>
        prev.map((o) => (o.id === payload.orderId ? updated : o))
      );
      showToast(`Order status updated to ${payload.status}`);
      return updated;
    },
    [showToast]
  );

  const changeVendorOrderStatus = useCallback(
    async (id: string, status: VendorOrderStage["status"]) => {
      const updated = await updateVendorOrderStatus(id, status);
      setVendorOrders((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      );
      showToast(`Vendor order status updated to ${status}`);
      return updated;
    },
    [showToast]
  );

  const addMenuItem = useCallback(
    async (payload: AddMenuItemPayload) => {
      const created = await addVendorMenuItem(payload);
      setMenuItems((prev) => [...prev, created]);
      showToast("Menu item added successfully");
      return created;
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      requests,
      orders,
      bids,
      vendorOrders,
      menuItems,
      vendorMetrics,
      vendorOpenRequests,
      isLoading,
      isInitialized,
      refresh,
      addRequest,
      changeRequestStatus,
      addBid,
      acceptBid,
      addOrder,
      changeOrderStatus,
      changeVendorOrderStatus,
      addMenuItem,
    }),
    [
      requests,
      orders,
      bids,
      vendorOrders,
      menuItems,
      vendorMetrics,
      vendorOpenRequests,
      isLoading,
      isInitialized,
      refresh,
      addRequest,
      changeRequestStatus,
      addBid,
      acceptBid,
      addOrder,
      changeOrderStatus,
      changeVendorOrderStatus,
      addMenuItem,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
