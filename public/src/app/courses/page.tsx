"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";

const CATEGORIES = [
  {
    id: "languages",
    icon: "🌐",
    label: { mn: "Хэл сургалт", en: "Languages", ja: "言語", ko: "언어", fr: "Langues", de: "Sprachen", zh: "语言" },
    courses: [
      { id: 1, title: "English for Beginners", level: "Beginner", students: 1240, rating: 4.8, duration: "24h", img: "🇺🇸", price: 29 },
      { id: 2, title: "Japanese N5-N4", level: "Beginner", students: 890, rating: 4.9, duration: "36h", img: "🇯🇵", price: 39 },
      { id: 3, title: "Korean TOPIK I", level: "Beginner", students: 760, rating: 4.7, duration: "28h", img: "🇰🇷", price: 34 },
      { id: 4, title: "Chinese HSK 1-2", level: "Beginner", students: 540, rating: 4.6, duration: "30h", img: "🇨🇳", price: 32 },
    ]
  },
  {
    id: "development",
    icon: "💻",
    label: { mn: "Хөгжүүлэлт", en: "Development", ja: "開発", ko: "개발", fr: "Développement", de: "Entwicklung", zh: "开发" },
    courses: [
      { id: 5, title: "Full Stack Web Dev", level: "Intermediate", students: 2100, rating: 4.9, duration: "80h", img: "🚀", price: 89 },
      { id: 6, title: "React & Next.js", level: "Intermediate", students: 1560, rating: 4.8, duration: "45h", img: "⚛️", price: 59 },
      { id: 7, title: "Node.js & MongoDB", level: "Intermediate", students: 980, rating: 4.7, duration: "40h", img: "🟢", price: 49 },
      { id: 8, title: "Python Basics", level: "Beginner", students: 1890, rating: 4.8, duration: "35h", img: "🐍", price: 39 },
    ]
  },
];

const LIVE = [
  { id: 9, title: "Live English Conversation", time: "Маргааш 18:00", seats: 12, img: "🎙️" },
  { id: 10, title: "React Q&A Session", time: "Нийслэг 20:00", seats: 8, img: "💬" },
  { id: 11, title: "Japanese Speaking Club", time: "Ням 14:00", seats: 15, img: "🗣️" },
];

export default function CoursesPage() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"all" | "languages" | "development" | "live">("all");
  const [search, setSearch] = useState("");
  const { formatPrice, currency, country } = useCurrency();

  const levelColor = (level: string) => {
    if (level === "Beginner") return isDark ? "#34d399" : "#059669";
    if (level === "Intermediate") return isDark ? "#f59e0b" : "#d97706";
    return isDark ? "#f87171" : "#dc2626";
  };

  const tabs = [
    { id: "all", label: { mn: "Бүгд", en: "All", ja: "すべて", ko: "전체", fr: "Tous", de: "Alle", zh: "全部" } },
    { id: "languages", label: { mn: "Хэл", en: "Languages", ja: "言語", ko: "언어", fr: "Langues", de: "Sprachen", zh: "语言" } },
    { id: "development", label: { mn: "Хөгжүүлэлт", en: "Development", ja: "開発", ko: "개발", fr: "Dev", de: "Entwicklung", zh: "开发" } },
    { id: "live", label: { mn: "Шууд", en: "Live", ja: "ライブ", ko: "라이브", fr: "Live", de: "Live", zh: "直播" } },
  ];

  const allCourses = CATEGORIES.flatMap(c => c.courses);
  const filtered = (activeTab === "all" ? allCourses
    : activeTab === "live" ? []
    : CATEGORIES.find(c => c.id === activeTab)?.courses || [])
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#000" }} />;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', -apple-system, sans-serif", transition: "background 0.3s" }}>

      {/* Hero */}
      <div style={{
        background: isDark
          ? "linear-gradient(135deg, #0d0014 0%, #150020 100%)"
          : "linear-gradient(135deg, #f0e8ff 0%, #e8f4ff 100%)",
        padding: "48px 24px 32px", borderBottom: `1px solid ${colors.border}`,
        position: "relative", overflow: "hidden",
      }}>
        {/* bg glow */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", background: isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: colors.text, marginBottom: "8px", letterSpacing: "-0.5px" }}>
            { lang === "mn" ? "Сургалтууд" : lang === "ja" ? "コース" : lang === "ko" ? "강의" : lang === "fr" ? "Cours" : lang === "de" ? "Kurse" : lang === "zh" ? "课程" : "Courses" }
          </h1>
          <p style={{ color: colors.text3, fontSize: "15px", marginBottom: "24px" }}>
            { lang === "mn" ? "Мэргэжлийн багш нараас суралцаарай" : lang === "ja" ? "プロの講師から学ぼう" : lang === "ko" ? "전문 강사에게 배우세요" : lang === "fr" ? "Apprenez auprès de formateurs" : lang === "de" ? "Lerne von Dozenten" : lang === "zh" ? "向专业讲师学习" : "Learn from professional instructors" }
          </p>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: "440px" }}>
            <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: colors.text3 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === "mn" ? "Сургалт хайх..." : lang === "ja" ? "コースを検索..." : lang === "ko" ? "강의 검색..." : lang === "fr" ? "Rechercher..." : lang === "de" ? "Suchen..." : lang === "zh" ? "搜索课程..." : "Search courses..."}
              style={{ width: "100%", height: "44px", background: isDark ? "rgba(255,255,255,0.06)" : "#fff", border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "0 14px 0 42px", color: colors.text, fontSize: "14px", outline: "none", boxSizing: "border-box" as const }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
              padding: "7px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s", border: "none",
              background: activeTab === tab.id
                ? "linear-gradient(135deg, #7c3aed, #06b6d4)"
                : isDark ? "rgba(255,255,255,0.05)" : "#fff",
              color: activeTab === tab.id ? "#fff" : colors.text2,
              boxShadow: activeTab === tab.id ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
            }}>
              {(tab.label as any)[lang] || tab.label.en}
            </button>
          ))}
        </div>

        {/* Live Classes */}
        {(activeTab === "all" || activeTab === "live") && (
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", boxShadow: "0 0 6px #ef4444", animation: "pulse 1.5s ease-in-out infinite" }} />
              <h2 style={{ color: colors.text, fontSize: "17px", fontWeight: 700 }}>
                {lang === "mn" ? "🎙️ Шууд хичээл" : lang === "ja" ? "🎙️ ライブ授業" : lang === "ko" ? "🎙️ 라이브 클래스" : lang === "fr" ? "🎙️ Cours en direct" : lang === "de" ? "🎙️ Live-Kurse" : lang === "zh" ? "🎙️ 直播课" : "🎙️ Live Classes"}
              </h2>
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {LIVE.map(live => (
                <div key={live.id} style={{
                  background: isDark ? "rgba(239,68,68,0.06)" : "#fff",
                  border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "#fee2e2"}`,
                  borderRadius: "12px", padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: "14px",
                  transition: "all 0.2s", cursor: "pointer",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#ef444466"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = isDark ? "rgba(239,68,68,0.2)" : "#fee2e2"; }}>
                  <div style={{ fontSize: "28px" }}>{live.img}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: colors.text, fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{live.title}</div>
                    <div style={{ color: "#ef4444", fontSize: "12px", fontWeight: 500 }}>🕐 {live.time}</div>
                  </div>
                  <div style={{ background: "rgba(239,68,68,0.12)", borderRadius: "6px", padding: "4px 10px", color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>
                    {live.seats} seats
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course categories */}
        {(activeTab === "all" || activeTab === "languages" || activeTab === "development") && (
          <>
            {CATEGORIES
              .filter(cat => activeTab === "all" || cat.id === activeTab)
              .map(cat => (
                <div key={cat.id} style={{ marginBottom: "36px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h2 style={{ color: colors.text, fontSize: "17px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                      {cat.icon} {(cat.label as any)[lang] || cat.label.en}
                    </h2>
                    <button style={{ background: "none", border: "none", color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>
                      {lang === "mn" ? "Бүгдийг харах →" : lang === "ja" ? "すべて見る →" : lang === "ko" ? "모두 보기 →" : lang === "fr" ? "Voir tout →" : lang === "de" ? "Alle →" : lang === "zh" ? "查看全部 →" : "See all →"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
                    {(search ? filtered.filter(c => cat.courses.find(x => x.id === c.id)) : cat.courses).map(course => (
                      <div key={course.id} style={{
                        background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "14px", overflow: "hidden",
                        transition: "all 0.2s", cursor: "pointer",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = isDark ? "0 12px 40px rgba(124,58,237,0.15)" : "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = isDark ? "rgba(124,58,237,0.3)" : "#c4b5fd"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = colors.border; }}>
                        {/* Thumbnail */}
                        <div style={{ height: "110px", background: isDark ? "rgba(124,58,237,0.1)" : "linear-gradient(135deg, #f0e8ff, #e8f4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px" }}>
                          {course.img}
                        </div>
                        <div style={{ padding: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: levelColor(course.level), background: levelColor(course.level) + "18", padding: "2px 8px", borderRadius: "4px" }}>
                              {course.level}
                            </span>
                            <span style={{ fontSize: "12px", color: colors.text3 }}>⏱ {course.duration}</span>
                          </div>
                          <h3 style={{ color: colors.text, fontSize: "14px", fontWeight: 600, marginBottom: "10px", lineHeight: 1.3 }}>{course.title}</h3>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: colors.text3 }}>👥 {course.students.toLocaleString()}</span>
                            <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>★ {course.rating}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                            <span style={{ fontSize: "15px", fontWeight: 700, color: isDark ? "#fff" : "#000" }}>{formatPrice((course as any).price || 29)}</span>
                            <span style={{ fontSize: "11px", background: "linear-gradient(135deg, #7c3aed, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 600 }}>Суралцах →</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </>
        )}

        {/* Teachers teaser */}
        {activeTab === "all" && (
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ color: colors.text, fontSize: "17px", fontWeight: 700, marginBottom: "16px" }}>
              {lang === "mn" ? "👨‍🏫 Багш нар" : lang === "ja" ? "👨‍🏫 講師" : lang === "ko" ? "👨‍🏫 강사" : lang === "fr" ? "👨‍🏫 Formateurs" : lang === "de" ? "👨‍🏫 Dozenten" : lang === "zh" ? "👨‍🏫 讲师" : "👨‍🏫 Teachers"}
            </h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { name: "Б. Батбаяр", subject: "Full Stack", rating: 4.9, students: 1240, img: "👨‍💻" },
                { name: "A. Tanaka", subject: "Japanese", rating: 5.0, students: 890, img: "👩‍🏫" },
                { name: "M. Kim", subject: "Korean", rating: 4.8, students: 760, img: "👨‍🏫" },
                { name: "J. Müller", subject: "German", rating: 4.7, students: 430, img: "👩‍💻" },
              ].map(t => (
                <div key={t.name} style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px", padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: "12px",
                  transition: "all 0.15s", cursor: "pointer",
                  minWidth: "200px",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? "rgba(124,58,237,0.4)" : "#a78bfa"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ fontSize: "32px" }}>{t.img}</div>
                  <div>
                    <div style={{ color: colors.text, fontSize: "14px", fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: colors.text3, fontSize: "12px" }}>{t.subject}</div>
                    <div style={{ fontSize: "11px", color: "#f59e0b" }}>★ {t.rating} · {t.students} students</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {activeTab === "all" && (
          <div style={{
            background: isDark ? "rgba(124,58,237,0.06)" : "linear-gradient(135deg, #f0e8ff, #e8f4ff)",
            border: `1px solid ${isDark ? "rgba(124,58,237,0.2)" : "#c4b5fd"}`,
            borderRadius: "16px", padding: "28px 32px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <h2 style={{ color: colors.text, fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
                {lang === "mn" ? "🏆 Гэрчилгээ авах" : lang === "ja" ? "🏆 修了証を取得" : lang === "ko" ? "🏆 수료증 받기" : lang === "fr" ? "🏆 Obtenir un certificat" : lang === "de" ? "🏆 Zertifikat erhalten" : lang === "zh" ? "🏆 获取证书" : "🏆 Get Certified"}
              </h2>
              <p style={{ color: colors.text3, fontSize: "14px" }}>
                {lang === "mn" ? "Сургалт дуусгаад гэрчилгээ аваарай" : lang === "ja" ? "コースを完了して証明書を取得" : lang === "ko" ? "강의 완료 후 수료증 받기" : lang === "fr" ? "Obtenez des certificats" : lang === "de" ? "Zertifikate erhalten" : lang === "zh" ? "完成课程获取证书" : "Complete courses and earn certificates"}
              </p>
            </div>
            <Link href="/auth/register" style={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              color: "#fff", padding: "10px 24px", borderRadius: "10px",
              textDecoration: "none", fontWeight: 600, fontSize: "14px",
              boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
            }}>
              {lang === "mn" ? "Эхлэх →" : lang === "ja" ? "始める →" : lang === "ko" ? "시작하기 →" : lang === "fr" ? "Commencer →" : lang === "de" ? "Loslegen →" : lang === "zh" ? "开始 →" : "Get Started →"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
