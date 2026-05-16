"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/auth") || pathname.startsWith("/payment");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Apply theme before showing anything
    const cookie = document.cookie.match(/aura_theme=([^;]+)/);
    const theme = cookie ? cookie[1] : (localStorage.getItem("aura_theme") || "dark");
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${theme}`);
    setMounted(true);
  }, []);

  // Don't render until theme is applied - prevents flash
  if (!mounted) return null;
  if (hideNavbar) return null;
  return <Navbar />;
}
