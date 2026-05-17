"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

export default function HomePage() {
  const { t, lang } = useLang();
  const { isDark, colors, mounted } = useTheme();
  const h = t.home;
  const [count, setCount] = useState(0);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js';
    script.onload = () => {
      const el = document.querySelector('.hero-title');
      if (!el) return;
      el.querySelectorAll('span:not(.letter)').forEach(span => {
        const text = span.textContent || '';
        span.innerHTML = text.replace(/\S/g, "<span class='letter' style='display:inline-block;opacity:0'>$&</span>");
      });
      const anime = (window as any).anime;
      anime({
        targets: '.hero-title .letter',
        opacity: [0, 1],
        easing: 'easeInOutQuad',
        duration: 800,
        delay: (_: any, i: number) => 60 * (i + 1),
        complete: () => {
          document.querySelectorAll('.hero-title .letter').forEach((el: any) => { el.style.opacity = '1'; });
        }
      });
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let n = 0;
      const interval = setInterval(() => {
        n += 80;
        setCount(n);
        if (n >= 5000) { clearInterval(interval); setCount(5000); }
      }, 15);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const bg = isDark
    ? "radial-gradient(ellipse at 20% 20%, #0d0014 0%, #000 60%, #000510 100%)"
    : "radial-gradient(ellipse at 20% 20%, #f0e8ff 0%, #f5f5f5 60%, #e8f4ff 100%)";

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#000" }} />;

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", overflow: "hidden", transition: "background 0.4s", position: "relative" }}>
      <style>{`
        .hero-title .letter { display: inline-block; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatBlob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -40px) scale(1.05); } 66% { transform: translate(-20px, 20px) scale(0.97); } }
        @keyframes moveLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(200vw); } }
        @keyframes moveLine2 { 0% { transform: translateY(-100%); } 100% { transform: translateY(200vh); } }
        @keyframes dash { to { stroke-dashoffset: -1000; } }
        @keyframes orb { 0%, 100% { transform: translateY(0px); opacity: 0.6; } 50% { transform: translateY(-20px); opacity: 1; } }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {[15, 35, 55, 72, 88].map((top, i) => (
          <div key={`h${i}`} style={{ position: "absolute", top: `${top}%`, left: 0, width: "200px", height: "1px", background: isDark ? `linear-gradient(90deg, transparent, rgba(124,58,237,${0.3 + i * 0.05}), rgba(6,182,212,0.4), transparent)` : `linear-gradient(90deg, transparent, rgba(124,58,237,${0.15 + i * 0.03}), rgba(6,182,212,0.2), transparent)`, animation: `moveLine ${8 + i * 3}s linear infinite`, animationDelay: `${i * 2}s` }} />
        ))}
        {[{ w: 400, h: 400, top: "5%", left: "2%", c1: isDark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.06)", dur: 12 }, { w: 300, h: 300, top: "55%", right: "3%", c1: isDark ? "rgba(6,182,212,0.1)" : "rgba(6,182,212,0.05)", dur: 15 }].map((b, i) => (
          <div key={`b${i}`} style={{ position: "absolute", width: b.w, height: b.h, top: (b as any).top, left: (b as any).left, right: (b as any).right, borderRadius: "50%", background: b.c1, filter: "blur(60px)", animation: `floatBlob ${b.dur}s ease-in-out infinite`, animationDelay: `${i * 2}s` }} />
        ))}
      </div>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(80px,12vw,100px) clamp(16px,4vw,24px) 48px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "820px", width: "100%" }}>

          {/* Logo */}
          <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", animation: "fadeUp 0.7s ease 0s both" }}>
            <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
              <circle cx="22" cy="22" r="16" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <circle cx="22" cy="22" r="11" fill={isDark?"#fff":"#000"}/>
              <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill={isDark?"#000":"#fff"}/>
            </svg>
            <span style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, color: isDark?"#fff":"#000", letterSpacing: "-0.5px" }}>
              Aura<span style={{ color: isDark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.35)" }}>Learn</span>
            </span>
          </div>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)", border: `1px solid ${isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.2)"}`, borderRadius: "50px", padding: "5px 16px 5px 6px", fontSize: "12px", color: isDark?"#fff":"#000", marginBottom: "2rem", letterSpacing: "0.04em", animation: "fadeUp 0.7s ease 0.1s both" }}>
            <span style={{ background: "#000", borderRadius: "50px", padding: "2px 10px", color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }}>NEW</span>
            {h?.badge?.replace("⚡ ", "") || "Next-level online learning"}
          </div>

          {/* Heading */}
          <h1 className="hero-title" style={{ fontSize: "clamp(2.5rem,8vw,5.5rem)", fontWeight: 900, lineHeight: 1.0, marginBottom: "1.5rem", letterSpacing: "-2px" }}>
            <span style={{ display: "block", color: isDark?"#fff":"#000" }}>{h?.title || "Level Up"}</span>
            <span style={{ display: "block", fontSize: "87%", color: isDark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.4)" }}>{h?.subtitle || "Your Skills"}</span>
          </h1>

          {/* Description */}
          <p style={{ fontSize: "clamp(14px,3vw,17px)", color: isDark?"rgba(255,255,255,0.7)":"rgba(0,0,0,0.65)", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.8, animation: "fadeUp 0.7s ease 0.3s both" }}>
            {h?.desc || "Learn from professional instructors"}
          </p>

          {/* CTA */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem", animation: "fadeUp 0.7s ease 0.4s both" }}>
            <Link href="/courses" style={{ background: "transparent", color: isDark?"#fff":"#000", padding: "clamp(10px,2vw,14px) clamp(20px,4vw,32px)", borderRadius: "12px", fontWeight: 700, fontSize: "clamp(13px,2vw,15px)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", border: `1px solid ${isDark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.4)"}`, transition: "all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.transform="none";}}>
              {h?.cta_courses || "Browse Courses"}
              <i className="fa-solid fa-arrow-right" style={{fontSize:"13px"}}/>
            </Link>
            <Link href="/auth/register" style={{ background: isDark?"#fff":"#111", color: isDark?"#000":"#fff", padding: "clamp(10px,2vw,14px) clamp(20px,4vw,32px)", borderRadius: "12px", fontWeight: 700, fontSize: "clamp(13px,2vw,15px)", textDecoration: "none", border: "none", transition: "all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.opacity="0.85";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}>
              {h?.cta_register || "Get Started →"}
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.5s both" }}>
            {[
              { num: "100+", label: h?.stat_courses || (lang==="mn"?"Сургалт":"Courses"), icon: "fa-book-open" },
              { num: `${count >= 5000 ? "5K+" : count.toLocaleString()}`, label: h?.stat_students || (lang==="mn"?"Оюутан":"Students"), icon: "fa-users" },
              { num: "50+", label: h?.stat_teachers || (lang==="mn"?"Багш":"Instructors"), icon: "fa-chalkboard-user" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", background: isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)", border: `1px solid ${isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)"}`, borderRadius: "14px", padding: "clamp(12px,2vw,16px) clamp(16px,3vw,20px)", minWidth: "80px", backdropFilter: "blur(12px)" }}>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize: "16px", color: isDark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.4)", marginBottom: "6px", display: "block" }} />
                <div style={{ fontSize: "clamp(18px,3vw,22px)", fontWeight: 800, color: isDark?"#fff":"#000", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: "11px", color: isDark?"rgba(255,255,255,0.55)":"rgba(0,0,0,0.5)", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trusted by */}
          <div style={{ marginTop: "2rem", animation: "fadeUp 0.7s ease 0.6s both" }}>
            <p style={{ fontSize: "11px", color: isDark?"#666":"#999", marginBottom: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {lang==="mn"?"Дараах улсын оюутнууд суралцаж байна":lang==="ja"?"世界の学生が学んでいます":lang==="ko"?"전 세계 학생들이 수강 중":lang==="fr"?"Des étudiants du monde entier":lang==="de"?"Studenten aus aller Welt":"Trusted by students from"}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {["🇲🇳 Mongolia","🇺🇸 USA","🇯🇵 Japan","🇰🇷 Korea","🇩🇪 Germany","🇫🇷 France"].map((c, i) => (
                <span key={i} style={{ fontSize: "12px", color: isDark?"#777":"#888", fontWeight: 500 }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
