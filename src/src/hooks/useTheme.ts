"use client";
import { useState, useEffect } from "react";

function getInitialTheme(): boolean {
  if (typeof document === "undefined") return true;
  // Read from html data-theme set by blocking script
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr) return attr === "dark";
  const cookie = document.cookie.match(/aura_theme=([^;]+)/);
  if (cookie) return cookie[1] === "dark";
  return (localStorage.getItem("aura_theme") || "dark") === "dark";
}

export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    // Apply body class
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${isDark ? "dark" : "light"}`);
    // Add transition class after first render
    setTimeout(() => document.body.classList.add("theme-ready"), 100);

    const handler = (e: Event) => {
      const next = (e as CustomEvent).detail === "dark";
      setIsDark(next);
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    };
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, [isDark]);

  const colors = isDark ? {
    bg: "#000", bg2: "#111", bg3: "#1a1a1a",
    border: "#2a2a2a", border2: "#1a1a1a",
    text: "#fff", text2: "#aaa", text3: "#666",
    inputBg: "#111", cardBg: "#111",
    navBg: "rgba(0,0,0,0.95)",
    btnPrimary: "#fff", btnPrimaryText: "#000", btnPrimaryHover: "#e0e0e0",
    socialBg: "#1a1a1a", divider: "#2a2a2a",
  } : {
    bg: "#f5f5f5", bg2: "#fff", bg3: "#f0f0f0",
    border: "#e0e0e0", border2: "#ddd",
    text: "#000", text2: "#444", text3: "#888",
    inputBg: "#fff", cardBg: "#fff",
    navBg: "rgba(255,255,255,0.97)",
    btnPrimary: "#000", btnPrimaryText: "#fff", btnPrimaryHover: "#222",
    socialBg: "#f0f0f0", divider: "#e0e0e0",
  };

  return { isDark, colors };
}
