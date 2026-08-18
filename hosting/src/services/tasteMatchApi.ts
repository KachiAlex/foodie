import { api } from "./apiClient";

export interface VendorMatchScore {
  vendorId: string;
  kitchenName: string;
  matchScore: number;
  specialties: string[];
  rating: number;
  city: string | null;
  state: string | null;
}

export async function getMatchedVendors(): Promise<VendorMatchScore[]> {
  return api.get<VendorMatchScore[]>("/taste-match/vendors");
}

export async function getVendorMatch(vendorId: string): Promise<{ matchScore: number }> {
  return api.get<{ matchScore: number }>(`/taste-match/vendor/${vendorId}`);
}

export async function refreshPreferences(): Promise<void> {
  await api.post("/taste-match/refresh", {});
}
