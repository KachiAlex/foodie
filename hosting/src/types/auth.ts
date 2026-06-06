import type { Role } from "@/context/RoleContext";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  verificationStatus?: "pending" | "verified";
  vendorVerificationId?: string;
}

export interface VendorVerificationPayload {
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  landmark: string;
  kitchenMediaCount: number;
  idCardProvided: boolean;
  utilityBillProvided: boolean;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  vendorVerification?: VendorVerificationPayload;
}

export interface SignInPayload {
  email: string;
  password: string;
  role?: Role;
}
