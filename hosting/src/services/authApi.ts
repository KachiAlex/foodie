import type { SignInPayload, SignUpPayload, AuthUser } from "@/types/auth";

const STATIC_USERS: Record<string, { profile: AuthUser; password: string }> = {
  "admin@foodiemarket.com": {
    profile: {
      name: "Marketplace Admin",
      email: "admin@foodiemarket.com",
      role: "admin",
      verificationStatus: "verified",
    },
    password: "admin123",
  },
};

export async function mockSignUpRequest(payload: SignUpPayload): Promise<AuthUser> {
  if (payload.email in STATIC_USERS) {
    throw new Error("This email is reserved by Foodie Market.");
  }
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

  const staticRecord = STATIC_USERS[payload.email];
  if (staticRecord) {
    if (payload.password !== staticRecord.password) {
      throw new Error("Invalid credentials");
    }
    return staticRecord.profile;
  }

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
