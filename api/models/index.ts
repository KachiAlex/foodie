export type RequestStatus =
  | "open"
  | "bidding"
  | "bid_selected"
  | "paid"
  | "cooking"
  | "picked_up"
  | "delivered"
  | "completed"
  | "cancelled";

export type BidStatus = "active" | "selected" | "rejected" | "expired";

export type OrderStatus =
  | "paid"
  | "accepted"
  | "cooking"
  | "ready_for_pickup"
  | "picked_up"
  | "delivered"
  | "completed"
  | "disputed"
  | "cancelled";

export interface FoodRequest {
  id: string;
  buyerId: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  budgetMin: number;
  budgetMax: number;
  deliveryAddress: string;
  deliveryDateTime: string;
  instructions?: string;
  imageUrl?: string;
  status: RequestStatus;
  selectedBidId?: string;
  createdAt: string;
}

export interface VendorBid {
  id: string;
  requestId: string;
  vendorId: string;
  bidAmount: number;
  prepTimeMinutes: number;
  estimatedDeliveryTime: string;
  message?: string;
  imageUrl?: string;
  status: BidStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  requestId: string;
  buyerId: string;
  vendorId: string;
  bidId: string;
  foodCost: number;
  deliveryFee: number;
  platformFee: number;
  escrowFee: number;
  totalAmount: number;
  status: OrderStatus;
  riderId?: string;
  deliveredAt?: string;
  dispute?: {
    reason: string;
    openedAt: string;
    resolvedAt?: string;
  };
  createdAt: string;
}

export interface EscrowWallet {
  vendorId: string;
  available: number;
  pending: number;
  totalEarned: number;
  currency: string;
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  vendorId: string;
  amount: number;
  type: "deposit" | "release" | "refund" | "withdrawal";
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "vendor" | "admin";
  passwordHash: string;
  verificationStatus: "pending" | "verified";
  createdAt: string;
}

export interface VendorProfile {
  userId: string;
  kitchenName: string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  landmark: string;
  specialty: string[];
  rating: number;
  totalOrders: number;
  isOnline: boolean;
  verified: boolean;
}
