import { api } from "./apiClient";

export interface MarketVendorProfile {
  id: string;
  kitchenName: string;
  specialties: string[];
  rating: number;
  totalOrders: number;
  verified: boolean;
  isOnline: boolean;
  city?: string | null;
  state?: string | null;
  streetAddress?: string | null;
}

export interface MarketBidVendor {
  id: string;
  name: string;
  email: string;
  vendorProfile: MarketVendorProfile | null;
}

export interface MarketBid {
  id: string;
  requestId: string;
  vendorId: string;
  vendor: MarketBidVendor;
  bidAmount: number;
  prepTimeMinutes: number;
  estimatedDeliveryTime: string;
  message?: string | null;
  status: string;
  createdAt: string;
}

export interface MarketRequest {
  id: string;
  buyer: { id: string; name: string; email: string };
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
  createdAt: string;
  bids: MarketBid[];
}

export interface PlaceBidPayload {
  requestId: string;
  bidAmount: number;
  prepTimeMinutes: number;
  estimatedDeliveryTime: string;
  message: string;
}

export async function fetchMarketRequests(): Promise<MarketRequest[]> {
  return api.get<MarketRequest[]>("/requests");
}

export async function placeBid(payload: PlaceBidPayload): Promise<MarketBid> {
  return api.post<MarketBid>("/bids", payload);
}

export async function updateBid(
  bidId: string,
  payload: Partial<PlaceBidPayload>
): Promise<MarketBid> {
  return api.patch<MarketBid>(`/bids/${bidId}`, payload);
}

export async function counterBid(
  bidId: string,
  bidAmount: number,
  message: string
): Promise<MarketBid> {
  return api.patch<MarketBid>(`/bids/${bidId}/counter`, { bidAmount, message });
}

export async function rejectBid(bidId: string): Promise<MarketBid> {
  return api.patch<MarketBid>(`/bids/${bidId}/reject`, {});
}

export async function selectBid(bidId: string): Promise<MarketBid> {
  return api.patch<MarketBid>(`/bids/${bidId}/select`, {});
}

export interface MyBid {
  id: string;
  requestId: string;
  request: { id: string; foodName: string; status: string };
  bidAmount: number;
  prepTimeMinutes: number;
  estimatedDeliveryTime: string;
  message?: string | null;
  status: string;
  createdAt: string;
}

export async function fetchMyBids(): Promise<MyBid[]> {
  return api.get<MyBid[]>("/bids/my");
}
