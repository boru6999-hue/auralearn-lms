"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const { isDark, colors, mounted } = useTheme();

  const a = t.auth;

  const [step, setStep] = useState<"email" | "password">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailNext(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!email) return;

    setError("");
    setStep("password");
  }

  async function handlePasswordSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(a.error_wrong);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
        }}
      />
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "46px",
    background: isDark
      ? "rgba(255,255,255,0.05)"
      : "#fff",

    border: `1px solid ${
      isDark
        ? "rgba(255,255,255,0.08)"
        : "#ddd"
    }`,

    borderRadius: "12px",

    padding: "0 14px",

    color: colors.text,

    fontSize: "14px",

    outline: "none",

    boxSizing: "border-box",

    transition: "0.2s",
  };

  const socialBtnStyle: React.CSSProperties = {
    flex: 1,

    height: "44px",

    borderRadius: "12px",

    border: `1px solid ${
      isDark
        ? "rgba(255,255,255,0.08)"
        : "#ddd"
    }`,

    background: isDark
      ? "rgba(255,255,255,0.05)"
      : "#fff",

    color: colors.text,

    fontSize: "13px",

    fontWeight: 600,

    cursor: "pointer",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "8px",

    transition: "0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",

        backgroundImage: isDark
          ? "url('/auth-bg.jpg')"
          : "none",

        backgroundSize: "cover",

        backgroundPosition: "center",

        backgroundRepeat: "no-repeat",

        backgroundAttachment: "fixed",

        backgroundColor: isDark
          ? "#000"
          : "#f5f5f5",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding: "24px",

        position: "relative",

        overflow: "hidden",

        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      }}
    >
      {isDark && (
        <div
          style={{
            position: "absolute",

            inset: 0,

            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.32))",

            backdropFilter: "blur(1px)",

            WebkitBackdropFilter: "blur(1px)",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",

          top: "24px",

          left: "24px",

          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            color: colors.text3,

            textDecoration: "none",

            fontSize: "13px",
          }}
        >
          ← Home
        </Link>
      </div>

      <div
        style={{
          width: "100%",

          maxWidth: "420px",

          position: "relative",

          zIndex: 2,

          background: isDark
            ? "rgba(18,18,22,0.58)"
            : "rgba(255,255,255,0.92)",

          border: `1px solid ${
            isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)"
          }`,

          borderRadius: "28px",

          padding: "38px",

          backdropFilter: "blur(20px)",

          WebkitBackdropFilter: "blur(20px)",

          boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.55)"
            : "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",

            marginBottom: "32px",
          }}
        >
          <img
            src="/icon.png"
            alt="AuraLearn"
            style={{
              width: "62px",
              height: "62px",
              marginBottom: "18px",
            }}
          />

          <h1
            style={{
              color: colors.text,

              fontSize: "32px",

              fontWeight: 800,

              margin: "0 0 8px",

              letterSpacing: "-1px",
            }}
          >
            Sign in to AuraLearn
          </h1>

          <p
            style={{
              color: colors.text3,

              fontSize: "14px",

              margin: 0,
            }}
          >
            Don’t have an account?{" "}
            <Link
              href="/auth/register"
              style={{
                color: colors.text,

                fontWeight: 600,

                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </p>
        </div>

        <div
          style={{
            display: "flex",

            gap: "10px",

            marginBottom: "20px",
          }}
        >
          <button style={socialBtnStyle}>
            Continue with Google
          </button>

          <button style={socialBtnStyle}>
            Continue with GitHub
          </button>
        </div>

        <div
          style={{
            display: "flex",

            alignItems: "center",

            gap: "12px",

            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: colors.divider,
            }}
          />

          <span
            style={{
              color: colors.text3,
              fontSize: "12px",
            }}
          >
            or
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: colors.divider,
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background:
                "rgba(248,113,113,0.1)",

              border:
                "1px solid rgba(248,113,113,0.3)",

              borderRadius: "10px",

              padding: "12px",

              marginBottom: "16px",

              color: "#f87171",

              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {step === "email" && (
          <form
            onSubmit={handleEmailNext}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="alan.turing@example.com"
              style={inputStyle}
            />

            <button
              type="submit"
              style={{
                height: "46px",

                border: "none",

                borderRadius: "12px",

                background: "#fff",

                color: "#000",

                fontSize: "14px",

                fontWeight: 700,

                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </form>
        )}

        {step === "password" && (
          <form
            onSubmit={handlePasswordSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                height: "46px",

                border: "none",

                borderRadius: "12px",

                background: "#fff",

                color: "#000",

                fontSize: "14px",

                fontWeight: 700,

                cursor: "pointer",
              }}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}