export interface GeoData {
  country_code: string;
  country_name: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

const COUNTRY_CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
  NG: { code: "NGN", symbol: "₦" },
  US: { code: "USD", symbol: "$" },
  GB: { code: "GBP", symbol: "£" },
  CA: { code: "CAD", symbol: "C$" },
  AU: { code: "AUD", symbol: "A$" },
  EU: { code: "EUR", symbol: "€" },
  DE: { code: "EUR", symbol: "€" },
  FR: { code: "EUR", symbol: "€" },
  IT: { code: "EUR", symbol: "€" },
  ES: { code: "EUR", symbol: "€" },
  NL: { code: "EUR", symbol: "€" },
  BE: { code: "EUR", symbol: "€" },
  AT: { code: "EUR", symbol: "€" },
  IE: { code: "EUR", symbol: "€" },
  PT: { code: "EUR", symbol: "€" },
  FI: { code: "EUR", symbol: "€" },
  GR: { code: "EUR", symbol: "€" },
  GH: { code: "GHS", symbol: "₵" },
  KE: { code: "KES", symbol: "KSh" },
  ZA: { code: "ZAR", symbol: "R" },
  UG: { code: "UGX", symbol: "USh" },
  TZ: { code: "TZS", symbol: "TSh" },
  RW: { code: "RWF", symbol: "FRw" },
  ZM: { code: "ZMW", symbol: "K" },
  ZW: { code: "USD", symbol: "$" },
  IN: { code: "INR", symbol: "₹" },
  JP: { code: "JPY", symbol: "¥" },
  CN: { code: "CNY", symbol: "¥" },
  KR: { code: "KRW", symbol: "₩" },
  BR: { code: "BRL", symbol: "R$" },
  MX: { code: "MXN", symbol: "Mex$" },
  AE: { code: "AED", symbol: "د.إ" },
  SA: { code: "SAR", symbol: "﷼" },
  QA: { code: "QAR", symbol: "﷼" },
  KW: { code: "KWD", symbol: "د.ك" },
  SG: { code: "SGD", symbol: "S$" },
  MY: { code: "MYR", symbol: "RM" },
  TH: { code: "THB", symbol: "฿" },
  ID: { code: "IDR", symbol: "Rp" },
  PH: { code: "PHP", symbol: "₱" },
  PK: { code: "PKR", symbol: "₨" },
  BD: { code: "BDT", symbol: "৳" },
  TR: { code: "TRY", symbol: "₺" },
  RU: { code: "RUB", symbol: "₽" },
};

const DEFAULT_CURRENCY = { code: "USD", symbol: "$" };

export async function detectCurrency(): Promise<{ code: string; symbol: string }> {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return DEFAULT_CURRENCY;
    }

    const data = (await response.json()) as { country_code?: string };
    const countryCode = data.country_code?.toUpperCase();

    if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
      return COUNTRY_CURRENCY_MAP[countryCode];
    }

    return DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function getCurrencyForCountry(countryCode: string): { code: string; symbol: string } {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
}
