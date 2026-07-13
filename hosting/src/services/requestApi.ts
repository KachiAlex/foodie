import type { BuyerRequest, BuyerOrder, RequestStatus, VendorBid } from "@/types/domain";
import { api } from "./apiClient";

/* Backend shape mapping */
interface BackendRequest {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  budgetMin: number;
  budgetMax: number;
  deliveryAddress: string;
  deliveryDateTime: string;
  instructions?: string | null;
  imageUrl?: string | null;
  status: string;
  bids: BackendBid[];
}

interface BackendBid {
  id: string;
  requestId: string;
  vendorId: string;
  vendor?: { id: string; name: string };
  bidAmount: number;
  estimatedDeliveryTime?: string;
  message?: string;
}

interface BackendOrder {
  id: string;
  requestId?: string;
  buyer?: { name: string };
  request?: { foodName: string };
  foodCost: number;
  deliveryFee: number;
  platformFee: number;
  escrowFee: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveredAt?: string | null;
}

function mapOrderStatus(status: string): BuyerOrder["status"] {
  switch (status) {
    case "accepted":
      return "New";
    case "paid":
    case "cooking":
      return "Cooking";
    case "ready_for_pickup":
    case "picked_up":
      return "Out for delivery";
    case "delivered":
    case "completed":
      return "Delivered";
    case "disputed":
    case "cancelled":
      return "Delivered";
    default:
      return "New";
  }
}

function mapBuyerOrder(o: BackendOrder): BuyerOrder {
  return {
    id: o.id,
    requestId: o.requestId || "",
    chef: o.request?.foodName || "Unknown",
    dishes: o.request?.foodName || "Unknown",
    amount: o.totalAmount || o.foodCost + o.deliveryFee || 0,
    foodCost: o.foodCost,
    deliveryFee: o.deliveryFee,
    platformFee: o.platformFee,
    escrowFee: o.escrowFee,
    eta: o.deliveredAt ? new Date(o.deliveredAt).toLocaleString() : "Pending",
    status: mapOrderStatus(o.status),
    rawStatus: o.status,
    createdAt: o.createdAt,
  };
}

function mapStatus(status: string): RequestStatus {
  switch (status) {
    case "open":
    case "bidding":
      return "collecting_bids";
    case "bid_selected":
    case "paid":
    case "cooking":
    case "picked_up":
    case "delivered":
      return "in_progress";
    case "completed":
    case "cancelled":
      return "fulfilled";
    default:
      return "draft";
  }
}

function mapRequest(r: BackendRequest): BuyerRequest {
  return {
    id: r.id,
    title: r.foodName,
    cuisine: r.category,
    portionType: (r.unit as "Pot" | "Portion" | "Tray") || "Portion",
    servings: r.quantity,
    budget: r.budgetMax || r.budgetMin || 0,
    status: mapStatus(r.status),
    rawStatus: r.status,
    deliveryWindow: new Date(r.deliveryDateTime).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    bids: Array.isArray(r.bids) ? r.bids.length : 0,
  };
}

function mapBid(b: BackendBid): VendorBid {
  return {
    id: b.id,
    requestId: b.requestId,
    vendorId: b.vendorId ?? b.vendor?.id ?? "",
    chef: b.vendor?.name || "Unknown",
    price: b.bidAmount,
    eta: b.estimatedDeliveryTime || "TBD",
    confidence: 0.8,
  };
}

export interface CreateRequestPayload {
  title: string;
  cuisine: string;
  portionType: "Pot" | "Portion" | "Tray";
  uom: string;
  servings: number;
  budget: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
}

export interface CreateBidPayload {
  requestId: string;
  chef: string;
  price: number;
  eta: string;
  confidence: number;
}

export async function fetchRequests(): Promise<BuyerRequest[]> {
  const data = await api.get<BackendRequest[]>("/requests");
  return data.map(mapRequest);
}

export async function createRequest(payload: CreateRequestPayload): Promise<BuyerRequest> {
  const dt = new Date(`${payload.deliveryDate}T${payload.deliveryTime}`);
  const data = await api.post<BackendRequest>("/requests", {
    foodName: payload.title,
    category: payload.cuisine,
    quantity: payload.servings,
    unit: payload.portionType,
    budgetMin: payload.budget * 0.8,
    budgetMax: payload.budget,
    deliveryAddress: payload.deliveryAddress,
    deliveryDateTime: dt.toISOString(),
    instructions: "",
    imageUrl: "",
  });
  return mapRequest(data);
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<BuyerRequest> {
  const backendStatus = status === "fulfilled" ? "completed" : status;
  const data = await api.patch<BackendRequest>(`/requests/${requestId}/status`, { status: backendStatus });
  return mapRequest(data);
}

export async function reopenRequest(requestId: string): Promise<BuyerRequest> {
  const data = await api.post<BackendRequest>(`/requests/${requestId}/reopen`, {});
  return mapRequest(data);
}

export async function fetchBids(): Promise<VendorBid[]> {
  const data = await api.get<BackendBid[]>("/bids");
  return data.map(mapBid);
}

export async function createBid(payload: CreateBidPayload): Promise<VendorBid> {
  const data = await api.post<BackendBid>("/bids", {
    requestId: payload.requestId,
    bidAmount: payload.price,
    estimatedDeliveryTime: payload.eta,
    message: `Bid from ${payload.chef}`,
  });
  return mapBid(data);
}

export async function selectBid(bidId: string): Promise<{ bid: VendorBid; order: BuyerOrder }> {
  const data = await api.patch<{ bid: BackendBid; order: BackendOrder }>(`/bids/${bidId}/select`, {});
  return { bid: mapBid(data.bid), order: mapBuyerOrder(data.order) };
}

// Admin actions
export async function deleteRequest(requestId: string): Promise<void> {
  await api.del(`/requests/${requestId}`);
}
