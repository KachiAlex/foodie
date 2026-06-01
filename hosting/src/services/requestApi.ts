import type { BuyerRequest, RequestStatus, VendorBid } from "@/data/mock";
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
  vendor?: { name: string };
  bidAmount: number;
  estimatedDeliveryTime?: string;
  message?: string;
}

function mapStatus(status: string): RequestStatus {
  switch (status) {
    case "open":
    case "collecting_bids":
      return "collecting_bids";
    case "bid_selected":
    case "in_progress":
      return "in_progress";
    case "paid":
    case "completed":
    case "fulfilled":
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
    deliveryWindow: r.deliveryAddress || new Date(r.deliveryDateTime).toLocaleString(),
    bids: Array.isArray(r.bids) ? r.bids.length : 0,
  };
}

function mapBid(b: BackendBid): VendorBid {
  return {
    id: b.id,
    requestId: b.requestId,
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
  deliveryWindow: string;
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
  const data = await api.post<BackendRequest>("/requests", {
    foodName: payload.title,
    category: payload.cuisine,
    quantity: payload.servings,
    unit: payload.portionType,
    budgetMin: payload.budget * 0.8,
    budgetMax: payload.budget,
    deliveryAddress: payload.deliveryWindow,
    deliveryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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

export async function selectBid(bidId: string): Promise<VendorBid> {
  const data = await api.patch<BackendBid>(`/bids/${bidId}/select`, {});
  return mapBid(data);
}

// Admin actions
export async function deleteRequest(requestId: string): Promise<void> {
  await api.del(`/requests/${requestId}`);
}
