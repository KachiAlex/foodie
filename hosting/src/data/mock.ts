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

export const buyerRequests: BuyerRequest[] = [
  {
    id: "REQ-2012",
    title: "Party Jollof & Fried Chicken",
    cuisine: "Nigerian",
    portionType: "Pot",
    servings: 25,
    budget: 320,
    status: "collecting_bids",
    deliveryWindow: "Today, 5:30PM",
    bids: 4,
  },
  {
    id: "REQ-0894",
    title: "Vegetarian Soup Pack",
    cuisine: "African Fusion",
    portionType: "Portion",
    servings: 8,
    budget: 110,
    status: "in_progress",
    deliveryWindow: "Tomorrow, 11AM",
    bids: 2,
  },
  {
    id: "REQ-0534",
    title: "Office Lunch Bowls",
    cuisine: "Healthy",
    portionType: "Tray",
    servings: 15,
    budget: 260,
    status: "fulfilled",
    deliveryWindow: "Yesterday, 1PM",
    bids: 6,
  },
];

export const buyerOrders: BuyerOrder[] = [
  {
    id: "ORD-8721",
    chef: "Chef Nneka",
    dishes: "Okra Soup + Semolina",
    amount: 145,
    eta: "Couriers picking up",
    status: "Cooking",
  },
  {
    id: "ORD-8602",
    chef: "Chef Tunde",
    dishes: "Jollof Rice Feast",
    amount: 210,
    eta: "Arriving in 15 mins",
    status: "Out for delivery",
  },
  {
    id: "ORD-8510",
    chef: "Chef Mimi",
    dishes: "Plantain & Beans Trays",
    amount: 98,
    eta: "Delivered 2h ago",
    status: "Delivered",
  },
];

export const vendorBids: VendorBid[] = [
  {
    id: "BID-2201",
    requestId: "REQ-2012",
    chef: "Chef Amaka",
    price: 305,
    eta: "Ready by 5PM",
    confidence: 92,
  },
  {
    id: "BID-2194",
    requestId: "REQ-2012",
    chef: "Chef Lolu",
    price: 315,
    eta: "Ready by 5:15PM",
    confidence: 88,
  },
  {
    id: "BID-2142",
    requestId: "REQ-0894",
    chef: "Chef Ada",
    price: 120,
    eta: "Tomorrow 10AM",
    confidence: 80,
  },
];

export const featuredVendors = [
  {
    id: "VEN-31",
    name: "Chef Laila",
    specialty: "Plant-forward Nigerian",
    rating: 4.9,
    distance: "2.1km",
  },
  {
    id: "VEN-52",
    name: "Chef Seyi",
    specialty: "Party classics",
    rating: 4.8,
    distance: "3.4km",
  },
  {
    id: "VEN-18",
    name: "Chef Moyo",
    specialty: "Soups & Swallows",
    rating: 4.9,
    distance: "1.5km",
  },
];

export const vendorMetrics: VendorMetric[] = [
  { label: "Today", value: "$420", change: "+18% vs avg", trend: "up" },
  { label: "This Week", value: "$2,840", change: "+6% vs last", trend: "up" },
  { label: "Acceptance", value: "92%", change: "-2%", trend: "down" },
];

export const vendorOpenRequests: VendorOpenRequest[] = [
  {
    id: "REQ-2104",
    title: "Family Egusi Pack",
    location: "Lekki Phase 1",
    servings: "12 portions",
    budget: "$180",
    deadline: "Today 4PM",
    tags: ["Egusi", "Swallow"],
  },
  {
    id: "REQ-2099",
    title: "Corporate Lunch Bowls",
    location: "Ikoyi",
    servings: "30 bowls",
    budget: "$420",
    deadline: "Tomorrow 1PM",
    tags: ["Healthy", "Bulk"],
  },
  {
    id: "REQ-2082",
    title: "Large Pot Jollof",
    location: "Yaba",
    servings: "60 plates",
    budget: "$650",
    deadline: "Saturday",
    tags: ["Party", "Outdoor"],
  },
];

export const vendorOrders: VendorOrderStage[] = [
  {
    id: "ORD-901",
    customer: "Ngozi & Co.",
    items: "Jollof + Suya wings",
    status: "New",
  },
  {
    id: "ORD-894",
    customer: "Kola Family",
    items: "Okra + Poundo",
    status: "Cooking",
  },
  {
    id: "ORD-889",
    customer: "Beta Logistics",
    items: "30 lunch bowls",
    status: "Ready",
  },
  {
    id: "ORD-873",
    customer: "Wale & Co.",
    items: "Custom soups",
    status: "Delivered",
  },
];

export const menuItems: MenuItem[] = [
  { id: "M-01", name: "Smoky Party Jollof", price: "$95 / pot", availability: "Daily", tags: ["Top seller"] },
  { id: "M-02", name: "Fisherman Soup", price: "$18 / bowl", availability: "Weekends", tags: ["New"] },
  { id: "M-03", name: "Vegan Afang Bowl", price: "$12 / bowl", availability: "Daily", tags: ["Vegan"] },
];

export const adminMetrics: AdminMetric[] = [
  { label: "Gross Marketplace Volume", value: "$128k", delta: "+12%", trend: "up" },
  { label: "Active Requests", value: "312", delta: "+4%", trend: "up" },
  { label: "Disputes", value: "7", delta: "-2", trend: "down" },
];

export const adminOrders: AdminOrder[] = [
  { id: "ORD-9031", buyer: "Oluwatobi F.", vendor: "Chef Nkem", amount: "$210", status: "In progress" },
  { id: "ORD-9027", buyer: "Dara Foods", vendor: "Chef Pilar", amount: "$540", status: "Delivered" },
  { id: "ORD-9018", buyer: "Ifeanyi & Co.", vendor: "Chef Tobi", amount: "$320", status: "Dispute" },
];

export const adminVendors: AdminVendorRecord[] = [
  { id: "VEN-120", name: "Chef Muna", kycStatus: "Pending", rating: 4.7, totalOrders: 210 },
  { id: "VEN-098", name: "Chef Dayo", kycStatus: "Approved", rating: 4.9, totalOrders: 402 },
  { id: "VEN-045", name: "Chef Ireti", kycStatus: "Flagged", rating: 4.3, totalOrders: 155 },
];

export const auditLog: AuditLogEntry[] = [
  { id: "LOG-7781", actor: "Ada (Admin)", action: "Refund approved", target: "ORD-9018", timestamp: "09:14" },
  { id: "LOG-7776", actor: "Seyi (Admin)", action: "Vendor suspended", target: "VEN-045", timestamp: "08:52" },
  { id: "LOG-7764", actor: "Ada (Admin)", action: "Payout released", target: "VEN-098", timestamp: "Yesterday" },
];
