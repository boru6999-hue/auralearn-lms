"use client";
import { useLang } from "@/hooks/useLang";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const TL: Record<string, Record<string, string>> = {
  add:      { mn:"Нэмэх",      en:"Add",        ja:"追加",     ko:"추가",    fr:"Ajouter",   de:"Hinzufügen",  zh:"添加" },
  save:     { mn:lang==="mn"?"Хадгалах":lang==="ja"?"保存":lang==="ko"?"저장":"Save",   en:"Save",       ja:"保存",     ko:"저장",    fr:"Enregistrer",de:"Speichern",   zh:"保存" },
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

export default function SettingsPage() {
  const { lang } = useLang();
  const [settings, setSettings] = useState({
    siteName: "AuraLearn", siteUrl: "https://auralearn.mn",
    currency: "MNT", language: "mn",
    smtpHost: "smtp.resend.com", smtpPort: "587",
    maintenanceMode: false, registrationOpen: true,
  });

  const inputSt = { width: "100%", height: "38px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0 12px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" as const };

  return (
    <AdminLayout>
      <div style={{ padding: "28px 32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>Settings</h1>
        <p style={{ color: MUTED, fontSize: "13px", marginBottom: "28px" }}>Системийн тохиргоо</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* General */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
              <i className="fa-solid fa-globe" style={{ marginRight: "8px", color: "#999" }} />General
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Сайтын нэр</label>
                <input value={settings.siteName} onChange={e=>setSettings(s=>({...s,siteName:e.target.value}))} style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>URL</label>
                <input value={settings.siteUrl} onChange={e=>setSettings(s=>({...s,siteUrl:e.target.value}))} style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Валют</label>
                <select value={settings.currency} onChange={e=>setSettings(s=>({...s,currency:e.target.value}))} style={inputSt}>
                  <option value="MNT">MNT — Төгрөг</option>
                  <option value="USD">USD — Dollar</option>
                  <option value="JPY">JPY — Yen</option>
                </select></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>Хэл</label>
                <select value={settings.language} onChange={e=>setSettings(s=>({...s,language:e.target.value}))} style={inputSt}>
                  <option value="mn">Монгол</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select></div>
            </div>
          </div>

          {/* Email */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
              <i className="fa-solid fa-envelope" style={{ marginRight: "8px", color: "#aaa" }} />Email / SMTP
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>SMTP Host</label>
                <input value={settings.smtpHost} onChange={e=>setSettings(s=>({...s,smtpHost:e.target.value}))} style={inputSt} /></div>
              <div><label style={{ color: MUTED, fontSize: "11px", display: "block", marginBottom: "5px" }}>SMTP Port</label>
                <input value={settings.smtpPort} onChange={e=>setSettings(s=>({...s,smtpPort:e.target.value}))} style={inputSt} /></div>
            </div>
          </div>

          {/* System */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
              <i className="fa-solid fa-shield" style={{ marginRight: "8px", color: "#f59e0b" }} />System
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { key: "maintenanceMode", label: "Maintenance Mode", desc: "Сайтыг засвар горимд оруул" },
                { key: "registrationOpen", label: "Registration Open", desc: "Шинэ бүртгэл нээлттэй эсэх" },
              ].map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#ddd", fontSize: "13px" }}>{item.label}</div>
                    <div style={{ color: MUTED, fontSize: "11px" }}>{item.desc}</div>
                  </div>
                  <div onClick={() => setSettings(s => ({...s, [item.key]: !(s as any)[item.key]}))}
                    style={{ width: "40px", height: "22px", borderRadius: "11px", background: (settings as any)[item.key]?"#999":"#333", cursor: "pointer", position: "relative", transition: "all 0.2s" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: (settings as any)[item.key]?"21px":"3px", transition: "all 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: "8px", color: "#34d399" }} />Save Changes
            </h3>
            <p style={{ color: MUTED, fontSize: "12px", marginBottom: "16px" }}>Тохиргоог хадгалахын өмнө шалгаад баталгаажуулна уу.</p>
            <button style={{ width: "100%", background: "#333", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
              <i className="fa-solid fa-check" style={{ marginRight: "8px" }} />Хадгалах
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
