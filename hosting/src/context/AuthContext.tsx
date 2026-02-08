import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "@/context/RoleContext";
import { useRole } from "@/context/RoleContext";

interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

interface VendorVerificationPayload {
  address: string;
  landmark: string;
  kitchenMediaCount: number;
  idCardProvided: boolean;
  utilityBillProvided: boolean;
}

interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  vendorVerification?: VendorVerificationPayload;
}

interface SignInPayload {
  email: string;
  password: string;
  role?: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (payload: SignInPayload) => Promise<AuthUser>;
  signUp: (payload: SignUpPayload) => Promise<AuthUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "foodiemarket_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setRole } = useRole();
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const persistUser = useCallback(
    (nextUser: AuthUser) => {
      setUser(nextUser);
      setRole(nextUser.role);
    },
    [setRole],
  );

  const signUp = useCallback(
    async ({ name, email, password, role, vendorVerification }: SignUpPayload) => {
      void password; // placeholder until backend integration
      void vendorVerification;
      await new Promise((resolve) => setTimeout(resolve, 600));
      const nextUser: AuthUser = { name, email, role };
      persistUser(nextUser);
      return nextUser;
    },
    [persistUser],
  );

  const signIn = useCallback(
    async ({ email, password, role }: SignInPayload) => {
      void password;
      await new Promise((resolve) => setTimeout(resolve, 400));
      const existing = user;
      const resolvedRole = role ?? existing?.role ?? "buyer";
      const resolvedName = existing?.name ?? "Foodie";
      const nextUser: AuthUser = { name: resolvedName, email, role: resolvedRole };
      persistUser(nextUser);
      return nextUser;
    },
    [persistUser, user],
  );

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      signIn,
      signUp,
      signOut,
    }),
    [signIn, signUp, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
