"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setSent(true);
    else setError("Алдаа гарлаа. Дахин оролдоно уу.");
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/auth-bg.jpg')",
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      position: "relative",
    }}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "20px", left: "24px", zIndex: 10 }}>
        <Link href="/" style={{ color: "#555", textDecoration: "none", fontSize: "13px", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#555")}>← Home</Link>
      </div>

      <div style={{
        width: "100%", maxWidth: "420px", position: "relative", zIndex: 1,
        padding: "40px 36px", background: "rgba(12,12,12,0.92)",
        border: "1px solid #1f1f1f", borderRadius: "16px", backdropFilter: "blur(20px)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "44px", height: "44px", background: "#fff", borderRadius: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "20px", fontWeight: 900, color: "#000", fontFamily: "Arial Black" }}>A</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.3px" }}>Нууц үг сэргээх</h1>
          <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Бүртгэлтэй имэйл хаягаа оруулна уу</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📧</div>
            <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "16px", margin: "0 0 8px" }}>Имэйл илгээгдлээ</h2>
            <p style={{ color: "#555", fontSize: "13px", lineHeight: 1.7, margin: "0 0 24px" }}>
              <strong style={{ color: "#aaa" }}>{email}</strong> хаяг руу нууц үг сэргээх линк илгээгдлээ.
            </p>
            <Link href="/auth/login" style={{ color: "#777", fontSize: "13px", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#777")}>
              ← Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        ) : (
          <>
            {error && <div style={{ background: "#1a0000", border: "1px solid #3a0000", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#f87171", fontSize: "13px" }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#777", marginBottom: "8px", fontWeight: 500 }}>И-мэйл</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="alan.turing@example.com"
                  style={{ width: "100%", height: "48px", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "0 16px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.15s" }}
                  onFocus={e => e.target.style.borderColor = "#555"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", height: "48px", background: loading ? "#1a1a1a" : "#fff",
                color: loading ? "#444" : "#000", border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#e0e0e0"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#fff"; }}>
                {loading ? "Илгээж байна..." : "Линк илгээх"}
              </button>
            </form>
            <p style={{ textAlign: "center", margin: "20px 0 0" }}>
              <Link href="/auth/login" style={{ color: "#555", fontSize: "13px", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#555")}>
                ← Нэвтрэх хуудас руу буцах
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
