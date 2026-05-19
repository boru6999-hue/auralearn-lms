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
  const [userOpen, setUser] = useState(false);
  const [langOpen, setLang] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const t = (mn: string, en: string, ja = "", ko = "", fr = "", de = "", zh = "") =>
    lang === "mn" ? mn : lang === "ja" ? (ja || en) : lang === "ko" ? (ko || en) :
    lang === "fr" ? (fr || en) : lang === "de" ? (de || en) : lang === "zh" ? (zh || en) : en;

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
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUser(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLang(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setMenu(false); setUser(false); setLang(false); }, [pathname]);

  if (!mounted) return <div style={{ height: "60px" }} />;

  const isAdmin = (session?.user as any)?.role === "admin";

  // Colors
  const BG     = isDark ? "rgba(10,10,15,0.9)"   : "rgba(242,240,235,0.9)";
  const PILL   = isDark ? "rgba(255,255,255,0.06)": "rgba(255,255,255,0.75)";
  const PILLB  = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const TEXT   = isDark ? "#fff"                  : "#1a1a1a";
  const MUTED  = isDark ? "rgba(255,255,255,0.38)": "rgba(0,0,0,0.38)";
  const ACTIVE_BG = isDark ? "rgba(255,255,255,0.1)" : "#fff";
  const ACTIVE_BR = isDark ? "rgba(255,255,255,0.12)": "rgba(0,0,0,0.1)";
  const DROP   = isDark ? "#111" : "#fff";
  const DROPB  = isDark ? "rgba(255,255,255,0.07)": "rgba(0,0,0,0.07)";
  const DHOVER = isDark ? "rgba(255,255,255,0.05)": "rgba(0,0,0,0.04)";

  const LINKS = [
    { href: "/courses",             label: t("Сургалт","Courses","コース","강의","Cours","Kurse","课程") },
    { href: "/courses/live",        label: t("Шууд","Live","ライブ","라이브","Direct","Live","直播") },
    { href: "/courses/certificate", label: t("Гэрчилгээ","Certificate","証明書","수료증","Certificat","Zertifikat","证书") },
    ...(session ? [{ href: "/dashboard", label: t("Хяналт","Dashboard","ダッシュ","대시보드","Tableau","Dashboard","仪表盘") }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", gold: true }] : []),
  ];

  const curLang = LANGS.find(l => l.code === lang);

  function changeLang(code: string) {
    localStorage.setItem("aura_lang", code);
    document.cookie = `aura_lang=${code};path=/;max-age=31536000`;
    window.dispatchEvent(new CustomEvent("langChange", { detail: code }));
    setLang(false);
  }

  function changeTheme() {
    const next = isDark ? "light" : "dark";
    localStorage.setItem("aura_theme", next);
    document.cookie = `aura_theme=${next};path=/;max-age=31536000`;
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new CustomEvent("themeChange", { detail: next }));
  }

  const isActive = (href: string) =>
    href === "/courses" ? pathname === "/courses" :
    href === "/admin"   ? pathname.startsWith("/admin") :
    pathname.startsWith(href);

  return (
    <>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", justifyContent: "center",
        padding: "12px 20px",
        background: BG,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}`,
      }}>
        {/* Pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "2px",
          background: PILL, border: `1px solid ${PILLB}`,
          borderRadius: "100px", padding: "4px",
          maxWidth: "calc(100vw - 40px)", overflowX: "auto",
        }}>

          {/* Logo */}
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "5px 13px 5px 7px", borderRadius: "100px",
            background: isDark ? "rgba(255,255,255,0.08)" : "#fff",
            border: `1px solid ${ACTIVE_BR}`,
            textDecoration: "none", marginRight: "3px", flexShrink: 0,
          }}>
            <div style={{
              width: "22px", height: "22px", borderRadius: "50%",
              background: TEXT, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "9px", fontWeight: 700,
              color: isDark ? "#000" : "#fff", flexShrink: 0,
            }}>A</div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: TEXT, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
              AuraLearn
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1px" }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: "6px 12px", borderRadius: "100px", fontSize: "12px",
                color: (l as any).gold ? "rgba(181,134,58,0.85)" : isActive(l.href) ? TEXT : MUTED,
                background: (l as any).gold ? "rgba(181,134,58,0.08)" : isActive(l.href) ? ACTIVE_BG : "transparent",
                border: `1px solid ${(l as any).gold ? "rgba(181,134,58,0.18)" : isActive(l.href) ? ACTIVE_BR : "transparent"}`,
                textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.15s",
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="nav-links" style={{ width: "1px", height: "16px", background: PILLB, margin: "0 3px", flexShrink: 0 }} />

          {/* Lang */}
          <div ref={langRef} style={{ position: "relative" }}>
            <button onClick={() => setLang(!langOpen)} style={{
              padding: "6px 9px", borderRadius: "100px", fontSize: "11px",
              color: MUTED, background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}>
              {curLang?.flag}
              <i className="fa-solid fa-chevron-down" style={{ fontSize: "8px" }} />
            </button>
            {langOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                background: DROP, border: `1px solid ${DROPB}`,
                borderRadius: "12px", padding: "5px", minWidth: "140px",
                boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.1)",
                zIndex: 9999, maxHeight: "320px", overflowY: "auto",
              }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => changeLang(l.code)} style={{
                    width: "100%", background: lang === l.code ? DHOVER : "transparent",
                    border: "none", color: TEXT, padding: "7px 11px", borderRadius: "8px",
                    cursor: "pointer", fontSize: "12px", textAlign: "left",
                    display: "flex", alignItems: "center", gap: "8px", fontFamily: "inherit",
                  }}>
                    <span>{l.flag}</span><span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme */}
          <button onClick={changeTheme} style={{
            width: "28px", height: "28px", borderRadius: "50%",
            border: `1px solid ${PILLB}`, background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: MUTED, flexShrink: 0,
          }}>
            <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`} style={{ fontSize: "11px" }} />
          </button>

          {/* User / Sign in */}
          {session ? (
            <div ref={userRef} style={{ position: "relative" }}>
              <button onClick={() => setUser(!userOpen)} style={{
                width: "28px", height: "28px", borderRadius: "50%",
                border: `1px solid ${ACTIVE_BR}`, background: ACTIVE_BG,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", overflow: "hidden", flexShrink: 0,
              }}>
                {session.user?.image && session.user.image.length < 500
                  ? <img src={session.user.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : <span style={{ fontSize: "10px", fontWeight: 600, color: TEXT }}>
                      {(session.user?.name || "?")[0].toUpperCase()}
                    </span>
                }
              </button>
              {userOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: DROP, border: `1px solid ${DROPB}`,
                  borderRadius: "12px", padding: "5px", minWidth: "180px",
                  boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.1)",
                  zIndex: 9999,
                }}>
                  <div style={{ padding: "8px 11px 10px", borderBottom: `1px solid ${DROPB}`, marginBottom: "3px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.user?.name}
                    </div>
                    <div style={{ fontSize: "11px", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.user?.email}
                    </div>
                  </div>
                  {[
                    { href: "/profile", label: t("Профайл","Profile","プロフィール","프로필","Profil","Profil","个人资料") },
                    { href: "/payment", label: t("Захиалга","Subscribe","登録","구독","S'abonner","Abonnieren","订阅") },
                  ].map(l => (
                    <Link key={l.href} href={l.href} style={{
                      display: "block", padding: "7px 11px", borderRadius: "7px",
                      textDecoration: "none", color: TEXT, fontSize: "12px", fontWeight: 300,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = DHOVER}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {l.label}
                    </Link>
                  ))}
                  <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                    width: "100%", background: "none", border: "none",
                    color: "#ef4444", padding: "7px 11px", borderRadius: "7px",
                    cursor: "pointer", fontSize: "12px", textAlign: "left",
                    marginTop: "2px", borderTop: `1px solid ${DROPB}`,
                    fontFamily: "inherit", fontWeight: 300,
                  }}>
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: "6px", fontSize: "10px" }} />
                    {t("Гарах","Sign out","ログアウト","로그아웃","Déconnexion","Abmelden","退出")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" style={{
              padding: "6px 14px", borderRadius: "100px",
              background: TEXT, color: isDark ? "#000" : "#fff",
              fontSize: "12px", fontWeight: 500, textDecoration: "none",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {t("Нэвтрэх","Sign in","ログイン","로그인","Connexion","Anmelden","登录")}
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setMenu(!menuOpen)} className="nav-burger" style={{
            width: "28px", height: "28px", borderRadius: "50%",
            border: `1px solid ${PILLB}`, background: "transparent",
            display: "none", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: MUTED, flexShrink: 0,
          }}>
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} style={{ fontSize: "11px" }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: "60px", left: 0, right: 0, bottom: 0,
          background: isDark ? "#0a0a0f" : "#F2F0EB", zIndex: 199,
          overflowY: "auto", padding: "24px",
          fontFamily: "'Inter',-apple-system,sans-serif",
        }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "18px 0",
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              textDecoration: "none", fontSize: "17px", fontWeight: 300,
              color: (l as any).gold ? "#B5863A" : TEXT, letterSpacing: "-0.3px",
            }}>
              {l.label}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: "12px", color: MUTED }} />
            </Link>
          ))}
          {session && (
            <>
              {[
                { href: "/profile", label: t("Профайл","Profile") },
                { href: "/payment", label: t("Захиалга","Subscribe") },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "18px 0",
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                  textDecoration: "none", fontSize: "17px", fontWeight: 300, color: MUTED,
                }}>
                  {l.label}
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "12px", color: MUTED }} />
                </Link>
              ))}
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                width: "100%", background: "none", border: "none",
                color: "#ef4444", padding: "18px 0", fontSize: "17px", fontWeight: 300,
                textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              }}>
                {t("Гарах","Sign out")}
              </button>
            </>
          )}
          {!session && (
            <Link href="/auth/login" style={{
              display: "block", marginTop: "24px", padding: "14px",
              background: TEXT, color: isDark ? "#000" : "#fff",
              textDecoration: "none", fontSize: "14px", fontWeight: 500,
              textAlign: "center", borderRadius: "100px",
            }}>
              {t("Нэвтрэх","Sign in")}
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:680px){
          .nav-links{display:none!important;}
          .nav-burger{display:flex!important;}
        }
      `}</style>
    </>
  );
}
