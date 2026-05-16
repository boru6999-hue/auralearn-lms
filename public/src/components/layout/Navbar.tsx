"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";

const LANGUAGES = [
  { code: "mn", label: "Монгол", flag: "🇲🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const T: Record<string, Record<string, string>> = {
  mn: { courses: "Сургалтууд", dashboard: "Хяналтын самбар", profile: "Профайл", login: "Нэвтрэх", register: "Бүртгүүлэх", logout: "Гарах" },
  en: { courses: "Courses", dashboard: "Dashboard", profile: "Profile", login: "Sign In", register: "Sign Up", logout: "Sign Out" },
  ja: { courses: "コース", dashboard: "ダッシュボード", profile: "プロフィール", login: "ログイン", register: "登録", logout: "ログアウト" },
  ko: { courses: "강의", dashboard: "대시보드", profile: "프로필", login: "로그인", register: "회원가입", logout: "로그아웃" },
  fr: { courses: "Cours", dashboard: "Tableau de bord", profile: "Profil", login: "Connexion", register: "S'inscrire", logout: "Déconnexion" },
  de: { courses: "Kurse", dashboard: "Dashboard", profile: "Profil", login: "Anmelden", register: "Registrieren", logout: "Abmelden" },
  zh: { courses: "课程", dashboard: "仪表盘", profile: "个人资料", login: "登录", register: "注册", logout: "退出" },
};

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const { currency, country } = useCurrency();
  const [lang, setLang] = useState("mn");
  const [isDark, setIsDark] = useState(true);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("aura_lang") || "mn";
    setLang(savedLang);
    const savedTheme = localStorage.getItem("aura_theme") || "dark";
    setIsDark(savedTheme === "dark");
    document.cookie = `aura_theme=${savedTheme};path=/;max-age=31536000`;
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${savedTheme}`);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("aura_theme", next);
    document.cookie = `aura_theme=${next};path=/;max-age=31536000`;
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${next}`);
    // Бүх хуудасны useTheme hook-д дуулгана
    window.dispatchEvent(new CustomEvent("themeChange", { detail: next }));
  }

  function changeLang(code: string) {
    localStorage.setItem("aura_lang", code);
    document.cookie = `aura_lang=${code};path=/;max-age=31536000`;
    setLang(code);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("langChange", { detail: code }));
  }

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const t = T[lang] || T["mn"];

  const linkStyle = {
    color: isDark ? "#888" : "#111", fontSize: "14px", fontWeight: 500,
    textDecoration: "none", transition: "color 0.15s",
  } as const;

  return (
    <nav style={{
      background: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.97)",
      borderBottom: isDark ? "1px solid #1a1a1a" : "1px solid #e5e5e5",
      backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="21" stroke={isDark ? "#555" : "#999"} strokeWidth="0.8"/>
            <circle cx="22" cy="22" r="16" stroke={isDark ? "#777" : "#bbb"} strokeWidth="1"/>
            <circle cx="22" cy="22" r="11" fill={isDark ? "#fff" : "#000"}/>
            <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill={isDark ? "#000" : "#fff"}/>
          </svg>
          <span style={{ fontSize: "18px", fontWeight: 800, color: isDark ? "#fff" : "#000", letterSpacing: "-0.5px" }}>
            Aura<span style={{ color: isDark ? "#666" : "#999" }}>Learn</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Courses dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => setCoursesOpen(false)}>
            <Link href="/courses" style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "4px" }}
              onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#fff" : "#000")}
              onMouseLeave={e => (e.currentTarget.style.color = isDark ? "#888" : "#111")}>
              {t.courses}
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
                style={{ transform: coursesOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s", marginTop: "1px" }}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
            {coursesOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0,
                background: isDark ? "#111" : "#fff",
                border: `1px solid ${isDark ? "#2a2a2a" : "#e0e0e0"}`,
                borderRadius: "10px", padding: "6px", minWidth: "180px",
                zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}>
                {[
                  { href: "/courses", icon: "fa-th-large", label: lang === "mn" ? "Бүгд" : lang === "ja" ? "すべて" : lang === "ko" ? "전체" : lang === "fr" ? "Tous" : lang === "de" ? "Alle" : lang === "zh" ? "全部" : "All Courses" },
                  { href: "/courses?tab=language", icon: "fa-language", label: lang === "mn" ? "Хэл" : lang === "ja" ? "言語" : lang === "ko" ? "언어" : lang === "fr" ? "Langues" : lang === "de" ? "Sprachen" : lang === "zh" ? "语言" : "Language" },
                  { href: "/courses?tab=development", icon: "fa-code", label: lang === "mn" ? "Хөгжүүлэлт" : lang === "ja" ? "開発" : lang === "ko" ? "개발" : lang === "fr" ? "Développement" : lang === "de" ? "Entwicklung" : lang === "zh" ? "开发" : "Development" },
                  { href: "/courses?tab=live", icon: "fa-circle", label: lang === "mn" ? "Шууд" : lang === "ja" ? "ライブ" : lang === "ko" ? "라이브" : lang === "fr" ? "En direct" : lang === "de" ? "Live" : lang === "zh" ? "直播" : "Live", live: true },
                  { href: "/courses?tab=certificate", icon: "fa-certificate", label: lang === "mn" ? "Гэрчилгээ" : lang === "ja" ? "修了証" : lang === "ko" ? "수료증" : lang === "fr" ? "Certificat" : lang === "de" ? "Zertifikat" : lang === "zh" ? "证书" : "Certificate" },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 12px", borderRadius: "7px", textDecoration: "none",
                    color: isDark ? "#aaa" : "#444", fontSize: "13px", fontWeight: 500,
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? "#1a1a1a" : "#f5f5f5"; e.currentTarget.style.color = isDark ? "#fff" : "#000"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isDark ? "#aaa" : "#444"; }}>
                    <i className={`fa-solid ${item.icon}`} style={{ fontSize: "12px", width: "14px", color: (item as any).live ? "#ef4444" : "inherit" }} />
                    <span>{item.label}</span>
                    {(item as any).live && <span style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/payment" style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#fff" : "#000")}
            onMouseLeave={e => (e.currentTarget.style.color = isDark ? "#888" : "#111")}>
            {lang === "mn" ? "Үнэ" : lang === "ja" ? "料金" : lang === "ko" ? "요금" : lang === "zh" ? "定价" : lang === "fr" ? "Tarifs" : lang === "de" ? "Preise" : "Pricing"}
          </Link>

          {/* Currency indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: isDark ? "#555" : "#999", padding: "4px 8px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius: "6px", border: `1px solid ${isDark ? "#2a2a2a" : "#e0e0e0"}` }}>
            <span>{currency.symbol}</span>
            <span style={{ fontWeight: 600 }}>{currency.code}</span>
          </div>

          {/* Dark/Light toggle */}
          <button onClick={toggleTheme} style={{
            background: "transparent", border: "1px solid #2a2a2a",
            borderRadius: "6px", width: "34px", height: "28px",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: isDark ? "#666" : "#444", fontSize: "14px",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? "#555" : "#999"; e.currentTarget.style.color = isDark ? "#fff" : "#000"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "#2a2a2a" : "#e0e0e0"; e.currentTarget.style.color = isDark ? "#666" : "#444"; }}>
            <i className={isDark?"fa-solid fa-sun":"fa-solid fa-moon"} style={{fontSize:"13px"}} />
          </button>

          {/* Language switcher */}
          <div ref={dropRef} style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "transparent", border: "1px solid #2a2a2a",
              borderRadius: "6px", padding: "4px 10px",
              color: isDark ? "#666" : "#444", fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? "#555" : "#999"; e.currentTarget.style.color = isDark ? "#fff" : "#000"; }}
            onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = isDark ? "#2a2a2a" : "#e0e0e0"; e.currentTarget.style.color = isDark ? "#666" : "#444"; } }}>
              <span style={{ fontSize: "14px" }}>{current.flag}</span>
              <span>{current.label}</span>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s" }}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {open && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: isDark ? "#111" : "#fff",
                border: isDark ? "1px solid #2a2a2a" : "1px solid #e0e0e0",
                borderRadius: "8px", padding: "4px", minWidth: "160px",
                zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => changeLang(l.code)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "7px 10px", borderRadius: "5px",
                    background: lang === l.code ? (isDark ? "#1a1a1a" : "#f0f0f0") : "transparent",
                    border: "none", color: lang === l.code ? (isDark ? "#fff" : "#000") : (isDark ? "#888" : "#555"),
                    fontSize: "13px", fontWeight: lang === l.code ? 600 : 400,
                    cursor: "pointer", textAlign: "left", transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = isDark ? "#161616" : "#f0f0f0"; }}
                  onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ fontSize: "15px" }}>{l.flag}</span>
                    <span style={{ flex: 1 }}>{l.label}</span>
                    {lang === l.code && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {session ? (
            <>
              <Link href="/dashboard" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#fff" : "#000")}
                onMouseLeave={e => (e.currentTarget.style.color = isDark ? "#888" : "#111")}>
                {t.dashboard}
              </Link>
              <Link href="/profile" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#fff" : "#000")}
                onMouseLeave={e => (e.currentTarget.style.color = isDark ? "#888" : "#111")}>
                {t.profile}
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                background: "transparent", border: `1px solid ${isDark ? "#2a2a2a" : "#e0e0e0"}`,
                color: isDark ? "#666" : "#444", padding: "5px 14px", borderRadius: "6px",
                fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? "#555" : "#999"; e.currentTarget.style.color = isDark ? "#fff" : "#000"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "#2a2a2a" : "#e0e0e0"; e.currentTarget.style.color = isDark ? "#666" : "#444"; }}>
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#666")}>
                {t.login}
              </Link>
              <Link href="/auth/register" style={{
                background: isDark ? "#fff" : "#000",
                color: isDark ? "#000" : "#fff",
                padding: "6px 16px", borderRadius: "6px", fontSize: "13px",
                fontWeight: 600, textDecoration: "none", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
