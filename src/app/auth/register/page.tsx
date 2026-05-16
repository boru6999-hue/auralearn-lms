"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const { isDark, colors, mounted } = useTheme();
  const a = t.auth;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) { router.push("/auth/login"); }
    else { const json = await res.json(); setError(json.error || "Алдаа гарлаа"); setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: "40px", background: colors.inputBg,
    border: `1px solid ${colors.border}`, borderRadius: "8px",
    padding: "0 14px", color: colors.text, fontSize: "14px",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };

  const socialBtn: React.CSSProperties = {
    width: "186px", height: "45px", padding: "0 12px",
    background: isDark ? colors.socialBg : "#fff", border: `1px solid ${isDark ? colors.border : "#e0e0e0"}`,
    borderRadius: "8px", color: isDark ? "#fff" : "#000", fontSize: "13px", fontWeight: 500,
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px", transition: "all 0.15s", whiteSpace: "nowrap" as const,
  };

  const hoverOn = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDark) {
      e.currentTarget.style.background = "#fff";
      e.currentTarget.style.color = "#000";
      e.currentTarget.style.borderColor = "#fff";
      // Google paths: white→black
      e.currentTarget.querySelectorAll("svg path").forEach((p: any) => {
        if (!p.dataset.o) p.dataset.o = p.getAttribute("fill")||"";
        p.setAttribute("fill", "#000");
      });
    } else {
      e.currentTarget.style.background = "#111";
      e.currentTarget.style.color = "#fff";
      e.currentTarget.style.borderColor = "#111";
      // Google/GitHub paths: black→white
      e.currentTarget.querySelectorAll("svg path").forEach((p: any) => {
        if (!p.dataset.o) p.dataset.o = p.getAttribute("fill")||"";
        p.setAttribute("fill", "#fff");
      });
    }
    e.currentTarget.style.transform = "translateY(-1px)";
  };
  const hoverOff = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = colors.socialBg;
    e.currentTarget.style.color = colors.text;
    e.currentTarget.style.borderColor = colors.border;
    e.currentTarget.style.transform = "none";
    e.currentTarget.style.background = isDark ? colors.socialBg : "#fff";
    e.currentTarget.style.color = isDark ? "#fff" : "#000";
    e.currentTarget.style.borderColor = isDark ? colors.border : "#e0e0e0";
    e.currentTarget.querySelectorAll("svg path").forEach((p: any) => {
      if (p.dataset.o !== undefined) { p.setAttribute("fill", p.dataset.o); delete p.dataset.o; }
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      ...(isDark ? { backgroundImage: "url('/auth-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" } : { background: "#f5f5f5" }),
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    }}>
      {isDark && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", pointerEvents: "none", zIndex: 0 }} />}
      <div style={{ position: "fixed", top: "20px", left: "24px", zIndex: 10 }}>
        <Link href="/" style={{ color: colors.text3, textDecoration: "none", fontSize: "13px" }}
          onMouseEnter={e => (e.currentTarget.style.color = colors.text)}
          onMouseLeave={e => (e.currentTarget.style.color = colors.text3)}>← Home</Link>
      </div>

      <div style={{ width: "100%", maxWidth: "380px", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ marginBottom: "20px", display: "inline-block" }}>
            <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21" stroke={isDark ? "#555" : "#999"} strokeWidth="0.8"/>
              <circle cx="22" cy="22" r="16" stroke={isDark ? "#777" : "#bbb"} strokeWidth="1"/>
              <circle cx="22" cy="22" r="11" fill={isDark ? "#fff" : "#000"}/>
              <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill={isDark ? "#000" : "#fff"}/>
            </svg>
          </div>
          <h1 style={{ color: colors.text, fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>{a.register_title}</h1>
          <p style={{ color: colors.text3, fontSize: "14px", margin: 0 }}>
            {a.have_account}{" "}
            <Link href="/auth/login" style={{ color: colors.text, textDecoration: "none", fontWeight: 600 }}>{a.login_link}</Link>
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
          <button style={socialBtn} onClick={() => signIn("google", { callbackUrl: "/dashboard" })} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={isDark?"#fff":"#000"}/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={isDark?"#fff":"#000"}/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill={isDark?"#fff":"#000"}/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={isDark?"#fff":"#000"}/>
            </svg>
            {a.google_reg}
          </button>
          <button style={socialBtn} onClick={() => signIn("github", { callbackUrl: "/dashboard" })} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isDark?"#fff":"#000"} style={{ flexShrink: 0 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {a.github_reg}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: colors.divider }} />
          <span style={{ color: colors.text3, fontSize: "12px" }}>{a.or}</span>
          <div style={{ flex: 1, height: "1px", background: colors.divider }} />
        </div>

        {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#f87171", fontSize: "13px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: a.name, type: "text", value: name, set: setName, ph: a.name_ph },
            { label: a.email, type: "email", value: email, set: setEmail, ph: "alan.turing@example.com" },
            { label: a.password, type: "password", value: password, set: setPassword, ph: "••••••••" },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: "block", fontSize: "13px", color: colors.text2, marginBottom: "6px" }}>{f.label}</label>
              <input type={f.type} required value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#555"} onBlur={e => e.target.style.borderColor = colors.border} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            width: "100%", height: "40px",
            background: loading ? colors.bg3 : colors.btnPrimary,
            color: loading ? colors.text3 : colors.btnPrimaryText,
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", marginTop: "4px",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = colors.btnPrimaryHover; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = colors.btnPrimary; }}>
            {loading ? a.loading_reg : a.register_btn}
          </button>
        </form>

        <p style={{ textAlign: "center", color: colors.text3, fontSize: "12px", marginTop: "24px", lineHeight: 1.7 }}>
          {a.terms_text} <Link href="#" style={{ color: colors.text2, textDecoration: "underline", textUnderlineOffset: "3px" }}>{a.terms}</Link> {a.terms_and} <Link href="#" style={{ color: colors.text2, textDecoration: "underline", textUnderlineOffset: "3px" }}>{a.privacy}</Link>{a.terms_agree}
        </p>
      </div>
    </div>
  );
}
