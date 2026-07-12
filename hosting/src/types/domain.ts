export type PortionType = "Pot" | "Portion" | "Tray";

export type RequestStatus = "draft" | "collecting_bids" | "in_progress" | "fulfilled";

export interface BuyerRequest {
  id: string;
  title: string;
  cuisine: string;
  portionType: PortionType;
  servings: number;
  budget: number;
  status: RequestStatus;
  rawStatus: string;
  deliveryWindow: string;
  bids: number;
}

export interface BuyerOrder {
  id: string;
  requestId: string;
  chef: string;
  dishes: string;
  amount: number;
  eta: string;
  status: "New" | "Cooking" | "Out for delivery" | "Delivered";
  rawStatus: string;
  createdAt?: string;
}

export interface VendorBid {
  id: string;
  requestId: string;
  vendorId: string;
  chef: string;
  price: number;
  eta: string;
  confidence: number;
}

export interface VendorOpenRequest {
  id: string;
  title: string;
  location: string;
  servings: string;
  budget: string;
  deadline: string;
  tags: string[];
}

export interface VendorMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export interface VendorOrderStage {
  id: string;
  customer: string;
  items: string;
  status: "New" | "Cooking" | "Ready" | "Delivered";
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  availability: string;
  tags: string[];
}

export interface AdminVendorRecord {
  id: string;
  name: string;
  email?: string;
  kycStatus: "Pending" | "Approved" | "Flagged";
  rating: number;
  totalOrders: number;
  kitchenName?: string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  landmark?: string;
}
