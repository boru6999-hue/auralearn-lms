"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminUsersPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoad]  = useState(true);
  const [search, setSearch] = useState("");
  const [roleF, setRoleF]   = useState("all");

  const t = (mn: string, en: string, ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(() => {
    fetch("/api/admin/users").then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setUsers(d); }).catch(()=>{}).finally(()=>setLoad(false));
  }, []);

  async function changeRole(id: string, role: string) {
    await fetch("/api/admin/users", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, role }) });
    setUsers(p => p.map(u => u._id===id ? {...u,role} : u));
  }

  async function toggleBan(id: string, status: string) {
    const s = status==="banned" ? "active" : "banned";
    await fetch("/api/admin/users", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, status:s }) });
    setUsers(p => p.map(u => u._id===id ? {...u,status:s} : u));
  }

  async function del(id: string) {
    if (!confirm(t("Устгах уу?","Delete this user?"))) return;
    await fetch("/api/admin/users", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setUsers(p => p.filter(u => u._id!==id));
  }

  if (!mounted) return null;

  const BG    = isDark ? "#0a0a0f" : "#F2F0EB";
  const TEXT  = isDark ? "#fff" : "#1a1a1a";
  const MUTED = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const RULE  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const HOVER = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";

  const filtered = users.filter(u =>
    ((u.name||"").toLowerCase().includes(search.toLowerCase()) || (u.email||"").toLowerCase().includes(search.toLowerCase())) &&
    (roleF==="all" || u.role===roleF)
  );

  const ROLE_COLOR: any = { admin:"#22c55e", premium:"#B5863A", student:MUTED };

  return (
    <AdminLayout>
      <div style={{ padding:"40px 48px", background:BG, minHeight:"100vh" }}>

        {/* Header */}
        <div style={{ marginBottom:"32px", paddingBottom:"24px", borderBottom:`1px solid ${RULE}` }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.16em", textTransform:"uppercase", color:MUTED, marginBottom:"6px" }}>
            {t("Удирдлага","Management","管理","관리","Gestion","Verwaltung","管理")}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <h1 style={{ fontSize:"28px", fontWeight:300, color:TEXT, letterSpacing:"-1px" }}>
              {t("Хэрэглэгчид","Users","ユーザー","사용자","Utilisateurs","Benutzer","用户")}
              <span style={{ fontSize:"16px", color:MUTED, marginLeft:"12px" }}>{filtered.length}</span>
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", alignItems:"center", gap:"24px", marginBottom:"24px", flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t("Хайх...","Search...","検索...","검색...","Rechercher...","Suchen...","搜索...")}
            style={{ height:"34px", background:"transparent", border:"none", borderBottom:`1px solid ${RULE}`, outline:"none", color:TEXT, fontSize:"13px", fontWeight:300, width:"200px", fontFamily:"inherit" }}/>
          <div style={{ display:"flex", gap:"0", borderBottom:`1px solid ${RULE}` }}>
            {["all","student","premium","admin"].map(r=>(
              <button key={r} onClick={()=>setRoleF(r)} style={{ padding:"8px 14px", background:"none", border:"none", cursor:"pointer", fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase", color:roleF===r?TEXT:MUTED, borderBottom:roleF===r?`1px solid ${TEXT}`:"1px solid transparent", marginBottom:"-1px", fontFamily:"inherit" }}>
                {r==="all"?t("Бүгд","All","すべて","전체","Tous","Alle","全部"):r}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        {loading ? (
          <div style={{ padding:"40px 0", fontSize:"12px", color:MUTED, fontWeight:300 }}>
            {t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}
          </div>
        ) : filtered.length===0 ? (
          <div style={{ padding:"40px 0", fontSize:"12px", color:MUTED, fontWeight:300 }}>
            {t("Хэрэглэгч олдсонгүй","No users found","ユーザーなし","사용자 없음","Aucun utilisateur","Kein Benutzer","未找到用户")}
          </div>
        ) : filtered.map((u,i) => (
          <div key={u._id||i} style={{ display:"grid", gridTemplateColumns:"1fr 120px 100px 80px auto", alignItems:"center", gap:"16px", padding:"14px 0", borderBottom:`1px solid ${RULE}`, transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background=HOVER}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

            {/* User info */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px", minWidth:0 }}>
              {u.image&&u.image.length<500?(
                <img src={u.image} style={{ width:"28px", height:"28px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} alt=""/>
              ):(
                <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", color:TEXT, flexShrink:0 }}>
                  {(u.name||u.email||"?")[0].toUpperCase()}
                </div>
              )}
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:"13px", fontWeight:300, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name||u.email?.split("@")[0]||"—"}</div>
                <div style={{ fontSize:"11px", color:MUTED, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</div>
              </div>
            </div>

            {/* Role selector */}
            <select value={u.role||"student"} onChange={e=>changeRole(u._id,e.target.value)}
              style={{ background:"transparent", border:"none", outline:"none", color:ROLE_COLOR[u.role||"student"], fontSize:"11px", cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.06em" }}>
              <option value="student">student</option>
              <option value="premium">premium</option>
              <option value="admin">admin</option>
            </select>

            {/* Status */}
            <span style={{ fontSize:"10px", color:(u.status||"active")==="banned"?"#ef4444":"#22c55e", letterSpacing:"0.08em" }}>
              {(u.status||"active")==="banned"
                ?t("Хаасан","Banned","凍結","정지됨","Banni","Gesperrt","已封禁")
                :t("Идэвхтэй","Active","アクティブ","활성","Actif","Aktiv","活跃")}
            </span>

            {/* Date */}
            <span style={{ fontSize:"11px", color:MUTED }}>
              {u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}
            </span>

            {/* Actions */}
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={()=>toggleBan(u._id,u.status||"active")} style={{ background:"none", border:"none", color:(u.status||"active")==="banned"?"#22c55e":"#ef4444", cursor:"pointer", fontSize:"11px", padding:"4px", fontFamily:"inherit" }}>
                <i className={`fa-solid ${(u.status||"active")==="banned"?"fa-unlock":"fa-ban"}`}/>
              </button>
              <button onClick={()=>del(u._id)} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", fontSize:"11px", padding:"4px" }}>
                <i className="fa-solid fa-trash"/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
