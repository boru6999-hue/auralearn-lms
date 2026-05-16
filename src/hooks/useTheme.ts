"use client";
import { useState, useEffect } from "react";

export function useTheme() {
  // SSR дээр үргэлж dark — hydration mismatch гарахгүй
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client дээр зөв утгыг уншина
    const cookie = document.cookie.match(/aura_theme=([^;]+)/);
    const saved = cookie ? cookie[1] : (localStorage.getItem("aura_theme") || "dark");
    const dark = saved === "dark";
    setIsDark(dark);
    setMounted(true);

    // body class тавина
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${saved}`);
    setTimeout(() => document.body.classList.add("theme-ready"), 50);

    const handler = (e: Event) => {
      const next = (e as CustomEvent).detail === "dark";
      setIsDark(next);
      document.body.classList.remove("theme-dark", "theme-light");
      document.body.classList.add(`theme-${next ? "dark" : "light"}`);
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    };
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const dark = {
    bg: "#000", bg2: "#111", bg3: "#1a1a1a",
    border: "#2a2a2a", border2: "#1a1a1a",
    text: "#fff", text2: "#aaa", text3: "#666",
    inputBg: "#111", cardBg: "#111",
    navBg: "rgba(0,0,0,0.95)",
    btnPrimary: "#fff", btnPrimaryText: "#000", btnPrimaryHover: "#e0e0e0",
    socialBg: "#1a1a1a", divider: "#2a2a2a",
  };
  const light = {
    bg: "#f5f5f5", bg2: "#fff", bg3: "#f0f0f0",
    border: "#e0e0e0", border2: "#ddd",
    text: "#000", text2: "#444", text3: "#888",
    inputBg: "#fff", cardBg: "#fff",
    navBg: "rgba(255,255,255,0.97)",
    btnPrimary: "#000", btnPrimaryText: "#fff", btnPrimaryHover: "#222",
    socialBg: "#f0f0f0", divider: "#e0e0e0",
  };

  // mounted болтол dark colors буцаана — SSR-тай тохирно
  return { isDark: mounted ? isDark : true, mounted, colors: (mounted ? isDark : true) ? dark : light };
}
