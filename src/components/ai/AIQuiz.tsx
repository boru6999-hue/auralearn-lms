"use client";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";

interface Quiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function AIQuiz() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [topic, setTopic] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoad] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmit] = useState(false);

  const t = (mn: string, en: string) => lang === "mn" ? mn : en;

  if (!mounted) return null;

  const BG     = isDark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const BORDER = isDark ? "#1e1e1e" : "#e5e5e5";
  const TEXT   = isDark ? "#fff"    : "#000";
  const MUTED  = isDark ? "#555"    : "#888";

  async function generate() {
    if (!topic.trim()) return;
    setLoad(true);
    setQuizzes([]);
    setAnswers({});
    setSubmit(false);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a quiz generator for an online learning platform. Generate exactly 5 multiple choice questions about the given topic. 
Respond ONLY with valid JSON array, no other text:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Why this answer is correct"
  }
]
The "correct" field is the 0-based index of the correct option.
Generate questions in this language: ${lang === "mn" ? "Mongolian" : lang === "ja" ? "Japanese" : lang === "ko" ? "Korean" : "English"}`,
          messages: [{ role: "user", content: `Generate 5 quiz questions about: ${topic}` }]
        })
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setQuizzes(parsed);
    } catch {
      alert(t("Quiz үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.", "Failed to generate quiz. Please try again."));
    }
    setLoad(false);
  }

  function submit() {
    if (Object.keys(answers).length < quizzes.length) {
      alert(t("Бүх асуултад хариулна уу!", "Please answer all questions!"));
      return;
    }
    setSubmit(true);
    window.scrollTo(0, 0);
  }

  const score = submitted ? quizzes.filter((q, i) => answers[i] === q.correct).length : 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: TEXT, fontSize: "24px", fontWeight: 800, marginBottom: "6px" }}>
            🤖 {t("AI Тест үүсгэгч","AI Quiz Generator")}
          </h1>
          <p style={{ color: MUTED, fontSize: "13px" }}>
            {t("Дурын сэдвээр AI тест үүсгэ","Generate a quiz on any topic with AI")}
          </p>
        </div>

        {/* Topic input */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder={t("Сэдэв бичнэ үү... (жш: Python, Англи хэл, React)","Enter topic... (e.g. Python, English grammar, React)")}
            style={{ flex: 1, height: "44px", background: isDark ? "rgba(255,255,255,0.06)" : "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "0 14px", color: TEXT, fontSize: "14px", outline: "none" }} />
          <button onClick={generate} disabled={loading || !topic.trim()} style={{
            height: "44px", padding: "0 20px", borderRadius: "10px", border: "none",
            background: topic.trim() && !loading ? (isDark ? "#fff" : "#000") : (isDark ? "#222" : "#ddd"),
            color: topic.trim() && !loading ? (isDark ? "#000" : "#fff") : MUTED,
            fontWeight: 700, fontSize: "13px", cursor: topic.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> {t("Үүсгэж байна...","Generating...")}</> : <><i className="fa-solid fa-wand-magic-sparkles" /> {t("Үүсгэх","Generate")}</>}
          </button>
        </div>

        {/* Score */}
        {submitted && (
          <div style={{ background: score >= 4 ? "rgba(52,211,153,0.1)" : score >= 3 ? "rgba(245,158,11,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${score >= 4 ? "rgba(52,211,153,0.3)" : score >= 3 ? "rgba(245,158,11,0.3)" : "rgba(248,113,113,0.3)"}`, borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: TEXT, fontWeight: 800, fontSize: "18px" }}>
                {score >= 4 ? "🎉" : score >= 3 ? "👍" : "💪"} {score}/{quizzes.length} {t("зөв","correct")}
              </div>
              <div style={{ color: MUTED, fontSize: "13px" }}>
                {score >= 4 ? t("Маш сайн!","Excellent!") : score >= 3 ? t("Сайн байна!","Good job!") : t("Дахин оролдоно уу!","Keep practicing!")}
              </div>
            </div>
            <button onClick={() => { setQuizzes([]); setAnswers({}); setSubmit(false); setTopic(""); }} style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", border: `1px solid ${BORDER}`, color: TEXT, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
              {t("Дахин тест","New Quiz")}
            </button>
          </div>
        )}

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {quizzes.map((q, qi) => (
            <div key={qi} style={{ background: CARD, border: `1px solid ${submitted ? (answers[qi] === q.correct ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)") : BORDER}`, borderRadius: "12px", padding: "18px" }}>
              <div style={{ color: TEXT, fontSize: "14px", fontWeight: 600, marginBottom: "14px" }}>
                <span style={{ color: MUTED, fontWeight: 400 }}>{qi + 1}. </span>{q.question}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = q.correct === oi;
                  let bg = isDark ? "rgba(255,255,255,0.04)" : "#f5f5f5";
                  let border = BORDER;
                  let color = TEXT;
                  if (submitted) {
                    if (isCorrect) { bg = "rgba(52,211,153,0.15)"; border = "rgba(52,211,153,0.5)"; color = "#34d399"; }
                    else if (isSelected) { bg = "rgba(248,113,113,0.15)"; border = "rgba(248,113,113,0.5)"; color = "#f87171"; }
                  } else if (isSelected) {
                    bg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
                    border = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
                  }
                  return (
                    <button key={oi} onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                      style={{ background: bg, border: `1px solid ${border}`, borderRadius: "8px", padding: "10px 14px", textAlign: "left", cursor: submitted ? "default" : "pointer", color, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
                        {submitted && isCorrect ? "✓" : submitted && isSelected ? "✗" : ["A","B","C","D"][oi]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div style={{ marginTop: "12px", padding: "10px 12px", background: isDark ? "rgba(255,255,255,0.04)" : "#f9f9f9", borderRadius: "8px", color: MUTED, fontSize: "12px", lineHeight: 1.6 }}>
                  <i className="fa-solid fa-lightbulb" style={{ marginRight: "6px", color: "#f59e0b" }} />
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {quizzes.length > 0 && !submitted && (
          <button onClick={submit} style={{ width: "100%", marginTop: "20px", height: "48px", background: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
            {t("Илгээх","Submit Answers")} →
          </button>
        )}
      </div>
    </div>
  );
}
