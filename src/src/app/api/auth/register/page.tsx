"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") }),
    });
    if (res.ok) {
      router.push("/auth/login");
    } else {
      const json = await res.json();
      setError(json.error || "Алдаа гарлаа");
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", background: "#0a0a0f", border: "1px solid #1e1e3a",
    borderRadius: "8px", padding: "10px 14px", color: "#f1f0ff",
    fontSize: "0.95rem", outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: "var(--font-orbitron)", background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              LEARN<span style={{ WebkitTextFillColor: "#ec4899" }}>HUB</span>
            </span>
          </Link>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem", fontSize: "0.9rem" }}>Шинэ бүртгэл үүсгэх</p>
        </div>
        <div style={{ background: "#13131f", border: "1px solid #1e1e3a", borderRadius: "16px", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", color: "#f1f0ff" }}>Бүртгүүлэх</h1>
          {error && (
            <div style={{ background: "#ec489915", border: "1px solid #ec489950", borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem", color: "#f87171", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>Нэр</label>
              <input name="name" type="text" required placeholder="Таны нэр" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>И-мэйл</label>
              <input name="email" type="email" required placeholder="email@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>Нууц үг</label>
              <input name="password" type="password" required minLength={6} placeholder="••••••••" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"} />
            </div>
            <button type="submit" disabled={loading} style={{
              background: loading ? "#3b1d8a" : "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "#fff", border: "none", borderRadius: "8px", padding: "12px",
              fontSize: "1rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 0 20px #7c3aed40", marginTop: "0.5rem",
            }}>
              {loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх →"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
            Бүртгэл байгаа юу?{" "}
            <Link href="/auth/login" style={{ color: "#8b5cf6", textDecoration: "none", fontWeight: 600 }}>Нэвтрэх</Link>
          </p>
        </div>
      </div>
    </div>
  );
}