import type { BuyerOrder, VendorOrderStage } from "@/types/domain";
import { api } from "./apiClient";

/* Backend shape mapping */
interface BackendOrder {
  id: string;
  buyer?: { name: string };
  request?: { foodName: string };
  foodCost: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveredAt?: string | null;
}

function mapOrderStatus(status: string): BuyerOrder["status"] {
  switch (status) {
    case "paid":
    case "preparing":
      return "Cooking";
    case "ready":
    case "out_for_delivery":
      return "Out for delivery";
    case "completed":
      return "Delivered";
    default:
      return "Cooking";
  }
}

function mapVendorOrderStatus(status: string): VendorOrderStage["status"] {
  switch (status) {
    case "paid":
      return "New";
    case "preparing":
      return "Cooking";
    case "ready":
      return "Ready";
    case "completed":
      return "Delivered";
    default:
      return "New";
  }
}

function mapBuyerOrder(o: BackendOrder): BuyerOrder {
  return {
    id: o.id,
    chef: o.request?.foodName || "Unknown",
    dishes: o.request?.foodName || "Unknown",
    amount: o.totalAmount || o.foodCost + o.deliveryFee || 0,
    eta: o.deliveredAt ? new Date(o.deliveredAt).toLocaleString() : "Pending",
    status: mapOrderStatus(o.status),
    createdAt: o.createdAt,
  };
}

function mapVendorOrder(o: BackendOrder): VendorOrderStage {
  return {
    id: o.id,
    customer: o.buyer?.name || "Unknown",
    items: o.request?.foodName || "Unknown",
    status: mapVendorOrderStatus(o.status),
    createdAt: o.createdAt,
  };
}

export interface CreateOrderPayload {
  chef: string;
  dishes: string;
  amount: number;
  eta: string;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  status: BuyerOrder["status"];
}

export async function fetchOrders(): Promise<BuyerOrder[]> {
  const data = await api.get<BackendOrder[]>("/orders");
  return data.map(mapBuyerOrder);
}

export async function createOrder(payload: CreateOrderPayload): Promise<BuyerOrder> {
  const data = await api.post<BackendOrder>("/orders", {
    requestId: "", // Placeholder; backend needs requestId. Frontend doesn't currently pass it.
    foodCost: payload.amount * 0.85,
    deliveryFee: payload.amount * 0.15,
    totalAmount: payload.amount,
  });
  return mapBuyerOrder(data);
}

export async function updateOrderStatus({ orderId, status }: UpdateOrderStatusPayload): Promise<BuyerOrder> {
  const backendStatus = status === "Delivered" ? "completed" : status === "Out for delivery" ? "out_for_delivery" : "preparing";
  const data = await api.patch<BackendOrder>(`/orders/${orderId}/status`, { status: backendStatus });
  return mapBuyerOrder(data);
}

export async function fetchVendorOrders(): Promise<VendorOrderStage[]> {
  const data = await api.get<BackendOrder[]>("/vendors/orders");
  return data.map(mapVendorOrder);
}

export async function updateVendorOrderStatus(
  orderId: string,
  status: VendorOrderStage["status"]
): Promise<VendorOrderStage> {
  const backendStatus = status === "Delivered" ? "completed" : status === "Ready" ? "ready" : status === "Cooking" ? "preparing" : "paid";
  const data = await api.patch<BackendOrder>(`/orders/${orderId}/status`, { status: backendStatus });
  return mapVendorOrder(data);
}

export async function createVendorOrder(_order: Omit<VendorOrderStage, "id">): Promise<VendorOrderStage> {
  const data = await api.post<BackendOrder>("/orders", {
    requestId: "",
    foodCost: 0,
    deliveryFee: 0,
    totalAmount: 0,
  });
  return mapVendorOrder(data);
}
