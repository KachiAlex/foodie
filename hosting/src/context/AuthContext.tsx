import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRole } from "@/context/RoleContext";
import type { AuthUser, SignInPayload, SignUpPayload } from "@/types/auth";
import { mockSignInRequest, mockSignUpRequest } from "@/services/authApi";

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
    async (payload: SignUpPayload) => {
      const nextUser = await mockSignUpRequest(payload);
      persistUser(nextUser);
      return nextUser;
    },
    [persistUser],
  );

  const signIn = useCallback(
    async (payload: SignInPayload) => {
      const nextUser = await mockSignInRequest(payload, user);
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
