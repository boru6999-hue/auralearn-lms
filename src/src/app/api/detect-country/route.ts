import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Get IP from request headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "";

    // Try server-side IP detection (no CORS issues)
    const apis = [
      `https://ip-api.com/json/${ip}?fields=countryCode`,
      `https://ipapi.co/${ip}/country/`,
      `https://ipwho.is/${ip}`,
    ];

    for (const url of apis) {
      try {
        const res = await fetch(url, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) continue;

        const contentType = res.headers.get("content-type") || "";
        let code = "";

        if (contentType.includes("json")) {
          const data = await res.json();
          code = data.countryCode || data.country_code || "";
        } else {
          code = (await res.text()).trim();
        }

        if (code && /^[A-Z]{2}$/i.test(code)) {
          return NextResponse.json({ country: code.toUpperCase() });
        }
      } catch {}
    }

    // Fallback: check Accept-Language header
    const acceptLang = req.headers.get("accept-language") || "";
    if (acceptLang.includes("mn")) return NextResponse.json({ country: "MN" });
    if (acceptLang.includes("ja")) return NextResponse.json({ country: "JP" });
    if (acceptLang.includes("ko")) return NextResponse.json({ country: "KR" });
    if (acceptLang.includes("zh")) return NextResponse.json({ country: "CN" });

    return NextResponse.json({ country: "US" });
  } catch {
    return NextResponse.json({ country: "US" });
  }
}
