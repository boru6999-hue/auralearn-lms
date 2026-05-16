import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfIp = req.headers.get("cf-connecting-ip");
    const ip = cfIp || forwarded?.split(",")[0].trim() || realIp || "";

    console.log("[detect-country] IP:", ip, "| forwarded:", forwarded, "| real-ip:", realIp);

    if (ip && ip !== "::1" && ip !== "127.0.0.1" && !ip.startsWith("192.168") && !ip.startsWith("10.")) {
      const apis = [
        { url: `https://ip-api.com/json/${ip}?fields=countryCode`, key: "countryCode" },
        { url: `https://ipapi.co/${ip}/json/`, key: "country_code" },
        { url: `https://ipwho.is/${ip}`, key: "country_code" },
      ];

      for (const api of apis) {
        try {
          const res = await fetch(api.url, {
            headers: { "User-Agent": "AuraLearn/1.0" },
            signal: AbortSignal.timeout(4000),
          });
          if (!res.ok) continue;
          const data = await res.json();
          const code = data[api.key];
          console.log("[detect-country] API result:", api.url, "→", code);
          if (code && typeof code === "string" && /^[A-Z]{2}$/i.test(code.trim())) {
            return NextResponse.json({ country: code.toUpperCase().trim() });
          }
        } catch (e) {
          console.log("[detect-country] API failed:", api.url);
        }
      }
    } else {
      console.log("[detect-country] Local/private IP, skipping API calls");
    }

    // Fallback: Accept-Language
    const acceptLang = req.headers.get("accept-language") || "";
    if (acceptLang.startsWith("mn")) return NextResponse.json({ country: "MN" });
    if (acceptLang.startsWith("ja")) return NextResponse.json({ country: "JP" });
    if (acceptLang.startsWith("ko")) return NextResponse.json({ country: "KR" });
    if (acceptLang.startsWith("zh")) return NextResponse.json({ country: "CN" });

    return NextResponse.json({ country: "UNKNOWN" });
  } catch (e) {
    console.error("[detect-country] Error:", e);
    return NextResponse.json({ country: "UNKNOWN" });
  }
}
