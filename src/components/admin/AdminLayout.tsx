"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import React from "react";

const NAV = [
  { href:"/admin",           icon:"fa-gauge",          key:"dashboard" },
  { href:"/admin/users",     icon:"fa-users",          key:"users"     },
  { href:"/admin/courses",   icon:"fa-graduation-cap", key:"courses"   },
  { href:"/admin/payments",  icon:"fa-credit-card",    key:"payments"  },
  { href:"/admin/live",      icon:"fa-circle-dot",     key:"live", live:true },
  { href:"/admin/analytics", icon:"fa-chart-line",     key:"analytics" },
  { href:"/admin/settings",  icon:"fa-gear",           key:"settings"  },
];

const LABELS: Record<string,Record<string,string>> = {
  dashboard:{ mn:"Хяналтын самбар", en:"Dashboard",    ja:"ダッシュボード", ko:"대시보드",   fr:"Tableau de bord", de:"Dashboard",    zh:"仪表盘" },
  users:    { mn:"Хэрэглэгчид",     en:"Users",        ja:"ユーザー",       ko:"사용자",     fr:"Utilisateurs",    de:"Benutzer",     zh:"用户"   },
  courses:  { mn:"Сургалтууд",      en:"Courses",      ja:"コース",         ko:"강의",       fr:"Cours",           de:"Kurse",        zh:"课程"   },
  payments: { mn:"Төлбөр",          en:"Payments",     ja:"支払い",         ko:"결제",       fr:"Paiements",       de:"Zahlungen",    zh:"支付"   },
  live:     { mn:"Шууд дамжуулалт", en:"Live Stream",  ja:"ライブ配信",     ko:"라이브",     fr:"En direct",       de:"Live-Stream",  zh:"直播"   },
  analytics:{ mn:"Аналитик",        en:"Analytics",    ja:"分析",           ko:"분석",       fr:"Analytique",      de:"Analytik",     zh:"分析"   },
  settings: { mn:"Тохиргоо",        en:"Settings",     ja:"設定",           ko:"설정",       fr:"Paramètres",      de:"Einstellungen",zh:"设定"   },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const BG      = isDark ? "#0a0a0a" : "#f5f5f5";
  const SIDEBAR = isDark ? "#111"    : "#fff";
  const BORDER  = isDark ? "#1e1e1e" : "#e5e5e5";
  const TEXT    = isDark ? "#fff"    : "#000";
  const MUTED   = isDark ? "#666"    : "#888";
  const HOVER   = isDark ? "#1a1a1a" : "#f0f0f0";
  const ACTIVE_BG   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const ACTIVE_BORDER = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  function label(key: string) { return LABELS[key]?.[lang] || LABELS[key]?.en || key; }

  if (!mounted) return <div style={{ display:"flex", minHeight:"100vh", background:"#000" }}>{children}</div>;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:BG, fontFamily:"'Inter',-apple-system,sans-serif", color:TEXT }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Sidebar */}
      <div style={{ width:collapsed?"60px":"220px", minHeight:"100vh", background:SIDEBAR, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", transition:"width 0.2s", flexShrink:0, position:"sticky", top:0, height:"100vh" }}>

        {/* Logo */}
        <div style={{ padding:collapsed?"18px 16px":"18px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between" }}>
          {!collapsed && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <svg width="20" height="20" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="21" stroke={MUTED} strokeWidth="0.8"/>
                <circle cx="22" cy="22" r="11" fill={TEXT}/>
                <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill={isDark?"#000":"#fff"}/>
              </svg>
              <span style={{ fontSize:"12px", fontWeight:800, color:MUTED, letterSpacing:"0.1em", textTransform:"uppercase" }}>Admin</span>
            </div>
          )}
          <button onClick={()=>setCollapsed(!collapsed)} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", padding:"4px", fontSize:"11px" }}>
            <i className={`fa-solid ${collapsed?"fa-chevron-right":"fa-chevron-left"}`} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 6px", display:"flex", flexDirection:"column", gap:"2px" }}>
          {NAV.map(item => {
            const active = pathname===item.href || (item.href!=="/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display:"flex", alignItems:"center", gap:"10px",
                padding:collapsed?"10px":"8px 12px", borderRadius:"8px",
                textDecoration:"none",
                background:active?ACTIVE_BG:"transparent",
                border:`1px solid ${active?ACTIVE_BORDER:"transparent"}`,
                color:active?TEXT:MUTED,
                fontSize:"13px", fontWeight:active?600:400,
                transition:"all 0.15s",
                justifyContent:collapsed?"center":"flex-start",
              }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background=HOVER;e.currentTarget.style.color=TEXT;}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=MUTED;}}}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize:"13px", width:"14px", color:(item as any).live?"#ef4444":active?TEXT:MUTED, flexShrink:0 }} />
                {!collapsed && <span>{label(item.key)}</span>}
                {!collapsed && (item as any).live && <span style={{ marginLeft:"auto", width:"6px", height:"6px", borderRadius:"50%", background:"#ef4444", animation:"pulse 1.5s infinite" }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto", background:BG }}>{children}</div>
    </div>
  );
}
