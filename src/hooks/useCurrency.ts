"use client";
import { useState, useEffect } from "react";

export type CurrencyCode = "MNT" | "KRW" | "USD" | "JPY" | "EUR" | "CNY";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  MN: { code: "MNT", symbol: "₮", locale: "mn-MN", name: "Төгрөг" },
  KR: { code: "KRW", symbol: "₩", locale: "ko-KR", name: "원" },
  US: { code: "USD", symbol: "$",  locale: "en-US", name: "Dollar" },
  JP: { code: "JPY", symbol: "¥",  locale: "ja-JP", name: "円" },
  CN: { code: "CNY", symbol: "¥",  locale: "zh-CN", name: "人民币" },
  FR: { code: "EUR", symbol: "€",  locale: "fr-FR", name: "Euro" },
  DE: { code: "EUR", symbol: "€",  locale: "de-DE", name: "Euro" },
  GB: { code: "USD", symbol: "$",  locale: "en-GB", name: "Dollar" },
  AU: { code: "USD", symbol: "$",  locale: "en-AU", name: "Dollar" },
  CA: { code: "USD", symbol: "$",  locale: "en-CA", name: "Dollar" },
};

const DEFAULT: CurrencyInfo = { code: "USD", symbol: "$", locale: "en-US", name: "Dollar" };
const RATE: Record<CurrencyCode, number> = {
  USD: 1, MNT: 3450, KRW: 1350, JPY: 155, EUR: 0.92, CNY: 7.25,
};

export function formatPrice(usdPrice: number, currency: CurrencyInfo): string {
  const amount = Math.round(usdPrice * RATE[currency.code]);
  if (currency.code === "MNT") return `${amount.toLocaleString()}${currency.symbol}`;
  if (currency.code === "KRW") return `${currency.symbol}${amount.toLocaleString()}`;
  if (currency.code === "JPY") return `${currency.symbol}${amount.toLocaleString()}`;
  return `${currency.symbol}${amount.toLocaleString()}`;
}

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT);
  const [country, setCountry]   = useState<string>("US");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function detect(): Promise<string> {
      // 1. Server-side API (handles VPN IP)
      try {
        const res = await fetch("/api/detect-country", { cache: "no-store" });
        const data = await res.json();
        console.log("[useCurrency] server detect:", data.country);
        if (data.country && data.country !== "UNKNOWN") return data.country;
      } catch {}

      // 2. Timezone (browser-side VPN detection)
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("[useCurrency] timezone:", tz);
        const TZ: Record<string, string> = {
          "Asia/Tokyo": "JP",
          "Asia/Seoul": "KR",
          "Asia/Ulaanbaatar": "MN",
          "Asia/Shanghai": "CN",
          "Asia/Hong_Kong": "CN",
          "Europe/Paris": "FR",
          "Europe/Berlin": "DE",
          "Europe/London": "GB",
          "Europe/Amsterdam": "DE",
          "Europe/Brussels": "FR",
          "America/New_York": "US",
          "America/Los_Angeles": "US",
          "America/Chicago": "US",
          "America/Denver": "US",
          "Australia/Sydney": "AU",
          "Australia/Melbourne": "AU",
          "America/Toronto": "CA",
          "America/Vancouver": "CA",
        };
        if (TZ[tz]) return TZ[tz];
      } catch {}

      // 3. Browser language — last resort
      const lang = navigator.language || "en";
      if (lang.startsWith("mn")) return "MN";
      if (lang.startsWith("ko")) return "KR";
      if (lang.startsWith("ja")) return "JP";
      if (lang.startsWith("zh")) return "CN";
      return "US";
    }

    detect().then((currentRegion: string) => {
      // Auto-clear if region changed (e.g. VPN switched)
      const savedRegion = sessionStorage.getItem("aura_region");
      if (savedRegion !== currentRegion) {
        sessionStorage.removeItem("aura_currency");
        sessionStorage.removeItem("aura_payment_methods");
        sessionStorage.removeItem("aura_pricing");
        sessionStorage.setItem("aura_region", currentRegion);
      }

      const curr = CURRENCY_MAP[currentRegion] || DEFAULT;
      setCurrency(curr);
      setCountry(currentRegion);
    }).finally(() => setLoading(false));
  }, []);

  return { currency, country, loading, formatPrice: (usd: number) => formatPrice(usd, currency) };
}
