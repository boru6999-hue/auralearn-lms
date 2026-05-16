"use client";
import { useLang } from "@/hooks/useLang";
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
  refund:   { mn:"Буцаах",     en:"Refund",     ja:"返金",     ko:"환불",    fr:"Rembourser",de:"Erstatten",   zh:"退款" },
  revenue:  { mn:"Орлого",     en:"Revenue",    ja:"収益",     ko:"수익",    fr:"Revenu",    de:"Umsatz",      zh:"收入" },
  users_page: { mn:"Хэрэглэгч удирдлага", en:"User Management", ja:"ユーザー管理", ko:"사용자 관리", fr:"Gestion Utilisateurs", de:"Benutzerverwaltung", zh:"用户管理" },
  courses_page:{ mn:"Сургалт удирдлага", en:"Course Management",ja:"コース管理",  ko:"강의 관리",  fr:"Gestion Cours",       de:"Kursverwaltung",     zh:"课程管理" },
};
function tl(key: string, lang: string): string { return TL[key]?.[lang] || TL[key]?.en || key; }

const CARD = "rgba(255,255,255,0.04)";
const BORDER = "#1e1e1e";
const MUTED = "#555";
const ACCENT = "#888";

const MONTHLY = [30,45,38,60,52,75,68,85,72,90,80,100];
const USERS_DATA = [120,180,150,220,190,280,250,310,270,380,330,420];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function MiniChart({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "60px" }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, background: `${color}33`, borderRadius: "3px 3px 0 0", height: `${(v/max)*56}px`, transition: "all 0.3s" }}
          onMouseEnter={e => e.currentTarget.style.background = `${color}88`}
          onMouseLeave={e => e.currentTarget.style.background = `${color}33`} />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const maxRev = Math.max(...MONTHLY);
  const maxUsers = Math.max(...USERS_DATA);

  return (
    <AdminLayout>
      <div style={{ padding: "28px 32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>Analytics</h1>
        <p style={{ color: MUTED, fontSize: "13px", marginBottom: "24px" }}>Өсөлт ба статистик</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

          {/* Revenue chart */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Revenue Growth</h3>
            <div style={{ color: "#34d399", fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>+127%</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
              {MONTHLY.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "100%", background: "rgba(255,255,255,0.2)", borderRadius: "4px 4px 0 0", height: `${(v/maxRev)*100}px`, opacity: 0.8 }} />
                  <span style={{ fontSize: "8px", color: MUTED }}>{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User growth */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>User Growth</h3>
            <div style={{ color: "#999", fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>+250%</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
              {USERS_DATA.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "100%", background: "#333", borderRadius: "4px 4px 0 0", height: `${(v/maxUsers)*100}px`, opacity: 0.7 }} />
                  <span style={{ fontSize: "8px", color: MUTED }}>{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
          {[
            { label: "Course completion", value: "68%", trend: "+5%", color: "#34d399" },
            { label: "Avg. watch time", value: "42 мин", trend: "+8%", color: "#aaa" },
            { label: "Conversion rate", value: "3.2%", trend: "+0.4%", color: "#f59e0b" },
            { label: "Retention (30d)", value: "71%", trend: "+3%", color: "#999" },
          ].map((k, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "16px" }}>
              <div style={{ color: MUTED, fontSize: "11px", marginBottom: "6px" }}>{k.label}</div>
              <div style={{ color: "#fff", fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>{k.value}</div>
              <div style={{ color: k.color, fontSize: "11px", fontWeight: 600 }}>{k.trend} this month</div>
              <MiniChart data={[40,50,45,60,55,70,65,80,75,85,80,90].slice(0,8)} color={k.color} />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
