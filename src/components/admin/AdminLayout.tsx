"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();

  const t = (mn: string, en: string) => lang === "mn" ? mn : en;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") router.push("/");
  }, [status, session]);

  if (!mounted) return null;

  const BG    = isDark ? "#0a0a0f" : "#F2F0EB";
  const TEXT  = isDark ? "#fff" : "#1a1a1a";
  const MUTED = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const RULE  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const ACTIVE_BG = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  const NAV = [
    { href: "/admin",            label: t("Хяналт","Overview"),    icon: "fa-chart-line" },
    { href: "/admin/users",      label: t("Хэрэглэгч","Users"),    icon: "fa-users" },
    { href: "/admin/courses",    label: t("Сургалт","Courses"),     icon: "fa-graduation-cap" },
    { href: "/admin/payments",   label: t("Төлбөр","Payments"),     icon: "fa-credit-card" },
    { href: "/admin/live",       label: t("Шууд","Live Studio"),    icon: "fa-tower-broadcast" },
    { href: "/admin/analytics",  label: t("Аналитик","Analytics"),  icon: "fa-chart-bar" },
    { href: "/admin/settings",   label: t("Тохиргоо","Settings"),   icon: "fa-gear" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: "220px", flexShrink: 0, borderRight: `1px solid ${RULE}`, padding: "32px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 24px 28px", borderBottom: `1px solid ${RULE}`, marginBottom: "16px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, marginBottom: "4px" }}>AuraLearn</div>
          <div style={{ fontSize: "13px", fontWeight: 300, color: TEXT, letterSpacing: "-0.2px" }}>Admin panel</div>
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {NAV.map(item => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "6px", textDecoration: "none", marginBottom: "2px", background: isActive ? ACTIVE_BG : "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = ACTIVE_BG; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: "12px", color: isActive ? TEXT : MUTED, width: "14px" }} />
                <span style={{ fontSize: "13px", color: isActive ? TEXT : MUTED, fontWeight: isActive ? 400 : 300 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${RULE}` }}>
          <Link href="/" style={{ fontSize: "11px", color: MUTED, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: "10px" }} />
            {t("Сайт руу буцах", "Back to site")}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
