import { api } from "./apiClient";

type ActionResponse = {
  success: boolean;
  message: string;
};

interface PendingVendor {
  id: string;
  user: { id: string; name: string; email: string };
  kitchenName: string;
  address: string;
  landmark: string;
  verified: boolean;
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
