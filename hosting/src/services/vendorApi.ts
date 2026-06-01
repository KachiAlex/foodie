import type { VendorMetric, MenuItem, VendorOpenRequest } from "@/types/domain";
import { api } from "./apiClient";

/* Backend shape mapping */
interface BackendWallet {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

interface BackendMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface BackendOpenRequest {
  id: string;
  foodName: string;
  deliveryAddress: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryDateTime: string;
  category: string;
}

function mapMenuItem(item: BackendMenuItem): MenuItem {
  return {
    id: item.id,
    name: item.name,
    price: `₦${item.price.toLocaleString()}`,
    availability: item.category || "Available",
    tags: item.description ? [item.description] : [],
  };
}

function mapOpenRequest(r: BackendOpenRequest): VendorOpenRequest {
  return {
    id: r.id,
    title: r.foodName,
    location: r.deliveryAddress || "Lagos",
    servings: `${r.quantity} ${r.category}`,
    budget: `₦${(r.budgetMin || 0).toLocaleString()} - ₦${(r.budgetMax || 0).toLocaleString()}`,
    deadline: new Date(r.deliveryDateTime).toLocaleString(),
    tags: [r.category],
  };
}

export interface AddMenuItemPayload {
  name: string;
  price: string;
  availability: string;
  tags: string[];
}

export async function fetchVendorMetrics(): Promise<VendorMetric[]> {
  const data = await api.get<BackendWallet>("/vendors/wallet");
  return [
    { label: "Wallet Balance", value: `₦${(data.balance || 0).toLocaleString()}`, change: "0%", trend: "up" },
    { label: "Total Earned", value: `₦${(data.totalEarned || 0).toLocaleString()}`, change: "0%", trend: "up" },
    { label: "Total Withdrawn", value: `₦${(data.totalWithdrawn || 0).toLocaleString()}`, change: "0%", trend: "down" },
  ];
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const data = await api.get<BackendMenuItem[]>("/vendors/menu");
  return data.map(mapMenuItem);
}

export async function addMenuItem(payload: AddMenuItemPayload): Promise<MenuItem> {
  const numericPrice = Number(payload.price.replace(/[^0-9]/g, "")) || 0;
  const data = await api.post<BackendMenuItem>("/vendors/menu", {
    name: payload.name,
    price: numericPrice,
    category: payload.availability,
    description: payload.tags.join(", "),
    imageUrl: "",
  });
  return mapMenuItem(data);
}

export interface FeaturedVendor {
  id: string;
  name: string;
  kitchenName: string;
  address: string;
  specialties: string[];
  menuItems: { name: string; price: number }[];
}

interface BackendVendorProfile {
  id: string;
  userId: string;
  kitchenName: string;
  address: string;
  specialties: string[];
  user: { id: string; name: string };
  menuItems: { name: string; price: number }[];
}

export async function listVendors(): Promise<FeaturedVendor[]> {
  const data = await api.get<BackendVendorProfile[]>("/vendors");
  return data.map((v) => ({
    id: v.userId,
    name: v.user?.name ?? "Unknown Chef",
    kitchenName: v.kitchenName ?? "",
    address: v.address ?? "",
    specialties: v.specialties ?? [],
    menuItems: v.menuItems ?? [],
  }));
}

export async function fetchVendorOpenRequests(): Promise<VendorOpenRequest[]> {
  const data = await api.get<BackendOpenRequest[]>("/vendors/open-requests");
  return data.map(mapOpenRequest);
}

export async function createVendorOpenRequest(
  payload: Omit<VendorOpenRequest, "id">
): Promise<VendorOpenRequest> {
  const data = await api.post<BackendOpenRequest>("/requests", {
    foodName: payload.title,
    category: payload.tags[0] || "General",
    quantity: Number(payload.servings.replace(/[^0-9]/g, "")) || 1,
    unit: "Portion",
    budgetMin: 0,
    budgetMax: Number(payload.budget.replace(/[^0-9]/g, "")) || 0,
    deliveryAddress: payload.location,
    deliveryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    instructions: "",
    imageUrl: "",
  });
  return mapOpenRequest(data);
}
