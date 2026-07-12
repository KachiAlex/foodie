import { api } from "./apiClient";

export interface CommunityVendor {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  kitchenName: string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  landmark?: string | null;
  specialties: string[];
  rating: number;
  totalOrders: number;
  isOnline: boolean;
  verified: boolean;
  menuItems: CommunityMenuItem[];
}

export interface CommunityMenuItem {
  id: string;
  vendorId: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  imageUrl?: string | null;
  isAvailable: boolean;
}

export interface VendorMarketOffer {
  id: string;
  menuItemId: string;
  menuItem: CommunityMenuItem;
  vendorId: string;
  vendor: { id: string; name: string; email: string };
  buyerId: string;
  buyer: { id: string; name: string; email: string };
  quantity: number;
  servings?: number | null;
  deliveryDate?: string | null;
  note?: string | null;
  proposedPrice: number;
  status: "pending" | "accepted" | "rejected" | "countered" | "converted";
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  menuItemId: string;
  vendorId: string;
  quantity: number;
  servings?: number;
  deliveryDate?: string;
  note?: string;
  proposedPrice: number;
}

export interface UpdateOfferPayload {
  status: "accepted" | "rejected" | "countered";
  proposedPrice?: number;
  note?: string;
}

export async function getVendorMarket(): Promise<CommunityVendor[]> {
  return api.get<CommunityVendor[]>("/community/vendors");
}

export async function createOffer(payload: CreateOfferPayload): Promise<VendorMarketOffer> {
  return api.post<VendorMarketOffer>("/community/offers", payload);
}

export async function getOffers(): Promise<VendorMarketOffer[]> {
  return api.get<VendorMarketOffer[]>("/community/offers");
}

export async function updateOffer(offerId: string, payload: UpdateOfferPayload): Promise<VendorMarketOffer> {
  return api.patch<VendorMarketOffer>(`/community/offers/${offerId}`, payload);
}
