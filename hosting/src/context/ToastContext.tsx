import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ToastContextValue {
  message: string | null;
  showToast: (message: string, durationMs?: number) => void;
  clearToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((nextMessage: string, durationMs = 2500) => {
    setMessage(nextMessage);
    if (durationMs > 0) {
      window.setTimeout(() => setMessage((current) => (current === nextMessage ? null : current)), durationMs);
    }
  }, []);

  const clearToast = useCallback(() => setMessage(null), []);

  return <ToastContext.Provider value={{ message, showToast, clearToast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
