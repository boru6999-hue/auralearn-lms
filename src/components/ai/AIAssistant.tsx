"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoad] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = (mn: string, en: string) => lang === "mn" ? mn : en;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: t(
          "Сайн байна уу! Би AuraLearn-ийн AI туслах. Сургалт, хэл, програмчлал болон бусад сэдвээр асуулт тавина уу! 😊",
          "Hi! I'm AuraLearn's AI assistant. Ask me anything about courses, languages, programming, and more! 😊"
        )
      }]);
    }
  }, [open]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoad(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: userMsg }],
          lang,
        })
      });
      const data = await res.json();
      const text = data.text || data.error || t("Алдаа гарлаа", "An error occurred");
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: t("Холболт алдаатай байна. Дахин оролдоно уу.", "Connection error. Please try again.") }]);
    }
    setLoad(false);
  }

  if (!mounted) return null;

  const BG     = isDark ? "#111"    : "#fff";
  const BORDER = isDark ? "#1e1e1e" : "#e5e5e5";
  const TEXT   = isDark ? "#fff"    : "#000";
  const MUTED  = isDark ? "#666"    : "#999";
  const INPUT_BG = isDark ? "#1a1a1a" : "#f5f5f5";

  // Format message with code blocks
  function formatMsg(text: string) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```[\w]*\n?/, "").replace(/```$/, "");
        return (
          <pre key={i} style={{ background: isDark ? "#0a0a0a" : "#f0f0f0", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "10px 12px", fontSize: "12px", overflowX: "auto", margin: "6px 0", fontFamily: "monospace", color: TEXT, lineHeight: 1.5 }}>
            {code}
          </pre>
        );
      }
      return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    });
  }

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)} style={{
        position: "fixed", bottom: "24px", right: "24px", zIndex: 999,
        width: "52px", height: "52px", borderRadius: "50%",
        background: isDark ? "#fff" : "#000",
        color: isDark ? "#000" : "#fff",
        border: "none", cursor: "pointer", fontSize: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {open ? <i className="fa-solid fa-xmark" /> : <i className="fa-solid fa-robot" />}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "88px", right: "24px", zIndex: 998,
          width: "360px", maxWidth: "calc(100vw - 48px)",
          height: "500px", maxHeight: "70vh",
          background: BG, border: `1px solid ${BORDER}`,
          borderRadius: "16px", display: "flex", flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          fontFamily: "'Inter',-apple-system,sans-serif",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
              🤖
            </div>
            <div>
              <div style={{ color: TEXT, fontSize: "13px", fontWeight: 700 }}>AuraLearn AI</div>
              <div style={{ color: "#34d399", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                {t("Онлайн","Online")}
              </div>
            </div>
            <button onClick={() => setMessages([])} title={t("Арилгах","Clear")} style={{ marginLeft: "auto", background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "12px" }}>
              <i className="fa-solid fa-trash" />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%",
                  background: msg.role === "user" ? (isDark ? "#fff" : "#000") : (isDark ? "rgba(255,255,255,0.06)" : "#f5f5f5"),
                  color: msg.role === "user" ? (isDark ? "#000" : "#fff") : TEXT,
                  padding: "9px 12px", borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  fontSize: "13px", lineHeight: 1.5,
                }}>
                  {formatMsg(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f5f5", padding: "10px 14px", borderRadius: "12px 12px 12px 2px", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: MUTED, display: "inline-block", animation: `bounce 1s ${i*0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={t("Асуулт бичнэ үү...","Ask anything...")}
              style={{ flex: 1, height: "38px", background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "0 12px", color: TEXT, fontSize: "13px", outline: "none" }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{
              width: "38px", height: "38px", borderRadius: "10px", border: "none",
              background: input.trim() && !loading ? (isDark ? "#fff" : "#000") : (isDark ? "#222" : "#ddd"),
              color: input.trim() && !loading ? (isDark ? "#000" : "#fff") : MUTED,
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
              transition: "all 0.15s",
            }}>
              <i className="fa-solid fa-paper-plane" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
