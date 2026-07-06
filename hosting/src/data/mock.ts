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
  deliveryWindow: string;
  bids: number;
}

export interface BuyerOrder {
  id: string;
  chef: string;
  dishes: string;
  amount: number;
  eta: string;
  status: "Cooking" | "Out for delivery" | "Delivered";
}

export interface VendorBid {
  id: string;
  requestId: string;
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
}

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  availability: string;
  tags: string[];
}

export interface AdminMetric {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}

export interface AdminOrder {
  id: string;
  buyer: string;
  vendor: string;
  amount: string;
  status: string;
}

export interface AdminVendorRecord {
  id: string;
  name: string;
  kycStatus: "Pending" | "Approved" | "Flagged";
  rating: number;
  totalOrders: number;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

