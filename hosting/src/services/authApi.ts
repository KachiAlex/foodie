import type { SignInPayload, SignUpPayload, AuthUser } from "@/types/auth";

export async function mockSignUpRequest(payload: SignUpPayload): Promise<AuthUser> {
  if (payload.role === "vendor" && payload.vendorVerification) {
    console.info("[AuthAPI] Received vendor verification", payload.vendorVerification);
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    name: payload.name,
    email: payload.email,
    role: payload.role,
    verificationStatus: payload.role === "vendor" ? "pending" : "verified",
    vendorVerificationId: payload.role === "vendor" ? crypto.randomUUID() : undefined,
  };
}

export async function mockSignInRequest(payload: SignInPayload, existingUser?: AuthUser | null): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const resolvedRole = payload.role ?? existingUser?.role ?? "buyer";
  const resolvedName = existingUser?.name ?? "Foodie";
  return {
    name: resolvedName,
    email: payload.email,
    role: resolvedRole,
    verificationStatus: payload.role === "vendor" ? existingUser?.verificationStatus ?? "pending" : "verified",
    vendorVerificationId: existingUser?.vendorVerificationId,
  };
}
