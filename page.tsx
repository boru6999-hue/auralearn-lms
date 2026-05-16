"use client";
import { useLang } from "@/hooks/useLang";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const BORDER = "#1a1a1a";
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

const CARD = "rgba(255,255,255,0.03)";
const MUTED = "#555";

const INIT_USERS = [
  { id:1, name:"Буянбат Т.", email:"boru@gmail.com", role:"admin", plan:"Enterprise", status:"active", joined:"2024-01-15", courses:12 },
  { id:2, name:"Tanaka Ryu", email:"tanaka@jp.com", role:"student", plan:"Pro", status:"active", joined:"2024-02-20", courses:5 },
  { id:3, name:"Kim Jisoo", email:"kim@kr.com", role:"teacher", plan:"Basic", status:"active", joined:"2024-03-10", courses:8 },
  { id:4, name:"Sarah Kim", email:"sarah@us.com", role:"student", plan:"Pro", status:"banned", joined:"2024-04-05", courses:3 },
  { id:5, name:"李明", email:"li@cn.com", role:"student", plan:"Basic", status:"active", joined:"2024-05-01", courses:2 },
];

export default function UsersPage() {
  const { a } = useLang();
  const [users, setUsers] = useState(INIT_USERS);
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [roleF, setRoleF] = useState("all");
  const [statusF, setStatusF] = useState("all");

  const filtered = users.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleF==="all" || u.role===roleF) && (statusF==="all" || u.status===statusF)
  );

  const inp = { height:"34px", background:"#111", border:`1px solid ${BORDER}`, borderRadius:"7px", padding:"0 10px", color:"#fff", fontSize:"12px", outline:"none" };

  return (
    <AdminLayout>
      <div style={{ padding:"24px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <div>
            <h1 style={{ fontSize:"20px", fontWeight:800, color:"#fff", marginBottom:"3px" }}>{a.users}</h1>
            <p style={{ color:MUTED, fontSize:"12px" }}>{filtered.length} {a.users_count}</p>
          </div>
          <button style={{ background:"#222", color:"#fff", border:`1px solid ${BORDER}`, padding:"7px 14px", borderRadius:"7px", fontSize:"12px", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:"6px" }}>
            <i className="fa-solid fa-user-plus" style={{ fontSize:"11px" }} />{a.add_user}
          </button>
        </div>

        <div style={{ display:"flex", gap:"8px", marginBottom:"14px", flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={a.search_user} style={{ ...inp, width:"220px" }} />
          {["all","student","teacher","admin"].map(r => (
            <button key={r} onClick={()=>setRoleF(r)} style={{ padding:"5px 12px", borderRadius:"7px", border:`1px solid ${roleF===r?"#888":BORDER}`, background:roleF===r?"rgba(255,255,255,0.08)":"transparent", color:roleF===r?"#fff":MUTED, fontSize:"11px", cursor:"pointer" }}>{r}</button>
          ))}
          {["all","active","banned"].map(s => (
            <button key={s} onClick={()=>setStatusF(s)} style={{ padding:"5px 12px", borderRadius:"7px", border:`1px solid ${statusF===s?"#888":BORDER}`, background:statusF===s?"rgba(255,255,255,0.08)":"transparent", color:statusF===s?"#fff":MUTED, fontSize:"11px", cursor:"pointer" }}>{s}</button>
          ))}
        </div>

        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:"10px", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                {[a.user, a.role, a.plan, a.status, a.joined, a.action].map(h => (
                  <th key={h} style={{ padding:"10px 14px", color:MUTED, fontSize:"10px", fontWeight:600, textAlign:"left", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u,i) => (
                <tr key={u.id} style={{ borderBottom:i<filtered.length-1?`1px solid ${BORDER}`:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:`hsl(${u.id*60},20%,20%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:700, color:"#aaa", flexShrink:0 }}>{u.name[0]}</div>
                      <div>
                        <div style={{ color:"#ddd", fontSize:"12px", fontWeight:500 }}>{u.name}</div>
                        <div style={{ color:MUTED, fontSize:"10px" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"10px 14px" }}>
                    <select value={u.role} onChange={e=>setUsers(p=>p.map(x=>x.id===u.id?{...x,role:e.target.value}:x))} style={{ background:"#1a1a1a", border:`1px solid ${BORDER}`, color:"#aaa", borderRadius:"5px", padding:"2px 6px", fontSize:"10px", cursor:"pointer", outline:"none" }}>
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding:"10px 14px", color:"#888", fontSize:"11px" }}>{u.plan}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <span style={{ background:u.status==="active"?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)", color:u.status==="active"?"#34d399":"#f87171", padding:"2px 8px", borderRadius:"8px", fontSize:"10px", fontWeight:600 }}>{u.status}</span>
                  </td>
                  <td style={{ padding:"10px 14px", color:MUTED, fontSize:"11px" }}>{u.joined}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", gap:"4px" }}>
                      <button onClick={()=>setUsers(p=>p.map(x=>x.id===u.id?{...x,status:x.status==="banned"?"active":"banned"}:x))} style={{ background:"none", border:`1px solid ${BORDER}`, color:u.status==="banned"?"#34d399":"#f87171", padding:"4px 7px", borderRadius:"5px", cursor:"pointer", fontSize:"10px" }}>
                        <i className={`fa-solid ${u.status==="banned"?"fa-unlock":"fa-ban"}`} />
                      </button>
                      <button onClick={()=>{if(confirm(a.delete_confirm))setUsers(p=>p.filter(x=>x.id!==u.id))}} style={{ background:"none", border:`1px solid ${BORDER}`, color:"#f87171", padding:"4px 7px", borderRadius:"5px", cursor:"pointer", fontSize:"10px" }}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
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
