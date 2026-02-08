import { useCallback } from "react";

interface AnalyticsPayload {
  [key: string]: unknown;
}

export function useAnalytics() {
  const track = useCallback((event: string, payload: AnalyticsPayload = {}) => {
    if (typeof window === "undefined") return;
    // Placeholder for future analytics wiring (Segment, Firebase, etc.)
    if (import.meta.env.DEV) {
      console.info(`[analytics] ${event}`, payload);
    }
    // Example of extending to sendBeacon or fetch when ready.
  }, []);

  return { track };
}
