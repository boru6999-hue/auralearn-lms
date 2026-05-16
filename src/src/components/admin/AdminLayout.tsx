"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import React from "react";

const NAV = [
  { href: "/admin",           icon: "fa-gauge",          key: "dashboard" },
  { href: "/admin/users",     icon: "fa-users",          key: "users" },
  { href: "/admin/courses",   icon: "fa-graduation-cap", key: "courses" },
  { href: "/admin/payments",  icon: "fa-credit-card",    key: "payments" },
  { href: "/admin/live",      icon: "fa-circle-dot",     key: "live", live: true },
  { href: "/admin/analytics", icon: "fa-chart-line",     key: "analytics" },
  { href: "/admin/settings",  icon: "fa-gear",           key: "settings" },
];

const NAV_LABELS: Record<string, Record<string, string>> = {
  dashboard: { mn:"Хяналтын самбар", en:"Dashboard",    ja:"ダッシュボード", ko:"대시보드",     fr:"Tableau de bord", de:"Dashboard",    zh:"仪表盘" },
  users:     { mn:"Хэрэглэгчид",     en:"Users",        ja:"ユーザー",       ko:"사용자",       fr:"Utilisateurs",    de:"Benutzer",     zh:"用户"   },
  courses:   { mn:"Сургалтууд",      en:"Courses",      ja:"コース",         ko:"강의",         fr:"Cours",           de:"Kurse",        zh:"课程"   },
  payments:  { mn:"Төлбөр",          en:"Payments",     ja:"支払い",         ko:"결제",         fr:"Paiements",       de:"Zahlungen",    zh:"支付"   },
  live:      { mn:"Шууд дамжуулалт", en:"Live Stream",  ja:"ライブ配信",     ko:"라이브",       fr:"En direct",       de:"Live-Stream",  zh:"直播"   },
  analytics: { mn:"Аналитик",        en:"Analytics",    ja:"分析",           ko:"분석",         fr:"Analytique",      de:"Analytik",     zh:"分析"   },
  settings:  { mn:"Тохиргоо",        en:"Settings",     ja:"設定",           ko:"설정",         fr:"Paramètres",      de:"Einstellungen",zh:"设定"  },
};

const BG     = "#0a0a0a";
const SIDEBAR = "#111";
const BORDER  = "#1e1e1e";
const TEXT    = "#fff";
const MUTED   = "#555";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const [collapsed, setCollapsed] = useState(false);

  function t(key: string) { return NAV_LABELS[key]?.[lang] || NAV_LABELS[key]?.en || key; }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:BG, fontFamily:"'Inter',-apple-system,sans-serif", color:TEXT }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Sidebar */}
      <div style={{ width:collapsed?"60px":"220px", minHeight:"100vh", background:SIDEBAR, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", transition:"width 0.2s ease", flexShrink:0, position:"sticky", top:0, height:"100vh" }}>

        {/* Logo */}
        <div style={{ padding:collapsed?"20px 16px":"20px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between" }}>
          {!collapsed && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <svg width="20" height="20" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="21" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
                <circle cx="22" cy="22" r="11" fill="#fff"/>
                <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill="#000"/>
              </svg>
              <span style={{ fontSize:"12px", fontWeight:800, color:"#888", letterSpacing:"0.1em", textTransform:"uppercase" }}>Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", padding:"4px", fontSize:"11px" }}>
            <i className={`fa-solid ${collapsed?"fa-chevron-right":"fa-chevron-left"}`} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 6px", display:"flex", flexDirection:"column", gap:"2px" }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display:"flex", alignItems:"center", gap:"10px",
                padding:collapsed?"10px":"8px 12px",
                borderRadius:"7px", textDecoration:"none",
                background:active?"rgba(255,255,255,0.07)":"transparent",
                border:`1px solid ${active?"rgba(255,255,255,0.12)":"transparent"}`,
                color:active?"#fff":MUTED,
                fontSize:"13px", fontWeight:active?600:400,
                transition:"all 0.15s",
                justifyContent:collapsed?"center":"flex-start",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background="#1a1a1a"; e.currentTarget.style.color="#aaa"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=MUTED; }}}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize:"13px", width:"14px", color:(item as any).live?"#ef4444":active?"#fff":MUTED, flexShrink:0 }} />
                {!collapsed && <span>{t(item.key)}</span>}
                {!collapsed && (item as any).live && <span style={{ marginLeft:"auto", width:"6px", height:"6px", borderRadius:"50%", background:"#ef4444", animation:"pulse 1.5s infinite" }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto" }}>{children}</div>
    </div>
  );
}
