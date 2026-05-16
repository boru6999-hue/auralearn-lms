"use client";
import { useLang } from "@/hooks/useLang";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const TL: Record<string, Record<string, string>> = {
  add:      { mn:lang==="mn"?"Нэмэх":lang==="ja"?"追加":lang==="ko"?"추가":"Add",      en:"Add",        ja:"追加",     ko:"추가",    fr:"Ajouter",   de:"Hinzufügen",  zh:"添加" },
  save:     { mn:"Хадгалах",   en:"Save",       ja:"保存",     ko:"저장",    fr:"Enregistrer",de:"Speichern",   zh:"保存" },
  cancel:   { mn:"Цуцлах",     en:"Cancel",     ja:"キャンセル",ko:"취소",   fr:"Annuler",   de:"Abbrechen",   zh:"取消" },
  delete:   { mn:"Устгах",     en:"Delete",     ja:"削除",     ko:"삭제",    fr:"Supprimer", de:"Löschen",     zh:"删除" },
  search:   { mn:"Хайх...",    en:"Search...",  ja:"検索...",  ko:"검색...", fr:"Rechercher...",de:"Suchen...", zh:"搜索..." },
  all:      { mn:"Бүгд",       en:"All",        ja:"すべて",   ko:"전체",    fr:"Tous",      de:"Alle",        zh:"全部" },
  ban:      { mn:"Хаах",       en:"Ban",        ja:"禁止",     ko:"차단",    fr:"Bannir",    de:"Sperren",     zh:"封禁" },
  unban:    { mn:"Нээх",       en:"Unban",      ja:"解除",     ko:"차단해제", fr:"Débannir",  de:"Entsperren",  zh:"解封" },
  publish:  { mn:"Нийтлэх",    en:"Publish",    ja:"公開",     ko:"게시",    fr:"Publier",   de:"Veröffentlichen",zh:"发布"},
  draft:    { mn:"Ноорог",     en:"Draft",      ja:"下書き",   ko:"초안",    fr:"Brouillon", de:"Entwurf",     zh:"草稿" },
  refund:   { mn:"Буцаах",     en:"Refund",     ja:"返金",     ko:"환불",    fr:"Rembourser",de:"Erstatten",   zh:"退款" },
  revenue:  { mn:"Орлого",     en:"Revenue",    ja:"収益",     ko:"수익",    fr:"Revenu",    de:"Umsatz",      zh:"收入" },
  users_page: { mn:"Хэрэглэгч удирдлага", en:"User Management", ja:"ユーザー管理", ko:"사용자 관리", fr:"Gestion Utilisateurs", de:"Benutzerverwaltung", zh:"用户管理" },
  courses_page:{ mn:"Сургалт удирдлага", en:"Course Management",ja:"コース管理",  ko:"강의 관리",  fr:"Gestion Cours",       de:"Kursverwaltung",     zh:"课程管理" },
};
function tl(key: string, lang: string): string { return TL[key]?.[lang] || TL[key]?.en || key; }

const CARD = "rgba(255,255,255,0.04)";
const BORDER = "#1e1e1e";
const MUTED = "#555";

const MOCK_STREAMS = [
  { id: 1, title: "English Conversation Class", host: "Sarah Kim", scheduled: "Өнөөдөр 18:00", seats: 20, enrolled: 8, status: "live" },
  { id: 2, title: "React Live Coding Session", host: "Alex M.", scheduled: "Маргааш 15:00", seats: 30, enrolled: 12, status: "scheduled" },
  { id: 3, title: "Japanese Speaking Practice", host: "Tanaka R.", scheduled: "Маргааш 10:00", seats: 15, enrolled: 15, status: "scheduled" },
  { id: 4, title: "Python Workshop", host: "David L.", scheduled: "Нөгөөдөр 16:00", seats: 25, enrolled: 5, status: "scheduled" },
];

export default function LivePage() {
  const { lang } = useLang();
  const [streams, setStreams] = useState(MOCK_STREAMS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", host: "", scheduled: "", seats: "20" });

  function deleteStream(id: number) {
    if (confirm(lang==="mn"?"Устгах уу?":"Delete this stream?")) setStreams(prev => prev.filter(s => s.id !== id));
  }
  function endLive(id: number) {
    setStreams(prev => prev.map(s => s.id === id ? { ...s, status: "ended" } : s));
  }
  function addStream() {
    setStreams(prev => [...prev, { id: Date.now(), ...form, seats: Number(form.seats), enrolled: 0, status: "scheduled" }]);
    setShowModal(false);
    setForm({ title: "", host: "", scheduled: "", seats: "20" });
  }

  const STATUS_COLOR: any = { live: "#ef4444", scheduled: "#999", ended: "#555" };
  const inputSt = { width: "100%", height: "38px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0 12px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" as const };

  return (
    <AdminLayout>
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>Live Stream</h1>
            </div>
            <p style={{ color: MUTED, fontSize: "13px" }}>{streams.filter(s=>s.status==="live").length} live · {streams.filter(s=>s.status==="scheduled").length} scheduled</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="fa-solid fa-circle-dot" /> Шинэ stream
          </button>
        </div>

        {/* Live now */}
        {streams.filter(s => s.status === "live").map(s => (
          <div key={s.id} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-circle-dot" style={{ color: "#ef4444", fontSize: "20px" }} />
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>{s.title}</div>
                <div style={{ color: "#aaa", fontSize: "12px" }}>{s.host} · {s.enrolled}/{s.seats} суудал</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                <i className="fa-solid fa-video" style={{ marginRight: "6px" }} />Нэвтрэх
              </button>
              <button onClick={() => endLive(s.id)} style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Дуусгах</button>
            </div>
          </div>
        ))}

        {/* Scheduled */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "12px" }}>
          {streams.filter(s => s.status !== "live").map(s => (
            <div key={s.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ background: `${STATUS_COLOR[s.status]}22`, color: STATUS_COLOR[s.status], fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>{s.status.toUpperCase()}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={() => deleteStream(s.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "12px" }}><i className="fa-solid fa-trash" /></button>
                </div>
              </div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>{s.title}</div>
              <div style={{ color: MUTED, fontSize: "12px", marginBottom: "4px" }}><i className="fa-solid fa-user" style={{ marginRight: "4px" }} />{s.host}</div>
              <div style={{ color: MUTED, fontSize: "12px", marginBottom: "4px" }}><i className="fa-solid fa-clock" style={{ marginRight: "4px" }} />{s.scheduled}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <div style={{ color: "#aaa", fontSize: "12px" }}>{s.enrolled}/{s.seats} бүртгэлтэй</div>
                <div style={{ width: "80px", height: "4px", background: "#1a1a1a", borderRadius: "2px" }}>
                  <div style={{ height: "100%", background: "#333", borderRadius: "2px", width: `${(s.enrolled/s.seats)*100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px", width: "400px" }}>
            <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Шинэ Live Stream</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Гарчиг</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Багш</label><input value={form.host} onChange={e=>setForm(f=>({...f,host:e.target.value}))} style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Цаг</label><input value={form.scheduled} onChange={e=>setForm(f=>({...f,scheduled:e.target.value}))} placeholder="Маргааш 18:00" style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Суудал</label><input value={form.seats} onChange={e=>setForm(f=>({...f,seats:e.target.value}))} type="number" style={inputSt} /></div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={addStream} style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Нэмэх</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "none", border: `1px solid ${BORDER}`, color: MUTED, padding: "10px", borderRadius: "8px", cursor: "pointer" }}>Цуцлах</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </AdminLayout>
  );
}
