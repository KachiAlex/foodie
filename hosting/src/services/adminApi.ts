import { api } from "./apiClient";

type ActionResponse = {
  success: boolean;
  message: string;
};

export interface DashboardMetrics {
  totalRequests: number;
  activeBids: number;
  escrowHeld: number;
  pendingDisputes: number;
  newVendors: number;
}

export interface AdminOrder {
  id: string;
  buyer: { id: string; name: string };
  request: { id: string; foodName: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface EscrowTransaction {
  id: string;
  vendor: { id: string; name: string };
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export interface AdminDispute {
  id: string;
  order: { id: string };
  openedBy: { id: string; name: string };
  reason: string;
  status: string;
  openedAt: string;
}

interface PendingVendor {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  kitchenName: string;
  address: string;
  landmark: string;
  verified: boolean;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return api.get<DashboardMetrics>("/admin/dashboard");
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return api.get<AdminOrder[]>("/admin/orders");
}

export async function getEscrowTransactions(): Promise<EscrowTransaction[]> {
  return api.get<EscrowTransaction[]>("/admin/escrow");
}

export async function getAdminDisputes(): Promise<AdminDispute[]> {
  return api.get<AdminDispute[]>("/admin/disputes");
}

export async function approvePayoutRequest(payoutId: string): Promise<ActionResponse> {
  const data = await api.patch<{ success: boolean; message: string }>(`/admin/escrow/${payoutId}/release`, {});
  return data;
}

export async function createOrderEscalation(orderId: string): Promise<ActionResponse> {
  const data = await api.post<{ success: boolean; message: string }>(`/admin/disputes`, {
    orderId,
    reason: "Escalated by admin",
  });
  return data;
}

export async function triggerVendorAudit(vendorId: string): Promise<ActionResponse> {
  const data = await api.post<{ success: boolean; message: string }>(`/admin/vendors/${vendorId}/audit`, {});
  return data;
}

export async function getPendingVendors(): Promise<PendingVendor[]> {
  const data = await api.get<PendingVendor[]>("/admin/vendors/pending");
  return data;
}

export async function verifyVendor(vendorId: string): Promise<PendingVendor> {
  const data = await api.patch<PendingVendor>(`/admin/vendors/${vendorId}/verify`, {});
  return data;
}

export async function resolveDispute(disputeId: string): Promise<ActionResponse> {
  const data = await api.patch<ActionResponse>(`/admin/disputes/${disputeId}/resolve`, {});
  return data;
}
