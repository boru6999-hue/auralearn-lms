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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Load anime.js dynamically and run letter animation
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js';
    script.onload = () => {
      const el = document.querySelector('.hero-title');
      if (!el) return;
      // Wrap each non-space char in span.letter
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
            // Keep letters visible after animation
            document.querySelectorAll('.hero-title .letter').forEach((el: any) => {
              el.style.opacity = '1';
            });
          }
        });
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    setVisible(true);
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

  // mounted болтол юу ч харуулахгүй — flash арилна
  if (!mounted) return (
    <div style={{ minHeight: "100vh", background: "#000" }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", overflow: "hidden", transition: "background 0.4s", position: "relative" }}>
      <style>{`
        .hero-title .letter {
          display: inline-block;
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes moveLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200vw); }
        }
        @keyframes moveLine2 {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200vh); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
        @keyframes orb {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.3); }
          50% { box-shadow: 0 0 60px rgba(124,58,237,0.7), 0 0 100px rgba(6,182,212,0.3); }
        }
      `}</style>

      {/* ─── BACKGROUND ANIMATED LINES ─── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>

        {/* Horizontal moving lines */}
        {[15, 35, 55, 72, 88].map((top, i) => (
          <div key={`h${i}`} style={{
            position: "absolute", top: `${top}%`, left: 0,
            width: "200px", height: "1px",
            background: isDark
              ? `linear-gradient(90deg, transparent, rgba(124,58,237,${0.3 + i * 0.05}), rgba(6,182,212,0.4), transparent)`
              : `linear-gradient(90deg, transparent, rgba(124,58,237,${0.15 + i * 0.03}), rgba(6,182,212,0.2), transparent)`,
            animation: `moveLine ${8 + i * 3}s linear infinite`,
            animationDelay: `${i * 2}s`,
          }} />
        ))}

        {/* Vertical moving lines */}
        {[20, 40, 60, 80].map((left, i) => (
          <div key={`v${i}`} style={{
            position: "absolute", left: `${left}%`, top: 0,
            width: "1px", height: "150px",
            background: isDark
              ? `linear-gradient(180deg, transparent, rgba(124,58,237,${0.2 + i * 0.05}), rgba(6,182,212,0.3), transparent)`
              : `linear-gradient(180deg, transparent, rgba(124,58,237,0.1), rgba(6,182,212,0.15), transparent)`,
            animation: `moveLine2 ${10 + i * 2.5}s linear infinite`,
            animationDelay: `${i * 1.5 + 1}s`,
          }} />
        ))}

        {/* Floating blobs */}
        {[
          { w: 400, h: 400, top: "5%", left: "2%", c1: isDark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.06)", dur: 12 },
          { w: 300, h: 300, top: "55%", right: "3%", c1: isDark ? "rgba(6,182,212,0.1)" : "rgba(6,182,212,0.05)", dur: 15 },
          { w: 200, h: 200, top: "25%", right: "15%", c1: isDark ? "rgba(236,72,153,0.08)" : "rgba(236,72,153,0.04)", dur: 10 },
          { w: 150, h: 150, bottom: "10%", left: "20%", c1: isDark ? "rgba(6,182,212,0.1)" : "rgba(6,182,212,0.05)", dur: 13 },
        ].map((b, i) => (
          <div key={`b${i}`} style={{
            position: "absolute",
            width: b.w, height: b.h,
            top: (b as any).top, left: (b as any).left,
            right: (b as any).right, bottom: (b as any).bottom,
            borderRadius: "50%",
            background: b.c1,
            filter: "blur(60px)",
            animation: `floatBlob ${b.dur}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          }} />
        ))}

        {/* SVG animated circuit lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: isDark ? 0.12 : 0.06 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0"/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1"/>
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Diagonal lines */}
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="8 4" style={{ animation: "dash 20s linear infinite" }} />
          <line x1="0" y1="80%" x2="80%" y2="0" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="6 8" style={{ animation: "dash 15s linear infinite" }} />
          <line x1="20%" y1="100%" x2="100%" y2="20%" stroke="url(#lineGrad)" strokeWidth="0.5" strokeDasharray="10 6" style={{ animation: "dash 25s linear infinite reverse" }} />
        </svg>

        {/* Small floating dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`d${i}`} style={{
            position: "absolute",
            width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
            borderRadius: "50%",
            background: isDark
              ? i % 2 === 0 ? "rgba(124,58,237,0.6)" : "rgba(6,182,212,0.5)"
              : i % 2 === 0 ? "rgba(124,58,237,0.3)" : "rgba(6,182,212,0.25)",
            top: `${(i * 17 + 5) % 90}%`,
            left: `${(i * 23 + 8) % 92}%`,
            animation: `orb ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.4) % 3}s`,
          }} />
        ))}
      </div>

      {/* ─── HERO SECTION ─── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "6rem 1.5rem 3rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "820px" }}>

          {/* Logo */}
          <div style={{ marginBottom:"28px", display:"flex", alignItems:"center", justifyContent:"center", gap:"12px", animation:"fadeUp 0.7s ease 0s both" }}>
            <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
              <circle cx="22" cy="22" r="16" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <circle cx="22" cy="22" r="11" fill={isDark?"#fff":"#000"}/>
              <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill={isDark?"#000":"#fff"}/>
            </svg>
            <span style={{ fontSize:"22px", fontWeight:900, color:isDark?"#fff":"#000", letterSpacing:"-0.5px" }}>
              Aura<span style={{ color:isDark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.35)" }}>Learn</span>
            </span>
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.2)"}`,
            borderRadius: "50px", padding: "5px 16px 5px 6px",
            fontSize: "12px", color: isDark ? "#fff" : "#000",
            marginBottom: "2rem", letterSpacing: "0.04em",
            animation: "fadeUp 0.7s ease 0.1s both",
          }}>
            <span style={{ background: "#000", borderRadius: "50px", padding: "2px 10px", color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }}>NEW</span>
            {h.badge.replace("⚡ ", "")}
          </div>

          {/* Heading */}
          <h1 className="hero-title" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", fontWeight: 900, lineHeight: 1.0, marginBottom: "1.5rem", letterSpacing: "-2px" }}>
            <span style={{
              display: "block",
              color: isDark ? "#fff" : "#000",
            }}>{h.title}</span>
            <span style={{
              display: "block", fontSize: "87%",
              color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
            }}>
              {h.subtitle}
            </span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: "17px", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)",
            maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.8,
            animation: "fadeUp 0.7s ease 0.3s both",
          }}>{h.desc}</p>

          {/* CTA */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "3.5rem", animation: "fadeUp 0.7s ease 0.4s both" }}>
            <Link href="/courses" style={{
              background: "transparent",
              color: isDark ? "#fff" : "#000",
              padding: "14px 32px", borderRadius: "12px",
              fontWeight: 700, fontSize: "15px", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}`,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "none"; }}>
              {h.cta_courses}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/auth/register" style={{
              background: isDark ? "#fff" : "#111",
              color: isDark ? "#000" : "#fff",
              padding: "14px 32px", borderRadius: "12px",
              fontWeight: 700, fontSize: "15px", textDecoration: "none",
              border: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}>
              {h.cta_register}
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "12px", justifyContent: "center",
            animation: "fadeUp 0.7s ease 0.5s both",
          }}>
            {[
              { num: "100+", label: h.stat_courses, icon: "fa-book-open" },
              { num: `${count >= 5000 ? "5K+" : count.toLocaleString()}`, label: h.stat_students, icon: "fa-users" },
              { num: "50+", label: h.stat_teachers, icon: "fa-chalkboard-user" },
            ].map((s, i) => (
              <div key={`stat-${i}`} style={{
                textAlign: "center",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                borderRadius: "14px", padding: "16px 20px", minWidth: "90px",
                backdropFilter: "blur(12px)",
              }}>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize:"16px", color:isDark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.4)", marginBottom:"6px" }} />
                <div style={{ fontSize: "22px", fontWeight: 800, color: isDark ? "#fff" : "#000", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)", marginTop: "4px", letterSpacing: "0.04em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trusted by */}
          <div style={{ marginTop: "2rem", animation: "fadeUp 0.7s ease 0.6s both" }}>
            <p style={{ fontSize: "11px", color: isDark ? "#666" : "#999", marginBottom: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{lang==="mn"?"Дараах улсын оюутнууд суралцаж байна":lang==="ja"?"世界の学生が学んでいます":lang==="ko"?"전 세계 학생들이 수강 중":lang==="fr"?"Des étudiants du monde entier":lang==="de"?"Studenten aus aller Welt":"Trusted by students from"}</p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              {["🇲🇳 Mongolia", "🇺🇸 USA", "🇯🇵 Japan", "🇰🇷 Korea", "🇩🇪 Germany", "🇫🇷 France"].map((c, i) => (
                <span key={`country-${i}`} style={{ fontSize: "12px", color: isDark ? "#777" : "#888", fontWeight: 500 }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: "3rem 1.5rem 5rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {[
              { icon: "fa-bolt", title: lang==="mn"?"Хурдан суралцах":lang==="ja"?"速習":lang==="ko"?"빠른 학습":lang==="fr"?"Apprentissage rapide":lang==="de"?"Schnelles Lernen":lang==="zh"?"快速学习":"Fast Learning", desc: lang==="mn"?"Хурдан, практик дасгалуудаар суралцана":lang==="ja"?"実践的な演習で素早く学べます":lang==="ko"?"빠르고 실용적인 연습으로 배우기":lang==="fr"?"Apprenez rapidement avec des exercices pratiques":lang==="de"?"Schnell lernen mit praktischen Übungen":lang==="zh"?"通过实践练习快速学习":"Learn fast with practical exercises", color: "#f59e0b" },
              { icon: "fa-bullseye", title: lang==="mn"?"Мэргэжлийн багш нар":lang==="ja"?"専門メンター":lang==="ko"?"전문 멘토":lang==="fr"?"Mentors experts":lang==="de"?"Experten-Mentoren":lang==="zh"?"专业导师":"Expert Mentors", desc: lang==="mn"?"Мэргэжлийн багш нараас шууд суралц":lang==="ja"?"専門家の講師から直接学べます":lang==="ko"?"전문 강사에게 직접 배우세요":lang==="fr"?"Apprenez directement auprès d'experts":lang==="de"?"Lernen Sie direkt von Experten":lang==="zh"?"直接向专业讲师学习":"Learn from expert instructors", color: "#7c3aed" },
              { icon: "fa-rocket", title: lang==="mn"?"Ажилд бэлэн болох":lang==="ja"?"就職準備":lang==="ko"?"취업 준비":lang==="fr"?"Prêt pour l'emploi":lang==="de"?"Karriere bereit":lang==="zh"?"职场就绪":"Career Ready", desc: lang==="mn"?"Ажлын байранд бэлэн болох мэдлэг":lang==="ja"?"就職市場に対応した知識を身につけよう":lang==="ko"?"취업 시장에 맞는 지식 습득":lang==="fr"?"Compétences prêtes pour le marché du travail":lang==="de"?"Wissen für den Arbeitsmarkt":lang==="zh"?"掌握职场所需知识":"Career-ready knowledge", color: "#06b6d4" },
            ].map((f, i) => (
              <div key={f.title} style={{
                background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.75)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
                borderRadius: "16px", padding: "28px",
                backdropFilter: "blur(20px)",
                transition: "all 0.25s",
                animation: `fadeUp 0.7s ease ${0.7 + i * 0.1}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = `${f.color}44`; e.currentTarget.style.boxShadow = `0 16px 48px ${f.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ width:"44px", height:"44px", borderRadius:"10px", background:`${f.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"14px" }}>
                  <i className={`fa-solid ${f.icon}`} style={{ fontSize:"18px", color:f.color }} />
                </div>
                <h3 style={{ color: isDark ? "#aaa" : "#555", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ color: isDark ? "#777" : "#888", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
