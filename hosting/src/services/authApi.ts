import type { SignInPayload, SignUpPayload, AuthUser } from "@/types/auth";
import { api, setToken } from "./apiClient";

interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: AuthUser["role"];
  token: string;
}

function toAuthUser(data: AuthResponse): AuthUser {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
}

export async function signUpRequest(payload: SignUpPayload): Promise<AuthUser> {
  const data = await api.post<AuthResponse>("/auth/sign-up", {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: payload.role,
  });
  setToken(data.token);
  return toAuthUser(data);
}

export async function signInRequest(payload: SignInPayload): Promise<AuthUser> {
  const data = await api.post<AuthResponse>("/auth/sign-in", {
    email: payload.email,
    password: payload.password,
  });
  setToken(data.token);
  return toAuthUser(data);
}
