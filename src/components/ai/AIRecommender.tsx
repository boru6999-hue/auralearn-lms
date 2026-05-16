"use client";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

export default function AIRecommender() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoad] = useState(false);

  const t = (mn: string, en: string) => lang === "mn" ? mn : en;

  if (!mounted) return null;

  const BG     = isDark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const BORDER = isDark ? "#1e1e1e" : "#e5e5e5";
  const TEXT   = isDark ? "#fff"    : "#000";
  const MUTED  = isDark ? "#555"    : "#888";

  const QUESTIONS = [
    {
      q: t("Ямар чиглэлд суралцахыг хүсч байна вэ?","What do you want to learn?"),
      opts: [t("Хэл (Англи, Япон, Солонгос...)","Language (English, Japanese, Korean...)"), t("Вэб хөгжүүлэлт","Web Development"), t("Дизайн","Design"), t("Бизнес","Business")]
    },
    {
      q: t("Таны одоогийн түвшин?","What's your current level?"),
      opts: [t("Огт мэдэхгүй","Complete beginner"), t("Суурь мэдлэгтэй","Some basics"), t("Дунд түвшин","Intermediate"), t("Ахисан түвшин","Advanced")]
    },
    {
      q: t("Өдөрт хэр цаг зарцуулж чадах вэ?","How much time per day?"),
      opts: ["< 30 мин", "30-60 мин", "1-2 цаг", "2+ цаг"]
    },
    {
      q: t("Зорилгоо сонгоно уу","What's your goal?"),
      opts: [t("Ажлын байранд хэрэглэх","Career advancement"), t("Хобби","Hobby"), t("Шалгалтанд бэлтгэх","Exam preparation"), t("Гадаадад явах","Travel/Study abroad")]
    },
  ];

  async function getRecommendations() {
    setLoad(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a course recommendation AI for AuraLearn online learning platform.
Based on user answers, recommend exactly 3 courses. 
Respond ONLY with valid JSON, no other text:
[
  {
    "title": "Course name",
    "description": "Why this course suits them (2 sentences)",
    "level": "Beginner/Intermediate/Advanced",
    "duration": "e.g. 4 weeks",
    "emoji": "relevant emoji",
    "category": "language/development/design/business"
  }
]
Respond in: ${lang === "mn" ? "Mongolian" : lang === "ja" ? "Japanese" : lang === "ko" ? "Korean" : "English"}`,
          messages: [{
            role: "user",
            content: `User preferences:
1. Want to learn: ${answers[0]}
2. Current level: ${answers[1]}
3. Time available: ${answers[2]}
4. Goal: ${answers[3]}

Recommend 3 specific courses for this user.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();
      setRecs(JSON.parse(cleaned));
    } catch {
      alert(t("Алдаа гарлаа. Дахин оролдоно уу.", "Error. Please try again."));
    }
    setLoad(false);
  }

  function select(opt: string) {
    const newAnswers = [...answers, opt];
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
      setTimeout(() => getRecommendations(), 100);
    }
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setRecs([]);
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: TEXT, fontSize: "24px", fontWeight: 800, marginBottom: "6px" }}>
            ✨ {t("AI Сургалт санал болгогч","AI Course Recommender")}
          </h1>
          <p style={{ color: MUTED, fontSize: "13px" }}>
            {t("Таны хэрэгцээнд тохирсон сургалтыг AI санал болгоно","AI recommends courses tailored to your needs")}
          </p>
        </div>

        {/* Progress */}
        {step < QUESTIONS.length && (
          <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= step ? (isDark ? "#fff" : "#000") : (isDark ? "#222" : "#ddd"), transition: "all 0.3s" }} />
            ))}
          </div>
        )}

        {/* Questions */}
        {step < QUESTIONS.length ? (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ color: MUTED, fontSize: "12px", marginBottom: "8px" }}>
              {step + 1} / {QUESTIONS.length}
            </div>
            <h2 style={{ color: TEXT, fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
              {QUESTIONS[step].q}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {QUESTIONS[step].opts.map((opt, i) => (
                <button key={i} onClick={() => select(opt)} style={{
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px",
                  padding: "14px 18px", textAlign: "left", cursor: "pointer", color: TEXT,
                  fontSize: "14px", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "10px",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"; e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = CARD; }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                    {["A","B","C","D"][i]}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "60px", background: CARD, borderRadius: "16px", border: `1px solid ${BORDER}` }}>
            <i className="fa-solid fa-wand-magic-sparkles fa-spin" style={{ fontSize: "36px", color: TEXT, display: "block", marginBottom: "16px" }} />
            <div style={{ color: TEXT, fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>
              {t("AI шинжилж байна...","AI is analyzing...")}
            </div>
            <div style={{ color: MUTED, fontSize: "13px" }}>
              {t("Таны хэрэгцээнд тохирсон сургалтуудыг хайж байна","Finding the perfect courses for you")}
            </div>
          </div>
        ) : recs.length > 0 ? (
          <div>
            <h2 style={{ color: TEXT, fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              🎯 {t("Таны хувийн санал","Your personalized recommendations")}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {recs.map((rec, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "18px" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "32px" }}>{rec.emoji}</span>
                    <div>
                      <div style={{ color: TEXT, fontWeight: 700, fontSize: "15px" }}>{rec.title}</div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <span style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: MUTED, fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>{rec.level}</span>
                        <span style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: MUTED, fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>⏱ {rec.duration}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: MUTED, fontSize: "13px", lineHeight: 1.5, marginBottom: "12px" }}>{rec.description}</p>
                  <Link href="/courses" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: TEXT, padding: "7px 14px", borderRadius: "8px", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: "11px" }} />
                    {t("Сургалт харах","View Courses")}
                  </Link>
                </div>
              ))}
            </div>
            <button onClick={reset} style={{ width: "100%", marginTop: "16px", height: "44px", background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>
              {t("Дахин эхлэх","Start Over")}
            </button>
          </div>
        ) : null}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
