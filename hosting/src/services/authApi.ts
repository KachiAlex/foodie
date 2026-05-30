import type { SignInPayload, SignUpPayload, AuthUser } from "@/types/auth";
import { api, setToken } from "./apiClient";

interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: AuthUser["role"];
  token: string;
}

function toAuthUser(data: AuthResponse, status?: "pending" | "verified"): AuthUser {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    verificationStatus: status,
  };
}

export async function signUpRequest(payload: SignUpPayload): Promise<AuthUser> {
  const data = await api.post<AuthResponse & { verificationStatus?: "pending" | "verified" }>("/auth/sign-up", {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: payload.role,
    vendorVerification: payload.vendorVerification,
  });
  setToken(data.token);
  return toAuthUser(data, data.verificationStatus);
}

export async function signInRequest(payload: SignInPayload): Promise<AuthUser> {
  const data = await api.post<AuthResponse & { verificationStatus?: "pending" | "verified" }>("/auth/sign-in", {
    email: payload.email,
    password: payload.password,
  });
  setToken(data.token);
  return toAuthUser(data, data.verificationStatus);
}
