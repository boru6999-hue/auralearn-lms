"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminCoursesPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoad]   = useState(true);
  const [search, setSearch]  = useState("");
  const [modal, setModal]    = useState(false);
  const [editing, setEditing]= useState<any>(null);
  const [form, setForm]      = useState({title:"",slug:"",description:"",category:"development",level:"beginner",instructor:"",thumbnail:"",status:"draft"});
  const [saving, setSave]    = useState(false);
  const [delConfirm, setDel] = useState<string|null>(null);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    fetch("/api/admin/courses").then(r=>r.json()).then(d=>{if(Array.isArray(d))setCourses(d);}).catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  async function save() {
    setSave(true);
    try {
      if(editing) {
        await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editing._id,...form})});
        setCourses(p=>p.map(c=>c._id===editing._id?{...c,...form}:c));
      } else {
        const res = await fetch("/api/admin/courses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
        const data = await res.json();
        setCourses(p=>[data,...p]);
      }
      closeModal();
    } catch {}
    setSave(false);
  }

  async function togglePublish(id:string, status:string) {
    const ns = status==="published"?"draft":"published";
    await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:ns})});
    setCourses(p=>p.map(c=>c._id===id?{...c,status:ns}:c));
  }

  async function del(id:string) {
    await fetch("/api/admin/courses",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setCourses(p=>p.filter(c=>c._id!==id));
    setDel(null);
  }

  function openEdit(c:any) {
    setEditing(c);
    setForm({title:c.title||"",slug:c.slug||"",description:c.description||"",category:c.category||"development",level:c.level||"beginner",instructor:c.instructor||"",thumbnail:c.thumbnail||"",status:c.status||"draft"});
    setModal(true);
  }

  function closeModal() { setModal(false); setEditing(null); setForm({title:"",slug:"",description:"",category:"development",level:"beginner",instructor:"",thumbnail:"",status:"draft"}); }

  function autoSlug(title:string) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
  }

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
        HOVER=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)",
        DROP=isDark?"#111":"#fff",DROPB=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)";
  const INP={width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"14px",fontWeight:300,padding:"9px 0",fontFamily:"inherit"} as React.CSSProperties;
  const SEL={...INP,cursor:"pointer"} as React.CSSProperties;

  const filtered = courses.filter(c=>(c.title||"").toLowerCase().includes(search.toLowerCase()));

  const CATS=["language","development","design","business"];
  const LEVELS=["beginner","intermediate","advanced"];
  const CAT_LBL:any={language:t("Хэл","Language"),development:t("Хөгжүүлэлт","Development"),design:t("Дизайн","Design"),business:t("Бизнес","Business")};
  const LVL_LBL:any={beginner:t("Анхан","Beginner"),intermediate:t("Дунд","Intermediate"),advanced:t("Ахисан","Advanced")};

  return (
    <AdminLayout>
      <div style={{padding:"clamp(24px,4vw,40px) clamp(20px,4vw,48px)",background:BG,minHeight:"100vh"}}>

        {/* Header */}
        <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"12px"}}>
            <h1 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
              {t("Сургалтууд","Courses","コース","강의","Cours","Kurse","课程")}
              <span style={{fontSize:"16px",color:MUTED,marginLeft:"10px"}}>{filtered.length}</span>
            </h1>
            <button onClick={()=>setModal(true)} style={{padding:"9px 20px",background:TEXT,color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px"}}>
              <i className="fa-solid fa-plus" style={{fontSize:"11px"}}/>
              {t("Сургалт нэмэх","Add course","コース追加","강의 추가","Ajouter","Hinzufügen","添加课程")}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{marginBottom:"24px"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t("Хайх...","Search...","検索...","검색...","Rechercher...","Suchen...","搜索...")}
            style={{...INP,width:"260px"}}/>
        </div>

        {/* Course list */}
        {loading?(
          <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}</div>
        ):filtered.length===0?(
          <div style={{padding:"48px 0",textAlign:"center"}}>
            <div style={{fontSize:"13px",color:MUTED,fontWeight:300,marginBottom:"16px"}}>{t("Сургалт байхгүй","No courses yet","コースなし","강의 없음","Aucun cours","Keine Kurse","暂无课程")}</div>
            <button onClick={()=>setModal(true)} style={{padding:"9px 20px",background:TEXT,color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
              {t("Эхний сургалт нэмэх","Add first course")}
            </button>
          </div>
        ):(
          <>
            {/* Table header */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 120px 100px 80px 100px",gap:"16px",padding:"0 0 10px",borderBottom:`1px solid ${RULE}`}}>
              {[t("Сургалт","Course","コース","강의","Cours","Kurs","课程"),
                t("Ангилал","Category","カテゴリ","카테고리","Catégorie","Kategorie","分类"),
                t("Түвшин","Level","レベル","레벨","Niveau","Niveau","级别"),
                t("Статус","Status","状態","상태","Statut","Status","状态"),
                t("Үйлдэл","Actions","操作","작업","Actions","Aktionen","操作"),
              ].map((h,i)=>(
                <span key={i} style={{fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",color:MUTED}}>{h}</span>
              ))}
            </div>
            <div style={{overflowX:"auto"}}>
              <div style={{minWidth:"560px"}}>
                {filtered.map((c:any,i:number)=>(
                  <div key={c._id||i} style={{display:"grid",gridTemplateColumns:"1fr 120px 100px 80px 100px",gap:"16px",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:"13px",fontWeight:300,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                      <div style={{fontSize:"11px",color:MUTED,marginTop:"1px"}}>{c.instructor||"—"} · {(c.sections||[]).reduce((a:number,s:any)=>a+(s.lessons||[]).length,0)} {t("хичээл","lessons","レッスン","레슨","leçons","Lektionen","课")}</div>
                    </div>
                    <span style={{fontSize:"11px",color:MUTED}}>{CAT_LBL[c.category]||c.category}</span>
                    <span style={{fontSize:"11px",color:MUTED}}>{LVL_LBL[c.level]||c.level}</span>
                    <span style={{fontSize:"10px",color:c.status==="published"?"#22c55e":MUTED,letterSpacing:"0.06em"}}>{c.status}</span>
                    <div style={{display:"flex",gap:"8px"}}>
                      <button onClick={()=>openEdit(c)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"12px",padding:"3px"}}
                        onMouseEnter={e=>e.currentTarget.style.color=TEXT}
                        onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                        <i className="fa-solid fa-pen"/>
                      </button>
                      <button onClick={()=>togglePublish(c._id,c.status)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"12px",padding:"3px"}}
                        onMouseEnter={e=>e.currentTarget.style.color=c.status==="published"?"#f59e0b":"#22c55e"}
                        onMouseLeave={e=>e.currentTarget.style.color=MUTED}
                        title={c.status==="published"?t("Нуух","Unpublish"):t("Нийтлэх","Publish")}>
                        <i className={`fa-solid ${c.status==="published"?"fa-eye-slash":"fa-eye"}`}/>
                      </button>
                      <button onClick={()=>setDel(c._id)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"12px",padding:"3px"}}
                        onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                        onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                        <i className="fa-solid fa-trash"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}}>
          <div style={{background:DROP,border:`1px solid ${DROPB}`,borderRadius:"14px",padding:"28px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
              <div style={{fontSize:"16px",fontWeight:300,color:TEXT,letterSpacing:"-0.3px"}}>
                {editing?t("Засах","Edit course","編集","수정","Modifier","Bearbeiten","编辑"):t("Шинэ сургалт","New course","新しいコース","새 강의","Nouveau cours","Neuer Kurs","新课程")}
              </div>
              <button onClick={closeModal} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"16px"}}>
                <i className="fa-solid fa-xmark"/>
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
              {[
                {label:t("Гарчиг","Title","タイトル","제목","Titre","Titel","标题"),key:"title",ph:t("Сургалтын нэр","Course title","コース名","강의 제목","Titre du cours","Kurstitel","课程标题")},
                {label:"Slug",key:"slug",ph:"react-nextjs-mastery"},
                {label:t("Тайлбар","Description","説明","설명","Description","Beschreibung","描述"),key:"description",ph:t("Сургалтын тухай...","About this course...","このコースについて...","강의 소개...","À propos du cours...","Über diesen Kurs...","关于本课程...")},
                {label:t("Багш","Instructor","講師","강사","Instructeur","Dozent","讲师"),key:"instructor",ph:t("Багшийн нэр","Instructor name","講師名","강사 이름","Nom de l'instructeur","Dozentenname","讲师姓名")},
                {label:t("Зурагны URL","Thumbnail URL","サムネイルURL","썸네일 URL","URL de la miniature","Thumbnail-URL","缩略图URL"),key:"thumbnail",ph:"https://..."},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e=>{
                    const v=e.target.value;
                    setForm(p=>({...p,[f.key]:v,...(f.key==="title"&&!editing?{slug:autoSlug(v)}:{})}));
                  }} style={INP} placeholder={f.ph}/>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px"}}>
                <div>
                  <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{t("Ангилал","Category")}</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={SEL}>
                    {CATS.map(c=><option key={c} value={c}>{CAT_LBL[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{t("Түвшин","Level")}</label>
                  <select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))} style={SEL}>
                    {LEVELS.map(l=><option key={l} value={l}>{LVL_LBL[l]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{t("Статус","Status")}</label>
                  <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={SEL}>
                    <option value="draft">{t("Ноорог","Draft")}</option>
                    <option value="published">{t("Нийтлэгдсэн","Published")}</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:"10px",marginTop:"28px"}}>
              <button onClick={save} disabled={saving||!form.title} style={{flex:1,padding:"10px",background:TEXT,color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:form.title?"pointer":"not-allowed",fontSize:"13px",fontWeight:500,fontFamily:"inherit"}}>
                {saving?t("Хадгалж байна...","Saving..."):t("Хадгалах","Save","保存","저장","Enregistrer","Speichern","保存")}
              </button>
              <button onClick={closeModal} style={{padding:"10px 20px",border:`1px solid ${DROPB}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"13px",fontFamily:"inherit"}}>
                {t("Цуцлах","Cancel","キャンセル","취소","Annuler","Abbrechen","取消")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:DROP,border:`1px solid ${DROPB}`,borderRadius:"12px",padding:"24px",width:"300px"}}>
            <div style={{fontSize:"14px",fontWeight:400,color:TEXT,marginBottom:"6px"}}>{t("Устгах уу?","Delete this course?","削除しますか?","삭제하시겠습니까?","Supprimer?","Löschen?","删除?")}</div>
            <div style={{fontSize:"12px",color:MUTED,fontWeight:300,marginBottom:"20px"}}>{t("Бүх хичээл, контент устна.","All lessons and content will be deleted.","全てのレッスンが削除されます。","모든 레슨이 삭제됩니다.","Tous les contenus seront supprimés.","Alle Inhalte werden gelöscht.","所有内容将被删除。")}</div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>del(delConfirm)} style={{flex:1,padding:"9px",background:"#ef4444",border:"none",color:"#fff",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>{t("Устгах","Delete","削除","삭제","Supprimer","Löschen","删除")}</button>
              <button onClick={()=>setDel(null)} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${DROPB}`,color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>{t("Цуцлах","Cancel","キャンセル","취소","Annuler","Abbrechen","取消")}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
