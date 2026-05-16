"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("И-мэйл эсвэл нууц үг буруу байна");
      setLoading(false);
    } else {
      router.push("/dashboard");
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
          <p style={{ color: "#94a3b8", marginTop: "0.5rem", fontSize: "0.9rem" }}>Тавтай морилно уу</p>
        </div>
        <div style={{ background: "#13131f", border: "1px solid #1e1e3a", borderRadius: "16px", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", color: "#f1f0ff" }}>Нэвтрэх</h1>
          {error && (
            <div style={{ background: "#ec489915", border: "1px solid #ec489950", borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem", color: "#f87171", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>И-мэйл</label>
              <input name="email" type="email" required placeholder="email@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>Нууц үг</label>
              <input name="password" type="password" required placeholder="••••••••" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"} />
            </div>
            <button type="submit" disabled={loading} style={{
              background: loading ? "#3b1d8a" : "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "#fff", border: "none", borderRadius: "8px", padding: "12px",
              fontSize: "1rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 0 20px #7c3aed40", marginTop: "0.5rem",
            }}>
              {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх →"}
            </button>
          </form>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#1e1e3a" }} />
            <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>ЭСВЭЛ</span>
            <div style={{ flex: 1, height: "1px", background: "#1e1e3a" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} style={{
              width: "100%", background: "#13131f", border: "1px solid #1e1e3a",
              borderRadius: "8px", padding: "11px", color: "#f1f0ff", fontSize: "0.9rem",
              fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.5rem",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#8b5cf6"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e3a"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub-ээр нэвтрэх
            </button>
          </div>
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
            Бүртгэл байхгүй юу?{" "}
            <Link href="/auth/register" style={{ color: "#8b5cf6", textDecoration: "none", fontWeight: 600 }}>Бүртгүүлэх</Link>
          </p>
        </div>
      </div>
    </div>
  );
}