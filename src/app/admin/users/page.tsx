"use client";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const ROLE_COLOR: any = {
  admin:   "#f59e0b",
  premium: "#34d399",
  student: "#888",
};

export default function UsersPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoad]  = useState(true);
  const [search, setSearch] = useState("");
  const [roleF, setRoleF]   = useState("all");

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  const BG    =isDark?"#0a0a0a":"#f5f5f5";
  const CARD  =isDark?"rgba(255,255,255,0.04)":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e5e5e5";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#888";
  const INP={height:"36px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:"8px",padding:"0 12px",color:TEXT,fontSize:"13px",outline:"none"} as React.CSSProperties;

  useEffect(()=>{
    setLoad(true);
    fetch("/api/admin/users").then(r=>r.json()).then(d=>{if(Array.isArray(d))setUsers(d);}).catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  async function changeRole(id:string, role:string){
    await fetch("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,role})});
    setUsers(p=>p.map(u=>u._id===id?{...u,role}:u));
  }
  async function toggleBan(id:string, status:string){
    const s=status==="banned"?"active":"banned";
    await fetch("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:s})});
    setUsers(p=>p.map(u=>u._id===id?{...u,status:s}:u));
  }
  async function del(id:string){
    if(!confirm(t("Устгах уу?","Delete this user?","削除しますか？","삭제하시겠습니까?","Supprimer?","Löschen?","删除？")))return;
    await fetch("/api/admin/users",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setUsers(p=>p.filter(u=>u._id!==id));
  }

  const filtered=users.filter(u=>
    ((u.name||"").toLowerCase().includes(search.toLowerCase())||(u.email||"").toLowerCase().includes(search.toLowerCase()))&&
    (roleF==="all"||u.role===roleF)
  );

  if(!mounted)return<div style={{minHeight:"100vh",background:"#000"}}/>;

  return(
    <AdminLayout>
      <div style={{padding:"28px 32px",background:BG,minHeight:"100vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
          <div>
            <h1 style={{fontSize:"20px",fontWeight:800,color:TEXT,marginBottom:"3px"}}>
              {t("Хэрэглэгчид","Users","ユーザー","사용자","Utilisateurs","Benutzer","用户")}
            </h1>
            <p style={{color:MUTED,fontSize:"12px"}}>
              {loading?t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中..."):(`${filtered.length} ${t("хэрэглэгч","users","ユーザー","사용자","utilisateurs","Benutzer","用户")}`)}
            </p>
          </div>
          {/* Role legend */}
          <div style={{display:"flex",gap:"8px"}}>
            {[{r:"admin",l:"Admin"},{r:"premium",l:"Premium"},{r:"student",l:"Student"}].map(x=>(
              <span key={x.r} style={{background:`${ROLE_COLOR[x.r]}18`,color:ROLE_COLOR[x.r],fontSize:"11px",padding:"3px 10px",borderRadius:"10px",fontWeight:600}}>{x.l}</span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t("Хайх...","Search...","検索...","검색...","Rechercher...","Suchen...","搜索...")}
            style={{...INP,width:"220px"}}/>
          {["all","student","premium","admin"].map(r=>(
            <button key={r} onClick={()=>setRoleF(r)} style={{padding:"5px 12px",borderRadius:"7px",border:`1px solid ${roleF===r?TEXT:BORDER}`,background:roleF===r?(isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"):"transparent",color:roleF===r?TEXT:MUTED,fontSize:"12px",cursor:"pointer",textTransform:"capitalize"}}>
              {r==="all"?t("Бүгд","All","すべて","전체","Tous","Alle","全部"):r}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading?(
          <div style={{textAlign:"center",padding:"60px",color:MUTED}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
          </div>
        ):(
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${BORDER}`}}>
                  {[t("Хэрэглэгч","User","ユーザー","사용자","Utilisateur","Benutzer","用户"),t("Үүрэг","Role","役割","역할","Rôle","Rolle","角色"),"Status",t("Бүртгэсэн","Joined","登録日","가입일","Inscrit","Beigetreten","加入"),t("Үйлдэл","Action","操作","액션","Action","Aktion","操作")].map(h=>(
                    <th key={h} style={{padding:"11px 16px",color:MUTED,fontSize:"10px",fontWeight:600,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0?(
                  <tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:MUTED}}>{t("Хэрэглэгч олдсонгүй","No users found","ユーザーが見つかりません","사용자를 찾을 수 없음","Aucun utilisateur","Kein Benutzer","未找到用户")}</td></tr>
                ):filtered.map((u,i)=>(
                  <tr key={u._id} style={{borderBottom:i<filtered.length-1?`1px solid ${BORDER}`:"none"}}
                    onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                        {u.image&&u.image.length<500?(
                          <img src={u.image} style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover"}} alt=""/>
                        ):(
                          <div style={{width:"32px",height:"32px",borderRadius:"50%",background:isDark?`hsl(${(u.name||"A").charCodeAt(0)*13%360},25%,25%)`:`hsl(${(u.name||"A").charCodeAt(0)*13%360},30%,85%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,color:TEXT,flexShrink:0}}>
                            {(u.name||"?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{color:TEXT,fontSize:"13px",fontWeight:500}}>{u.name||u.email?.split("@")[0]||"—"}</div>
                          <div style={{color:MUTED,fontSize:"11px"}}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"12px 16px"}}>
                      <select value={u.role||"student"} onChange={e=>changeRole(u._id,e.target.value)}
                        style={{background:`${ROLE_COLOR[u.role||"student"]}18`,border:`1px solid ${ROLE_COLOR[u.role||"student"]}44`,color:ROLE_COLOR[u.role||"student"],borderRadius:"6px",padding:"3px 10px",fontSize:"11px",cursor:"pointer",outline:"none",fontWeight:600}}>
                        <option value="student">student</option>
                        <option value="premium">premium</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{background:(u.status||"active")==="banned"?"rgba(248,113,113,0.15)":"rgba(52,211,153,0.15)",color:(u.status||"active")==="banned"?"#f87171":"#34d399",padding:"2px 10px",borderRadius:"10px",fontSize:"11px",fontWeight:600}}>
                        {(u.status||"active")==="banned"?t("Хаасан","Banned","凍結","정지됨","Banni","Gesperrt","已封禁"):t("Идэвхтэй","Active","アクティブ","활성","Actif","Aktiv","活跃")}
                      </span>
                    </td>
                    <td style={{padding:"12px 16px",color:MUTED,fontSize:"12px"}}>
                      {u.createdAt?new Date(u.createdAt).toLocaleDateString(lang==="mn"?"mn-MN":"en-US"):"—"}
                    </td>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",gap:"6px"}}>
                        <button onClick={()=>toggleBan(u._id,u.status||"active")}
                          style={{background:"none",border:`1px solid ${BORDER}`,color:(u.status||"active")==="banned"?"#34d399":"#f87171",padding:"4px 8px",borderRadius:"6px",cursor:"pointer",fontSize:"11px"}}>
                          <i className={`fa-solid ${(u.status||"active")==="banned"?"fa-unlock":"fa-ban"}`}/>
                        </button>
                        <button onClick={()=>del(u._id)}
                          style={{background:"none",border:`1px solid ${BORDER}`,color:"#f87171",padding:"4px 8px",borderRadius:"6px",cursor:"pointer",fontSize:"11px"}}>
                          <i className="fa-solid fa-trash"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}