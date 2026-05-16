"use client";
import { useLang } from "@/hooks/useLang";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const TL: Record<string, Record<string, string>> = {
  add:      { mn:"Нэмэх",      en:"Add",        ja:"追加",     ko:"추가",    fr:"Ajouter",   de:"Hinzufügen",  zh:"添加" },
  save:     { mn:"Хадгалах",   en:"Save",       ja:"保存",     ko:"저장",    fr:"Enregistrer",de:"Speichern",   zh:"保存" },
  cancel:   { mn:"Цуцлах",     en:"Cancel",     ja:"キャンセル",ko:"취소",   fr:"Annuler",   de:"Abbrechen",   zh:"取消" },
  delete:   { mn:"Устгах",     en:"Delete",     ja:"削除",     ko:"삭제",    fr:"Supprimer", de:"Löschen",     zh:"删除" },
  search:   { mn:"Хайх...",    en:"Search...",  ja:"検索...",  ko:"검색...", fr:"Rechercher...",de:"Suchen...", zh:"搜索..." },
  all:      { mn:"Бүгд",       en:"All",        ja:"すべて",   ko:"전체",    fr:"Tous",      de:"Alle",        zh:"全部" },
  ban:      { mn:"Хаах",       en:"Ban",        ja:"禁止",     ko:"차단",    fr:"Bannir",    de:"Sperren",     zh:"封禁" },
  unban:    { mn:"Нээх",       en:"Unban",      ja:"解除",     ko:"차단해제", fr:"Débannir",  de:"Entsperren",  zh:"解封" },
  publish:  { mn:"Нийтлэх",    en:"Publish",    ja:"公開",     ko:"게시",    fr:"Publier",   de:"Veröffentlichen",zh:"发布"},
  draft:    { mn:"Ноорог",     en:"Draft",      ja:"下書き",   ko:"초안",    fr:"Brouillon", de:"Entwurf",     zh:"草稿" },
  refund:   { mn:lang==="mn"?"Буцаах":lang==="ja"?"返金":lang==="ko"?"환불":"Refund",     en:"Refund",     ja:"返金",     ko:"환불",    fr:"Rembourser",de:"Erstatten",   zh:"退款" },
  revenue:  { mn:"Орлого",     en:"Revenue",    ja:"収益",     ko:"수익",    fr:"Revenu",    de:"Umsatz",      zh:"收入" },
  users_page: { mn:"Хэрэглэгч удирдлага", en:"User Management", ja:"ユーザー管理", ko:"사용자 관리", fr:"Gestion Utilisateurs", de:"Benutzerverwaltung", zh:"用户管理" },
  courses_page:{ mn:"Сургалт удирдлага", en:"Course Management",ja:"コース管理",  ko:"강의 관리",  fr:"Gestion Cours",       de:"Kursverwaltung",     zh:"课程管理" },
};
function tl(key: string, lang: string): string { return TL[key]?.[lang] || TL[key]?.en || key; }

const CARD = "rgba(255,255,255,0.04)";
const BORDER = "#1e1e1e";
const MUTED = "#555";

const TRANSACTIONS = [
  { id: 1, user: "Буянбат Т.", plan: "Pro", amount: "₮99,000", method: "QPay", status: "completed", date: "2026-05-13" },
  { id: 2, user: "Tanaka R.", plan: "Basic", amount: "$9", method: "Credit Card", status: "completed", date: "2026-05-13" },
  { id: 3, user: "Kim J.", plan: "Enterprise", amount: "₩135,000", method: "Bank Transfer", status: "pending", date: "2026-05-12" },
  { id: 4, user: "Sarah K.", plan: "Pro", amount: "$29", method: "PayPal", status: "refunded", date: "2026-05-12" },
  { id: 5, user: "李明", plan: "Pro", amount: "¥4,495", method: "Credit Card", status: "completed", date: "2026-05-11" },
];

const STATUS_COLOR: any = { completed: "#34d399", pending: "#f59e0b", refunded: "#f87171" };

export default function PaymentsPage() {
  const { lang } = useLang();
  const [filter, setFilter] = useState("all");
  const filtered = TRANSACTIONS.filter(t => filter === "all" || t.status === filter);

  return (
    <AdminLayout>
      <div style={{ padding: "28px 32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>Payments</h1>
        <p style={{ color: MUTED, fontSize: "13px", marginBottom: "24px" }}>Гүйлгээний бүртгэл</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: lang==="mn"?"Нийт орлого":lang==="ja"?"総収益":lang==="ko"?"총 수익":"Total Revenue", value: "₮48.2M", icon: "fa-money-bill-wave", color: "#34d399" },
            { label: lang==="mn"?"Энэ сарын":lang==="ja"?"今月":lang==="ko"?"이번 달":"This Month", value: "₮8.4M", icon: "fa-chart-line", color: "#999" },
            { label: lang==="mn"?"Хүлээгдэж буй":lang==="ja"?"保留中":lang==="ko"?"대기 중":"Pending", value: "24", icon: "fa-clock", color: "#f59e0b" },
            { label: lang==="mn"?"Буцаасан":lang==="ja"?"返金":lang==="ko"?"환불":"Refunded", value: "3", icon: "fa-rotate-left", color: "#f87171" },
          ].map((s, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "16px" }}>
              <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: "16px", marginBottom: "8px", display: "block" }} />
              <div style={{ color: "#fff", fontSize: "20px", fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: MUTED, fontSize: "11px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {["all","completed","pending","refunded"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: "8px", border: `1px solid ${filter===f?"#999":BORDER}`, background: filter===f?"rgba(255,255,255,0.08)":"transparent", color: filter===f?"#ddd":MUTED, fontSize: "12px", cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {[lang==="mn"?"Хэрэглэгч":lang==="ja"?"ユーザー":lang==="ko"?"사용자":"User","Багц","Дүн","Арга","Статус","Огноо","Үйлдэл"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", color: MUTED, fontSize: "11px", fontWeight: 600, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${BORDER}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px", color: "#ddd", fontSize: "13px" }}>{t.user}</td>
                  <td style={{ padding: "12px 16px", color: "#aaa", fontSize: "12px" }}>{t.plan}</td>
                  <td style={{ padding: "12px 16px", color: "#34d399", fontSize: "13px", fontWeight: 700 }}>{t.amount}</td>
                  <td style={{ padding: "12px 16px", color: "#aaa", fontSize: "12px" }}>{t.method}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: `${STATUS_COLOR[t.status]}22`, color: STATUS_COLOR[t.status], fontSize: "11px", padding: "2px 10px", borderRadius: "10px", fontWeight: 600 }}>{t.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: MUTED, fontSize: "12px" }}>{t.date}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button style={{ background: "none", border: `1px solid ${BORDER}`, color: "#f87171", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                      Буцаах
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
