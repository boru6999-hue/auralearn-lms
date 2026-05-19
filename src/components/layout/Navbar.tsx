"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenu] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const t = (mn: string, en: string, ja = "", ko = "", fr = "", de = "", zh = "") =>
    lang === "mn" ? mn : lang === "ja" ? (ja || en) : lang === "ko" ? (ko || en) : lang === "fr" ? (fr || en) : lang === "de" ? (de || en) : lang === "zh" ? (zh || en) : en;

  const LANGS = [
    { code: "mn", flag: "🇲🇳", label: "Монгол" },
    { code: "en", flag: "🇺🇸", label: "English" },
    { code: "ja", flag: "🇯🇵", label: "日本語" },
    { code: "ko", flag: "🇰🇷", label: "한국어" },
    { code: "fr", flag: "🇫🇷", label: "Français" },
    { code: "de", flag: "🇩🇪", label: "Deutsch" },
    { code: "zh", flag: "🇨🇳", label: "中文" },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setMenu(false); }, [pathname]);

  if (!mounted) return <div style={{ height: "64px" }} />;

  const isAdmin = (session?.user as any)?.role === "admin";
  const BG = isDark ? "rgba(10,10,15,0.92)" : "rgba(242,240,235,0.92)";
  const PILL = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)";
  const PILLB = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const TEXT = isDark ? "#fff" : "#1a1a1a";
  const MUTED = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const ACTIVE_BG = isDark ? "rgba(255,255,255,0.1)" : "#fff";
  const ACTIVE_BORDER = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const DROP = isDark ? "#111" : "#fff";
  const DROP_BORDER = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const HOVER_BG = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const LINKS = [
    { href: "/courses", label: t("Сургалт", "Courses", "コース", "강의", "Cours", "Kurse", "课程") },
    { href: "/courses/live", label: t("Шууд", "Live", "ライブ", "라이브", "Direct", "Live", "直播") },
    { href: "/courses/certificate", label: t("Гэрчилгээ", "Certificate", "証明書", "수료증", "Certificat", "Zertifikat", "证书") },
    ...(session ? [{ href: "/dashboard", label: t("Хяналт", "Dashboard", "ダッシュ", "대시보드", "Tableau", "Dashboard", "仪表盘") }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", gold: true }] : []),
  ];

  const currentLang = LANGS.find(l => l.code === lang);

  return (
    <>
      <nav style={{ position: "sticky", top: 0, zIndex: 200, display: "flex", justifyContent: "center", padding: "14px 24px", background: BG, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "2px", background: PILL, border: `1px solid ${PILLB}`, borderRadius: "100px", padding: "5px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "6px 14px 6px 8px", borderRadius: "100px", background: isDark ? "rgba(255,255,255,0.08)" : "#fff", border: `1px solid ${ACTIVE_BORDER}`, textDecoration: "none", marginRight: "4px", flexShrink: 0 }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: isDark ? "#000" : "#fff", flexShrink: 0 }}>A</div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>AuraLearn</span>
          </Link>

          {/* Desktop links */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {LINKS.map(link => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} style={{ padding: "7px 14px", borderRadius: "100px", fontSize: "12px", color: (link as any).gold ? "rgba(201,162,39,0.8)" : isActive ? TEXT : MUTED, background: (link as any).gold ? "rgba(201,162,39,0.08)" : isActive ? ACTIVE_BG : "transparent", border: `1px solid ${(link as any).gold ? "rgba(201,162,39,0.15)" : isActive ? ACTIVE_BORDER : "transparent"}`, textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.15s", letterSpacing: "0.01em" }}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "18px", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", margin: "0 4px", flexShrink: 0 }} />

          {/* Lang */}
          <div ref={langRef} style={{ position: "relative" }}>
            <button onClick={() => setLangOpen(!langOpen)} style={{ padding: "7px 10px", borderRadius: "100px", fontSize: "11px", color: MUTED, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "4px" }}>
              {currentLang?.flag} {lang.toUpperCase()}
            </button>
            {langOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: DROP, border: `1px solid ${DROP_BORDER}`, borderRadius: "12px", padding: "6px", minWidth: "140px", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.1)", zIndex: 300 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => {
                    localStorage.setItem("aura_lang", l.code);
                    document.cookie = `aura_lang=${l.code};path=/;max-age=31536000`;
                    window.dispatchEvent(new CustomEvent("langChange", { detail: l.code }));
                    setLangOpen(false);
                  }} style={{ width: "100%", background: lang === l.code ? HOVER_BG : "transparent", border: "none", color: TEXT, padding: "7px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", textAlign: "left", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{l.flag}</span><span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme */}
          <button onClick={() => {
            const newTheme = isDark ? "light" : "dark";
            localStorage.setItem("aura_theme", newTheme);
            document.cookie = `aura_theme=${newTheme};path=/;max-age=31536000`;
            document.documentElement.setAttribute("data-theme", newTheme);
            window.dispatchEvent(new CustomEvent("themeChange", { detail: newTheme }));
          }} style={{ width: "30px", height: "30px", borderRadius: "50%", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "rgba(255,255,255,0.05)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: MUTED, flexShrink: 0 }}>
            <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`} style={{ fontSize: "12px" }} />
          </button>

          {/* User / Sign in */}
          {session ? (
            <div ref={userRef} style={{ position: "relative" }}>
              <button onClick={() => setUserOpen(!userOpen)} style={{ width: "30px", height: "30px", borderRadius: "50%", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "rgba(255,255,255,0.08)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0 }}>
                {session.user?.image && session.user.image.length < 500
                  ? <img src={session.user.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : <span style={{ fontSize: "11px", fontWeight: 600, color: TEXT }}>{(session.user?.name || "?")[0].toUpperCase()}</span>
                }
              </button>
              {userOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: DROP, border: `1px solid ${DROP_BORDER}`, borderRadius: "12px", padding: "6px", minWidth: "180px", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.1)", zIndex: 300 }}>
                  <div style={{ padding: "8px 12px 10px", borderBottom: `1px solid ${DROP_BORDER}`, marginBottom: "4px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT }}>{session.user?.name}</div>
                    <div style={{ fontSize: "11px", color: MUTED, marginTop: "1px" }}>{session.user?.email}</div>
                  </div>
                  {[
                    { href: "/profile", label: t("Профайл", "Profile", "プロフィール", "프로필", "Profil", "Profil", "个人资料") },
                    { href: "/payment", label: t("Захиалга", "Subscribe", "登録", "구독", "S'abonner", "Abonnieren", "订阅") },
                  ].map(l => (
                    <Link key={l.href} href={l.href} style={{ display: "block", padding: "8px 12px", borderRadius: "8px", textDecoration: "none", color: TEXT, fontSize: "13px" }}
                      onMouseEnter={e => e.currentTarget.style.background = HOVER_BG}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {l.label}
                    </Link>
                  ))}
                  <button onClick={() => signOut({ callbackUrl: "/" })} style={{ width: "100%", background: "none", border: "none", color: "#f87171", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textAlign: "left", marginTop: "2px", borderTop: `1px solid ${DROP_BORDER}` }}>
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: "6px", fontSize: "11px" }} />
                    {t("Гарах", "Sign out", "ログアウト", "로그아웃", "Déconnexion", "Abmelden", "退出")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" style={{ padding: "7px 16px", borderRadius: "100px", background: TEXT, color: isDark ? "#000" : "#fff", fontSize: "12px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
              {t("Нэвтрэх", "Sign in", "ログイン", "로그인", "Connexion", "Anmelden", "登录")}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenu(!menuOpen)} className="mobile-menu-btn" style={{ width: "30px", height: "30px", borderRadius: "50%", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "none", display: "none", alignItems: "center", justifyContent: "center", cursor: "pointer", color: MUTED, flexShrink: 0 }}>
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} style={{ fontSize: "12px" }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: "64px", left: 0, right: 0, bottom: 0, background: isDark ? "#0a0a0f" : "#F2F0EB", zIndex: 199, overflowY: "auto", padding: "24px" }}>
          {LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{ display: "block", padding: "16px 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, textDecoration: "none", fontSize: "16px", fontWeight: 300, color: (link as any).gold ? "#C9A227" : TEXT, letterSpacing: "-0.3px" }}>
              {link.label}
            </Link>
          ))}
          {!session && (
            <Link href="/auth/login" style={{ display: "block", marginTop: "24px", padding: "14px", background: TEXT, color: isDark ? "#000" : "#fff", textDecoration: "none", fontSize: "14px", fontWeight: 600, textAlign: "center", borderRadius: "100px" }}>
              {t("Нэвтрэх", "Sign in")}
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .mobile-menu-btn{display:flex!important;}
        }
      `}</style>
    </>
  );
}
