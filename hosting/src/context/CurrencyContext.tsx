import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { detectCurrency } from "@/services/currencyApi";

interface CurrencyContextValue {
  code: string;
  symbol: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  code: "NGN",
  symbol: "₦",
  isLoading: true,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<{ code: string; symbol: string }>({
    code: "NGN",
    symbol: "₦",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    detectCurrency().then((detected) => {
      setCurrency(detected);
      setIsLoading(false);
    });
  }, []);

  return (
    <CurrencyContext.Provider value={{ ...currency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
