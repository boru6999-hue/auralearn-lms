"use client";
import { useLang } from "@/hooks/useLang";
import SupabaseUpload from "@/components/SupabaseUpload";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const CATS=[
  {id:"language",    mn:"Хэл",        en:"Language",    ja:"言語",    ko:"언어",   fr:"Langues",      de:"Sprachen",  zh:"语言"},
  {id:"development", mn:"Хөгжүүлэлт", en:"Development", ja:"開発",    ko:"개발",   fr:"Développement",de:"Entwicklung",zh:"开发"},
  {id:"design",      mn:"Дизайн",     en:"Design",      ja:"デザイン",ko:"디자인", fr:"Design",       de:"Design",    zh:"设计"},
  {id:"business",    mn:"Бизнес",     en:"Business",    ja:"ビジネス",ko:"비즈니스",fr:"Business",    de:"Business",  zh:"商业"},
];

const LEVELS=[
  {id:"beginner",     mn:"Анхан",  en:"Beginner",     ja:"初級",ko:"초급",fr:"Débutant",   de:"Anfänger",zh:"初级"},
  {id:"intermediate", mn:"Дунд",   en:"Intermediate", ja:"中級",ko:"중급",fr:"Intermédiaire",de:"Mittel",zh:"中级"},
  {id:"advanced",     mn:"Ахисан", en:"Advanced",     ja:"上級",ko:"고급",fr:"Avancé",      de:"Fortgeschritten",zh:"高级"},
];

const LESSON_TYPES=[
  {id:"video", icon:"fa-circle-play",     mn:"Видео",    en:"Video"},
  {id:"pdf",   icon:"fa-file-pdf",        mn:"PDF",      en:"PDF"},
  {id:"quiz",  icon:"fa-circle-question", mn:"Тест",     en:"Quiz"},
  {id:"file",  icon:"fa-file-arrow-down", mn:"Файл",     en:"File"},
];

export default function AdminCoursesPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [courses, setCourses]       = useState<any[]>([]);
  const [loading, setLoad]          = useState(true);
  const [selected, setSelected]     = useState<any>(null); // selected course for editing
  const [view, setView]             = useState<"list"|"detail">("list");
  const [courseModal, setCModal]    = useState(false);
  const [sectionModal, setSModal]   = useState(false);
  const [lessonModal, setLModal]    = useState(false);
  const [activeSection, setActSec]  = useState<any>(null);
  const [saving, setSaving]         = useState(false);
  const [cForm, setCForm]           = useState({ title:"", description:"", category:"language", level:"beginner", status:"draft", featured:false, instructor:"AuraLearn", thumbnail:"" });
  const [sForm, setSForm]           = useState({ title:"" });
  const [lForm, setLForm]           = useState({ title:"", type:"video", videoUrl:"", pdfUrl:"", fileUrl:"", fileName:"", description:"", isFree:false, duration:0 });
  const [quizQuestions, setQuizQ]   = useState<any[]>([]);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;
  const cl=(arr:any[],key:string)=>{const f=arr.find(x=>x.id===key);return f?(f[lang as keyof typeof f]||f.en) as string:key;};

  const BG    =isDark?"#0a0a0a":"#f5f5f5";
  const CARD  =isDark?"rgba(255,255,255,0.04)":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e5e5e5";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#888";
  const MUTED2=isDark?"#888":"#666";
  const INP={width:"100%",height:"38px",background:isDark?"#1a1a1a":"#f0f0f0",border:`1px solid ${BORDER}`,borderRadius:"8px",padding:"0 12px",color:TEXT,fontSize:"13px",outline:"none",boxSizing:"border-box"} as React.CSSProperties;
  const TEXTAREA={...INP,height:"auto",padding:"10px 12px",resize:"vertical" as const,lineHeight:"1.5"};

  useEffect(()=>{
    fetch("/api/admin/courses").then(r=>r.json()).then(d=>{if(Array.isArray(d))setCourses(d);}).catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  // Reload selected course
  async function reloadCourse(id: string) {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();
    setSelected(data);
    setCourses(p=>p.map(c=>c._id===id?{...c,...data}:c));
  }

  // Save course (create/edit)
  async function saveCourse() {
    setSaving(true);
    try {
      // If selected exists and we opened modal from detail view = EDIT
      const isEdit = !!selected;
      const body = isEdit
        ? { id: selected._id, ...cForm }
        : { ...cForm, price: 0 };
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch("/api/admin/courses", { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      if (isEdit) {
        setCourses(p=>p.map(c=>c._id===data._id?data:c));
        setSelected(data);
      } else {
        setCourses(p=>[data,...p]);
        setSelected(data);
        setView("detail");
      }
      setCModal(false);
    } catch(e:any){ alert(e.message); }
    setSaving(false);
  }

  // Update course field
  async function updateCourse(field: string, value: any) {
    if (!selected) return;
    const res = await fetch("/api/admin/courses", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: selected._id, [field]: value }) });
    const data = await res.json();
    setSelected(data);
    setCourses(p=>p.map(c=>c._id===data._id?data:c));
  }

  // Add section
  async function addSection() {
    if (!sForm.title.trim() || !selected) return;
    setSaving(true);
    const sections = [...(selected.sections||[]), { title: sForm.title, lessons: [], order: (selected.sections?.length||0) }];
    await updateCourse("sections", sections);
    setSForm({ title:"" });
    setSModal(false);
    setSaving(false);
  }

  // Delete section
  async function deleteSection(secIdx: number) {
    if (!confirm(t("Устгах уу?","Delete section?"))) return;
    const sections = selected.sections.filter((_:any, i:number) => i !== secIdx);
    await updateCourse("sections", sections);
  }

  // Add lesson
  async function addLesson() {
    if (!lForm.title.trim() || !selected || activeSection === null) return;
    setSaving(true);
    const sections = [...selected.sections];
    const secIdx = sections.findIndex((s:any) => s._id === activeSection._id || s.title === activeSection.title);
    if (secIdx < 0) return;
    const newLesson: any = { ...lForm, order: sections[secIdx].lessons?.length || 0 };
    if (lForm.type === "quiz") newLesson.quiz = quizQuestions;
    sections[secIdx].lessons = [...(sections[secIdx].lessons||[]), newLesson];
    await updateCourse("sections", sections);
    setLForm({ title:"", type:"video", videoUrl:"", pdfUrl:"", fileUrl:"", fileName:"", description:"", isFree:false, duration:0 });
    setQuizQ([]);
    setLModal(false);
    setSaving(false);
  }

  // Delete lesson
  async function deleteLesson(secIdx: number, lesIdx: number) {
    if (!confirm(t("Устгах уу?","Delete lesson?"))) return;
    const sections = [...selected.sections];
    sections[secIdx].lessons = sections[secIdx].lessons.filter((_:any,i:number)=>i!==lesIdx);
    await updateCourse("sections", sections);
  }

  // Delete course
  async function deleteCourse(id: string) {
    if (!confirm(t("Устгах уу?","Delete course?"))) return;
    await fetch("/api/admin/courses",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setCourses(p=>p.filter(c=>c._id!==id));
    if (selected?._id === id) { setSelected(null); setView("list"); }
  }

  // Add quiz question
  function addQuizQ() {
    setQuizQ(p=>[...p,{question:"",options:["","","",""],correct:0,explanation:""}]);
  }

  if (!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;

  // ─── DETAIL VIEW ───────────────────────────────────────────────────
  if (view === "detail" && selected) return (
    <AdminLayout>
      <div style={{padding:"24px 28px",background:BG,minHeight:"100vh"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <button onClick={()=>{setView("list");setSelected(null);}} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"6px 10px",borderRadius:"7px",cursor:"pointer",fontSize:"12px"}}>
              <i className="fa-solid fa-arrow-left"/>
            </button>
            <div>
              <h1 style={{color:TEXT,fontSize:"17px",fontWeight:800,marginBottom:"2px"}}>{selected.title}</h1>
              <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                <span style={{background:selected.status==="published"?"rgba(52,211,153,0.15)":"rgba(245,158,11,0.15)",color:selected.status==="published"?"#34d399":"#f59e0b",fontSize:"10px",padding:"2px 8px",borderRadius:"10px",fontWeight:600}}>{selected.status}</span>
                <span style={{color:MUTED,fontSize:"11px"}}>{cl(CATS,selected.category||"development")} · {cl(LEVELS,selected.level||"beginner")}</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>updateCourse("status",selected.status==="published"?"draft":"published")} style={{background:"none",border:`1px solid ${BORDER}`,color:selected.status==="published"?"#f59e0b":"#34d399",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:600}}>
              <i className={`fa-solid ${selected.status==="published"?"fa-eye-slash":"fa-eye"}`} style={{marginRight:"5px"}}/>
              {selected.status==="published"?t("Ноорог болгох","Unpublish","非公開","비공개","Dépublier","Entwurf","取消发布"):t("Нийтлэх","Publish","公開","게시","Publier","Veröffentlichen","发布")}
            </button>
            <button onClick={()=>{setCForm({title:selected.title,description:selected.description||"",category:selected.category||"language",level:selected.level||"beginner",status:selected.status||"draft",featured:selected.featured||false,instructor:selected.instructor||"AuraLearn",thumbnail:selected.thumbnail||""});setCModal(true);}} style={{background:isDark?"#222":"#000",color:"#fff",border:"none",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:600}}>
              <i className="fa-solid fa-pen" style={{marginRight:"5px"}}/>{t("Засах","Edit","編集","수정","Modifier","Bearbeiten","编辑")}
            </button>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:"16px"}}>
          {/* Sections & Lessons */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <h2 style={{color:TEXT,fontSize:"14px",fontWeight:700}}>
                <i className="fa-solid fa-list" style={{marginRight:"8px",color:MUTED}}/>{t("Хэсэг & Хичээлүүд","Sections & Lessons","セクションとレッスン","섹션 & 레슨","Sections & Leçons","Abschnitte & Lektionen","章节 & 课程")}
              </h2>
              <button onClick={()=>setSModal(true)} style={{background:isDark?"#1a1a1a":"#000",color:"#fff",border:"none",padding:"6px 14px",borderRadius:"7px",cursor:"pointer",fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",gap:"5px"}}>
                <i className="fa-solid fa-plus"/>{t("Хэсэг нэмэх","Add Section","セクション追加","섹션 추가","Ajouter section","Abschnitt hinzufügen","添加章节")}
              </button>
            </div>

            {(!selected.sections||selected.sections.length===0)&&(
              <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"40px",textAlign:"center",color:MUTED}}>
                <i className="fa-solid fa-layer-group" style={{fontSize:"28px",display:"block",marginBottom:"10px"}}/>
                <div style={{fontSize:"13px"}}>{t("Хэсэг байхгүй. Хэсэг нэмнэ үү.","No sections yet. Add a section.","セクションなし","섹션 없음","Aucune section","Keine Abschnitte","暂无章节")}</div>
              </div>
            )}

            {selected.sections?.map((sec:any,si:number)=>(
              <div key={sec._id||si} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",marginBottom:"12px",overflow:"hidden"}}>
                {/* Section header */}
                <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${BORDER}`,background:isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <i className="fa-solid fa-folder" style={{color:MUTED,fontSize:"13px"}}/>
                    <span style={{color:TEXT,fontWeight:700,fontSize:"13px"}}>{sec.title}</span>
                    <span style={{color:MUTED,fontSize:"11px"}}>({sec.lessons?.length||0} {t("хичээл","lessons","レッスン","레슨","leçons","Lektionen","课程")})</span>
                  </div>
                  <div style={{display:"flex",gap:"6px"}}>
                    <button onClick={()=>{setActSec(sec);setLModal(true);}} style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",border:`1px solid ${BORDER}`,color:TEXT,padding:"4px 10px",borderRadius:"6px",cursor:"pointer",fontSize:"11px",fontWeight:600,display:"flex",alignItems:"center",gap:"4px"}}>
                      <i className="fa-solid fa-plus" style={{fontSize:"10px"}}/>{t("Хичээл","Lesson","レッスン","레슨","Leçon","Lektion","课程")}
                    </button>
                    <button onClick={()=>deleteSection(si)} style={{background:"none",border:`1px solid ${BORDER}`,color:"#f87171",padding:"4px 8px",borderRadius:"6px",cursor:"pointer",fontSize:"11px"}}>
                      <i className="fa-solid fa-trash"/>
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {sec.lessons?.length===0&&(
                  <div style={{padding:"16px",textAlign:"center",color:MUTED,fontSize:"12px"}}>
                    <i className="fa-solid fa-video" style={{marginRight:"5px"}}/>{t("Хичээл байхгүй","No lessons","レッスンなし","레슨 없음","Aucun leçon","Keine Lektionen","暂无课程")}
                  </div>
                )}
                {sec.lessons?.map((les:any,li:number)=>{
                  const TYPE=LESSON_TYPES.find(x=>x.id===les.type)||LESSON_TYPES[0];
                  return(
                    <div key={les._id||li} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 16px",borderBottom:li<sec.lessons.length-1?`1px solid ${BORDER}`:"none"}}
                      onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <i className={`fa-solid ${TYPE.icon}`} style={{color:MUTED,fontSize:"14px",width:"16px",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:TEXT,fontSize:"12px",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{les.title}</div>
                        <div style={{color:MUTED,fontSize:"10px",display:"flex",gap:"8px",marginTop:"2px"}}>
                          <span>{lang==="mn"?TYPE.mn:TYPE.en}</span>
                          {les.duration>0&&<span><i className="fa-regular fa-clock" style={{marginRight:"3px"}}/>{Math.floor(les.duration/60)}:{String(les.duration%60).padStart(2,"0")}</span>}
                          {les.isFree&&<span style={{color:"#34d399"}}><i className="fa-solid fa-unlock" style={{marginRight:"2px"}}/>{t("Үнэгүй","Free","無料","무료","Gratuit","Kostenlos","免费")}</span>}
                          {les.type==="quiz"&&<span>{les.quiz?.length||0} {t("асуулт","questions","質問","질문","questions","Fragen","问题")}</span>}
                        </div>
                      </div>
                      <button onClick={()=>deleteLesson(si,li)} style={{background:"none",border:`1px solid ${BORDER}`,color:"#f87171",padding:"4px 7px",borderRadius:"6px",cursor:"pointer",fontSize:"10px"}}>
                        <i className="fa-solid fa-trash"/>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Course info sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {/* Thumbnail */}
            <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",overflow:"hidden"}}>
              <div style={{height:"140px",background:isDark?"rgba(255,255,255,0.03)":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {selected.thumbnail?<img src={selected.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<i className="fa-solid fa-image" style={{fontSize:"28px",color:MUTED}}/>}
              </div>
              <div style={{padding:"12px"}}>
                <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Thumbnail URL","Thumbnail URL","サムネイルURL","썸네일 URL","URL miniature","Thumbnail-URL","缩略图URL")}</label>
                <input defaultValue={selected.thumbnail||""} onBlur={e=>updateCourse("thumbnail",e.target.value)} style={INP} placeholder="https://..."/>
              </div>
            </div>

            {/* Stats */}
            <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"14px"}}>
              <div style={{color:MUTED,fontSize:"11px",fontWeight:600,marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Stats</div>
              {[
                {icon:"fa-layer-group",label:t("Хэсэг","Sections","セクション","섹션","Sections","Abschnitte","章节"),val:selected.sections?.length||0},
                {icon:"fa-play-circle",label:t("Хичээл","Lessons"),val:selected.sections?.reduce((a:number,s:any)=>a+(s.lessons?.length||0),0)||0},
                {icon:"fa-users",label:t("Оюутан","Students","生徒","학생","Étudiants","Studenten","学生"),val:(selected.studentsCount||0).toLocaleString()},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<2?`1px solid ${BORDER}`:"none"}}>
                  <span style={{color:MUTED2,fontSize:"12px"}}><i className={`fa-solid ${s.icon}`} style={{marginRight:"6px",color:MUTED,width:"12px"}}/>{s.label}</span>
                  <span style={{color:TEXT,fontSize:"13px",fontWeight:700}}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Quick edit */}
            <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"14px"}}>
              <div style={{color:MUTED,fontSize:"11px",fontWeight:600,marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.05em"}}>{t("Тохиргоо","Settings","設定","설정","Paramètres","Einstellungen","设置")}</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                <div>
                  <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Ангилал","Category","カテゴリ","카테고리","Catégorie","Kategorie","分类")}</label>
                  <select defaultValue={selected.category} onBlur={e=>updateCourse("category",e.target.value)} style={INP}>
                    {CATS.map(c=><option key={c.id} value={c.id}>{lang==="mn"?c.mn:c.en}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Түвшин","Level","レベル","레벨","Niveau","Level","级别")}</label>
                  <select defaultValue={selected.level} onBlur={e=>updateCourse("level",e.target.value)} style={INP}>
                    {LEVELS.map(l=><option key={l.id} value={l.id}>{lang==="mn"?l.mn:l.en}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Багш","Instructor","講師","강사","Instructeur","Dozent","讲师")}</label>
                  <input defaultValue={selected.instructor||""} onBlur={e=>updateCourse("instructor",e.target.value)} style={INP}/>
                </div>
                <label style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",padding:"4px 0"}}>
                  <input type="checkbox" defaultChecked={selected.featured} onChange={e=>updateCourse("featured",e.target.checked)}/>
                  <span style={{color:TEXT,fontSize:"12px"}}>⭐ Featured</span>
                </label>
              </div>
            </div>

            <button onClick={()=>deleteCourse(selected._id)} style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",padding:"9px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:600}}>
              <i className="fa-solid fa-trash" style={{marginRight:"6px"}}/>{t("Курс устгах","Delete Course","コース削除","강의 삭제","Supprimer cours","Kurs löschen","删除课程")}
            </button>
          </div>
        </div>
      </div>

      {/* Section modal */}
      {sectionModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:isDark?"#111":"#fff",border:`1px solid ${BORDER}`,borderRadius:"14px",padding:"24px",width:"380px"}}>
            <h2 style={{color:TEXT,fontSize:"15px",fontWeight:700,marginBottom:"16px"}}>
              <i className="fa-solid fa-folder-plus" style={{marginRight:"8px",color:MUTED}}/>{t("Хэсэг нэмэх","Add Section","セクション追加","섹션 추가","Ajouter section","Abschnitt hinzufügen","添加章节")}
            </h2>
            <div style={{marginBottom:"12px"}}>
              <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Гарчиг","Title","タイトル","제목","Titre","Titel","标题")} *</label>
              <input value={sForm.title} onChange={e=>setSForm(f=>({...f,title:e.target.value}))} style={INP} placeholder={t("жш: 1-р бүлэг — Удиртгал","e.g. Section 1 — Introduction")}/>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
              <button onClick={addSection} disabled={saving||!sForm.title.trim()} style={{flex:1,background:isDark?"#222":"#000",color:"#fff",border:"none",padding:"10px",borderRadius:"8px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                {saving&&<i className="fa-solid fa-spinner fa-spin"/>}{t("Нэмэх","Add","追加","추가","Ajouter","Hinzufügen","添加")}
              </button>
              <button onClick={()=>setSModal(false)} style={{flex:1,background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"10px",borderRadius:"8px",cursor:"pointer"}}>{t("Цуцлах","Cancel","キャンセル","취소","Annuler","Abbrechen","取消")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson modal */}
      {lessonModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,overflowY:"auto"}}>
          <div style={{background:isDark?"#111":"#fff",border:`1px solid ${BORDER}`,borderRadius:"14px",padding:"24px",width:"500px",maxWidth:"90vw",margin:"20px auto"}}>
            <h2 style={{color:TEXT,fontSize:"15px",fontWeight:700,marginBottom:"16px"}}>
              <i className="fa-solid fa-plus-circle" style={{marginRight:"8px",color:MUTED}}/>{t("Хичээл нэмэх","Add Lesson","レッスン追加","레슨 추가","Ajouter leçon","Lektion hinzufügen","添加课程")} — {activeSection?.title}
            </h2>

            {/* Type selector */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"6px",marginBottom:"14px"}}>
              {LESSON_TYPES.map(tp=>(
                <button key={tp.id} onClick={()=>setLForm(f=>({...f,type:tp.id}))} style={{padding:"8px",borderRadius:"8px",border:`1px solid ${lForm.type===tp.id?TEXT:BORDER}`,background:lForm.type===tp.id?(isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)"):"transparent",color:lForm.type===tp.id?TEXT:MUTED,cursor:"pointer",fontSize:"11px",fontWeight:lForm.type===tp.id?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                  <i className={`fa-solid ${tp.icon}`} style={{fontSize:"16px"}}/>
                  {lang==="mn"?tp.mn:tp.en}
                </button>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div>
                <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Гарчиг","Title","タイトル","제목","Titre","Titel","标题")} *</label>
                <input value={lForm.title} onChange={e=>setLForm(f=>({...f,title:e.target.value}))} style={INP} placeholder={t("Хичээлийн нэр","Lesson title")}/>
              </div>
              <div>
                <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Тайлбар","Description","説明","설명","Description","Beschreibung","描述")}</label>
                <textarea value={lForm.description} onChange={e=>setLForm(f=>({...f,description:e.target.value}))} style={{...TEXTAREA,height:"70px"}} placeholder={t("Хичээлийн тайлбар","Lesson description")}/>
              </div>

              {lForm.type==="video"&&(
                <>
                  <div>
                    <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}><i className="fa-solid fa-video" style={{marginRight:"4px"}}/>Video URL <span style={{color:MUTED,fontWeight:400}}>(YouTube, Drive)</span></label>
                    <input value={lForm.videoUrl} onChange={e=>setLForm(f=>({...f,videoUrl:e.target.value}))} style={INP} placeholder="https://youtube.com/watch?v=... эсвэл Drive URL"/>
                  </div>
                  <div>
                    <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}><i className="fa-solid fa-cloud-arrow-up" style={{marginRight:"4px"}}/>Эсвэл файл upload хийх</label>
                    <SupabaseUpload
                      accept="video/mp4,video/webm,video/ogg"
                      label={t("Видео файл сонгох","Choose video file","動画ファイルを選択","동영상 파일 선택","Choisir une vidéo","Videodatei wählen","选择视频文件")}
                      folder="videos"
                      onUpload={(r)=>setLForm(f=>({...f,videoUrl:r.url}))}
                    />
                    {lForm.videoUrl&&lForm.videoUrl.includes("supabase")&&<div style={{color:"#34d399",fontSize:"11px",marginTop:"4px"}}><i className="fa-solid fa-circle-check" style={{marginRight:"4px"}}/>Uploaded!</div>}
                  </div>
                  <div>
                    <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}><i className="fa-regular fa-clock" style={{marginRight:"4px"}}/>{t("Үргэлжлэх хугацаа","Duration")} <span style={{color:MUTED,fontWeight:400}}>({t("заавал биш","optional","任意","선택","optionnel","optional","可选")})</span></label>
                    <div style={{display:"flex",gap:"6px"}}>
                      <input value={lForm.duration>0?`${Math.floor(lForm.duration/60)}:${String(lForm.duration%60).padStart(2,"0")}`:""}
                        onChange={e=>{
                          const val=e.target.value;
                          if(val.includes(":")){const[m,s]=val.split(":");setLForm(f=>({...f,duration:(parseInt(m)||0)*60+(parseInt(s)||0)}));}
                          else setLForm(f=>({...f,duration:parseInt(val)||0}));
                        }}
                        style={{...INP,flex:1}} placeholder="0:25 эсвэл 25"/>
                      <span style={{color:MUTED,fontSize:"11px",display:"flex",alignItems:"center"}}>{lForm.duration>0&&`${lForm.duration}s`}</span>
                    </div>
                  </div>
                </>
              )}
              {lForm.type==="pdf"&&(
                <div>
                  <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}><i className="fa-solid fa-file-pdf" style={{marginRight:"4px"}}/>PDF</label>
                  <input value={lForm.pdfUrl} onChange={e=>setLForm(f=>({...f,pdfUrl:e.target.value}))} style={{...INP,marginBottom:"6px"}} placeholder="https://... URL"/>
                  <SupabaseUpload
                    accept="application/pdf"
                    label={t("PDF файл upload","Upload PDF","PDFをアップロード","PDF 업로드","Télécharger PDF","PDF hochladen","上传PDF")}
                    folder="pdfs"
                    onUpload={(r)=>setLForm(f=>({...f,pdfUrl:r.url}))}
                  />
                  {lForm.pdfUrl&&lForm.pdfUrl.includes("supabase")&&<div style={{color:"#34d399",fontSize:"11px",marginTop:"4px"}}><i className="fa-solid fa-circle-check" style={{marginRight:"4px"}}/>Uploaded!</div>}
                </div>
              )}
              {lForm.type==="file"&&(
                <>
                  <div>
                    <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}><i className="fa-solid fa-file" style={{marginRight:"4px"}}/>File URL</label>
                    <input value={lForm.fileUrl} onChange={e=>setLForm(f=>({...f,fileUrl:e.target.value}))} style={INP} placeholder="https://..."/>
                  </div>
                  <div>
                    <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Файлын нэр","File Name")}</label>
                    <input value={lForm.fileName} onChange={e=>setLForm(f=>({...f,fileName:e.target.value}))} style={INP} placeholder="document.pdf"/>
                  </div>
                </>
              )}
              {lForm.type==="quiz"&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                    <label style={{color:MUTED,fontSize:"11px"}}><i className="fa-solid fa-circle-question" style={{marginRight:"4px"}}/>{t("Асуултууд","Questions")} ({quizQuestions.length})</label>
                    <button onClick={addQuizQ} style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",border:`1px solid ${BORDER}`,color:TEXT,padding:"4px 10px",borderRadius:"6px",cursor:"pointer",fontSize:"11px",display:"flex",alignItems:"center",gap:"4px"}}>
                      <i className="fa-solid fa-plus" style={{fontSize:"9px"}}/>{t("Нэмэх","Add","追加","추가","Ajouter","Hinzufügen","添加")}
                    </button>
                  </div>
                  <div style={{maxHeight:"250px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"8px"}}>
                    {quizQuestions.map((q,qi)=>(
                      <div key={qi} style={{background:isDark?"rgba(255,255,255,0.03)":"#f9f9f9",border:`1px solid ${BORDER}`,borderRadius:"8px",padding:"10px"}}>
                        <input value={q.question} onChange={e=>setQuizQ(p=>p.map((x,i)=>i===qi?{...x,question:e.target.value}:x))} style={{...INP,marginBottom:"6px"}} placeholder={`${t("Асуулт","Question","質問","질문","Question","Frage","问题")} ${qi+1}`}/>
                        {q.options.map((opt:string,oi:number)=>(
                          <div key={oi} style={{display:"flex",gap:"5px",marginBottom:"4px",alignItems:"center"}}>
                            <input type="radio" name={`correct-${qi}`} checked={q.correct===oi} onChange={()=>setQuizQ(p=>p.map((x,i)=>i===qi?{...x,correct:oi}:x))} style={{flexShrink:0}}/>
                            <input value={opt} onChange={e=>setQuizQ(p=>p.map((x,i)=>i===qi?{...x,options:x.options.map((o:string,j:number)=>j===oi?e.target.value:o)}:x))} style={{...INP,height:"30px",fontSize:"12px"}} placeholder={`${["A","B","C","D"][oi]}. ${t("Хариулт","Option","選択肢","옵션","Option","Option","选项")}`}/>
                          </div>
                        ))}
                        <input value={q.explanation} onChange={e=>setQuizQ(p=>p.map((x,i)=>i===qi?{...x,explanation:e.target.value}:x))} style={{...INP,marginTop:"4px",fontSize:"11px"}} placeholder={t("Тайлбар (заавал биш)","Explanation (optional)","解説（任意）","설명 (선택)","Explication (optionnel)","Erklärung (optional)","说明（可选）")}/>
                      </div>
                    ))}
                    {quizQuestions.length===0&&<div style={{color:MUTED,fontSize:"12px",textAlign:"center",padding:"16px"}}>{t("Асуулт нэмнэ үү","Add questions above","質問を追加","질문을 추가","Ajoutez des questions","Fragen hinzufügen","请添加问题")}</div>}
                  </div>
                </div>
              )}

              <label style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"}}>
                <input type="checkbox" checked={lForm.isFree} onChange={e=>setLForm(f=>({...f,isFree:e.target.checked}))}/>
                <span style={{color:TEXT,fontSize:"12px"}}><i className="fa-solid fa-unlock" style={{marginRight:"4px",color:"#34d399"}}/>{t("Үнэгүй хичээл (бүртгэлгүй харах)","Free preview lesson","無料プレビュー","무료 미리보기","Aperçu gratuit","Kostenlose Vorschau","免费预览")}</span>
              </label>
            </div>

            <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
              <button onClick={addLesson} disabled={saving||!lForm.title.trim()} style={{flex:1,background:isDark?"#222":"#000",color:"#fff",border:"none",padding:"10px",borderRadius:"8px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                {saving&&<i className="fa-solid fa-spinner fa-spin"/>}{t("Нэмэх","Add Lesson")}
              </button>
              <button onClick={()=>{setLModal(false);setQuizQ([]);}} style={{flex:1,background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"10px",borderRadius:"8px",cursor:"pointer"}}>{t("Цуцлах","Cancel","キャンセル","취소","Annuler","Abbrechen","取消")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Course edit modal */}
      {courseModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:isDark?"#111":"#fff",border:`1px solid ${BORDER}`,borderRadius:"14px",padding:"24px",width:"420px",maxWidth:"90vw"}}>
            <h2 style={{color:TEXT,fontSize:"15px",fontWeight:700,marginBottom:"16px"}}>
              <i className="fa-solid fa-pen" style={{marginRight:"8px",color:MUTED}}/>{t("Курс засах","Edit Course")}
            </h2>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Нэр","Title")} *</label><input value={cForm.title} onChange={e=>setCForm(f=>({...f,title:e.target.value}))} style={INP}/></div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Тайлбар","Description","説明","설명","Description","Beschreibung","描述")}</label><textarea value={cForm.description} onChange={e=>setCForm(f=>({...f,description:e.target.value}))} style={{...TEXTAREA,height:"70px"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Ангилал","Category","カテゴリ","카테고리","Catégorie","Kategorie","分类")}</label>
                  <select value={cForm.category} onChange={e=>setCForm(f=>({...f,category:e.target.value}))} style={INP}>{CATS.map(c=><option key={c.id} value={c.id}>{lang==="mn"?c.mn:c.en}</option>)}</select></div>
                <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Түвшин","Level","レベル","레벨","Niveau","Level","级别")}</label>
                  <select value={cForm.level} onChange={e=>setCForm(f=>({...f,level:e.target.value}))} style={INP}>{LEVELS.map(l=><option key={l.id} value={l.id}>{lang==="mn"?l.mn:l.en}</option>)}</select></div>
              </div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Багш","Instructor","講師","강사","Instructeur","Dozent","讲师")}</label><input value={cForm.instructor} onChange={e=>setCForm(f=>({...f,instructor:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
              <button onClick={saveCourse} disabled={saving} style={{flex:1,background:isDark?"#222":"#000",color:"#fff",border:"none",padding:"10px",borderRadius:"8px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                {saving&&<i className="fa-solid fa-spinner fa-spin"/>}{t("Хадгалах","Save","保存","저장","Enregistrer","Speichern","保存")}
              </button>
              <button onClick={()=>setCModal(false)} style={{flex:1,background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"10px",borderRadius:"8px",cursor:"pointer"}}>{t("Цуцлах","Cancel","キャンセル","취소","Annuler","Abbrechen","取消")}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );

  // ─── LIST VIEW ─────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div style={{padding:"28px 32px",background:BG,minHeight:"100vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
          <div>
            <h1 style={{fontSize:"20px",fontWeight:800,color:TEXT,marginBottom:"3px"}}>
              <i className="fa-solid fa-graduation-cap" style={{marginRight:"10px",color:MUTED}}/>{t("Сургалт удирдлага","Course Management","コース管理","강의 관리","Gestion Cours","Kursverwaltung","课程管理")}
            </h1>
            <p style={{color:MUTED,fontSize:"12px"}}>{courses.length} {t("сургалт","courses","コース","강의","cours","Kurse","课程")}</p>
          </div>
          <button onClick={()=>{setCForm({title:"",description:"",category:"language",level:"beginner",status:"draft",featured:false,instructor:"AuraLearn",thumbnail:""});setSelected(null);setCModal(true);}}
            style={{background:isDark?"#222":"#000",color:"#fff",border:"none",padding:"9px 18px",borderRadius:"9px",fontSize:"13px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}}>
            <i className="fa-solid fa-plus"/>{t("Шинэ курс","New Course","新しいコース","새 강의","Nouveau cours","Neuer Kurs","新课程")}
          </button>
        </div>

        {loading?(
          <div style={{textAlign:"center",padding:"60px",color:MUTED}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
          </div>
        ):courses.length===0?(
          <div style={{textAlign:"center",padding:"60px",background:CARD,borderRadius:"16px",border:`1px solid ${BORDER}`,color:MUTED}}>
            <i className="fa-solid fa-graduation-cap" style={{fontSize:"36px",display:"block",marginBottom:"12px"}}/>
            <div style={{fontSize:"15px",fontWeight:600,marginBottom:"4px"}}>{t("Курс байхгүй","No courses yet","コースなし","강의 없음","Aucun cours","Keine Kurse","暂无课程")}</div>
            <div style={{fontSize:"13px"}}>{t("Шинэ курс нэмнэ үү","Create your first course","最初のコースを作成","첫 강의를 만드세요","Créez votre premier cours","Erstellen Sie Ihren ersten Kurs","创建您的第一门课程")}</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
            {courses.map(c=>(
              <div key={c._id} onClick={()=>{setSelected(c);setView("detail");}}
                style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"14px",overflow:"hidden",cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.15)":"#bbb";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=BORDER;}}>
                <div style={{height:"100px",background:isDark?"rgba(255,255,255,0.03)":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                  {c.thumbnail?<img src={c.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<i className="fa-solid fa-graduation-cap" style={{fontSize:"32px",color:MUTED}}/>}
                  <div style={{position:"absolute",top:"8px",right:"8px",display:"flex",gap:"4px"}}>
                    {c.featured&&<span style={{background:"rgba(245,158,11,0.9)",color:"#000",fontSize:"9px",padding:"2px 6px",borderRadius:"4px",fontWeight:700}}>★</span>}
                    <span style={{background:c.status==="published"?"rgba(52,211,153,0.9)":"rgba(245,158,11,0.9)",color:"#000",fontSize:"9px",padding:"2px 6px",borderRadius:"4px",fontWeight:700}}>{c.status==="published"?t("Нийтлэгдсэн","Published"):t("Ноорог","Draft")}</span>
                  </div>
                </div>
                <div style={{padding:"12px"}}>
                  <div style={{color:TEXT,fontWeight:700,fontSize:"13px",marginBottom:"4px"}}>{c.title}</div>
                  <div style={{color:MUTED,fontSize:"11px",marginBottom:"8px"}}>{cl(CATS,c.category||"development")} · {cl(LEVELS,c.level||"beginner")}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:"10px"}}>
                      <span style={{color:MUTED2,fontSize:"11px"}}><i className="fa-solid fa-layer-group" style={{marginRight:"3px"}}/>{c.sections?.length||0}</span>
                      <span style={{color:MUTED2,fontSize:"11px"}}><i className="fa-solid fa-play" style={{marginRight:"3px"}}/>{c.sections?.reduce((a:number,s:any)=>a+(s.lessons?.length||0),0)||0}</span>
                      <span style={{color:MUTED2,fontSize:"11px"}}><i className="fa-solid fa-users" style={{marginRight:"3px"}}/>{c.studentsCount||0}</span>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{color:MUTED,fontSize:"11px"}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New course modal */}
      {courseModal&&!selected&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:isDark?"#111":"#fff",border:`1px solid ${BORDER}`,borderRadius:"14px",padding:"24px",width:"420px",maxWidth:"90vw"}}>
            <h2 style={{color:TEXT,fontSize:"15px",fontWeight:700,marginBottom:"16px"}}>
              <i className="fa-solid fa-plus-circle" style={{marginRight:"8px",color:MUTED}}/>{t("Шинэ курс","New Course","新しいコース","새 강의","Nouveau cours","Neuer Kurs","新课程")}
            </h2>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Нэр","Title")} *</label><input value={cForm.title} onChange={e=>setCForm(f=>({...f,title:e.target.value}))} style={INP} placeholder={t("Курсын нэр","Course title")}/></div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Тайлбар","Description","説明","설명","Description","Beschreibung","描述")}</label><textarea value={cForm.description} onChange={e=>setCForm(f=>({...f,description:e.target.value}))} style={{...TEXTAREA,height:"70px"}} placeholder={t("Товч тайлбар","Short description")}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Ангилал","Category","カテゴリ","카테고리","Catégorie","Kategorie","分类")}</label>
                  <select value={cForm.category} onChange={e=>setCForm(f=>({...f,category:e.target.value}))} style={INP}>{CATS.map(c=><option key={c.id} value={c.id}>{lang==="mn"?c.mn:c.en}</option>)}</select></div>
                <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Түвшин","Level","レベル","레벨","Niveau","Level","级别")}</label>
                  <select value={cForm.level} onChange={e=>setCForm(f=>({...f,level:e.target.value}))} style={INP}>{LEVELS.map(l=><option key={l.id} value={l.id}>{lang==="mn"?l.mn:l.en}</option>)}</select></div>
              </div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"3px"}}>{t("Багш","Instructor","講師","강사","Instructeur","Dozent","讲师")}</label><input value={cForm.instructor} onChange={e=>setCForm(f=>({...f,instructor:e.target.value}))} style={INP} placeholder="AuraLearn"/></div>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
              <button onClick={saveCourse} disabled={saving||!cForm.title.trim()} style={{flex:1,background:isDark?"#222":"#000",color:"#fff",border:"none",padding:"10px",borderRadius:"8px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                {saving&&<i className="fa-solid fa-spinner fa-spin"/>}{t("Үүсгэх","Create","作成","생성","Créer","Erstellen","创建")}
              </button>
              <button onClick={()=>setCModal(false)} style={{flex:1,background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"10px",borderRadius:"8px",cursor:"pointer"}}>{t("Цуцлах","Cancel","キャンセル","취소","Annuler","Abbrechen","取消")}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
