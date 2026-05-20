"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminCoursesPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [courses, setCourses]   = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);
  const [search, setSearch]     = useState("");
  const [view, setView]         = useState<"list"|"detail">("list");
  const [selected, setSelected] = useState<any>(null);
  const [courseModal, setCM]    = useState(false);
  const [editCourse, setEC]     = useState<any>(null);
  const [sectionModal, setSM]   = useState(false);
  const [lessonModal, setLM]    = useState(false);
  const [targetSection, setTS]  = useState<number>(-1);
  const [editLesson, setEL]     = useState<any>(null);
  const [editLessonSec, setELS] = useState<number>(-1);
  const [editLessonIdx, setELI] = useState<number>(-1);
  const [delConfirm, setDel]    = useState<string|null>(null);
  const [saving, setSave]       = useState(false);

  const [cForm, setCF] = useState({title:"",slug:"",description:"",category:"development",level:"beginner",instructor:"",status:"draft"});
  const [sForm, setSF] = useState({title:""});
  const [lForm, setLF] = useState({title:"",description:"",videoUrl:"",pdfUrl:"",type:"video"});

  const t = (mn:string,en:string) => lang==="mn"?mn:en;

  useEffect(()=>{
    loadCourses();
  },[]);

  function loadCourses() {
    fetch("/api/admin/courses").then(r=>r.json()).then(d=>{
      if(Array.isArray(d)) setCourses(d);
    }).catch(()=>{}).finally(()=>setLoad(false));
  }

  function autoSlug(v:string){ return v.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim(); }

  async function saveCourse() {
    setSave(true);
    try {
      if(editCourse) {
        const res = await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editCourse._id,...cForm})});
        const data = await res.json();
        setCourses(p=>p.map(c=>c._id===editCourse._id?data:c));
        if(selected?._id===editCourse._id) setSelected(data);
      } else {
        const res = await fetch("/api/admin/courses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cForm)});
        const data = await res.json();
        setCourses(p=>[data,...p]);
      }
      closeCM();
    } catch {}
    setSave(false);
  }

  function openEditCourse(c:any) {
    setEC(c);
    setCF({title:c.title||"",slug:c.slug||"",description:c.description||"",category:c.category||"development",level:c.level||"beginner",instructor:c.instructor||"",status:c.status||"draft"});
    setCM(true);
  }

  function closeCM(){ setCM(false); setEC(null); setCF({title:"",slug:"",description:"",category:"development",level:"beginner",instructor:"",status:"draft"}); }

  async function togglePublish(id:string,status:string) {
    const ns=status==="published"?"draft":"published";
    await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:ns})});
    setCourses(p=>p.map(c=>c._id===id?{...c,status:ns}:c));
    if(selected?._id===id) setSelected((p:any)=>({...p,status:ns}));
  }

  async function delCourse(id:string) {
    await fetch("/api/admin/courses",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setCourses(p=>p.filter(c=>c._id!==id));
    if(selected?._id===id){ setSelected(null); setView("list"); }
    setDel(null);
  }

  // Section CRUD
  async function addSection() {
    if(!sForm.title.trim()||!selected) return;
    setSave(true);
    const newSections = [...(selected.sections||[]), {title:sForm.title,lessons:[]}];
    const res = await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected._id,sections:newSections})});
    const data = await res.json();
    setSelected(data); setCourses(p=>p.map(c=>c._id===data._id?data:c));
    setSM(false); setSF({title:""}); setSave(false);
  }

  async function deleteSection(si:number) {
    const newSections = selected.sections.filter((_:any,i:number)=>i!==si);
    const res = await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected._id,sections:newSections})});
    const data = await res.json();
    setSelected(data); setCourses(p=>p.map(c=>c._id===data._id?data:c));
  }

  // Lesson CRUD
  function openAddLesson(si:number){ setTS(si); setEL(null); setLF({title:"",description:"",videoUrl:"",pdfUrl:"",type:"video"}); setLM(true); }

  function openEditLesson(si:number,li:number,lesson:any){
    setTS(si); setEL(lesson); setELS(si); setELI(li);
    setLF({title:lesson.title||"",description:lesson.description||"",videoUrl:lesson.videoUrl||"",pdfUrl:lesson.pdfUrl||"",type:lesson.type||"video"});
    setLM(true);
  }

  async function saveLesson() {
    if(!lForm.title.trim()||!selected) return;
    setSave(true);
    const sections = JSON.parse(JSON.stringify(selected.sections||[]));
    if(editLesson&&editLessonSec>=0&&editLessonIdx>=0) {
      sections[editLessonSec].lessons[editLessonIdx] = {...sections[editLessonSec].lessons[editLessonIdx],...lForm};
    } else {
      sections[targetSection].lessons.push({...lForm});
    }
    const res = await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected._id,sections})});
    const data = await res.json();
    setSelected(data); setCourses(p=>p.map(c=>c._id===data._id?data:c));
    setLM(false); setEL(null); setSave(false);
  }

  async function deleteLesson(si:number,li:number) {
    const sections = JSON.parse(JSON.stringify(selected.sections||[]));
    sections[si].lessons.splice(li,1);
    const res = await fetch("/api/admin/courses",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected._id,sections})});
    const data = await res.json();
    setSelected(data); setCourses(p=>p.map(c=>c._id===data._id?data:c));
  }

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB", TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
        HOVER=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)",
        DROP=isDark?"#111":"#fff", DROPB=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)";

  const INP={width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"14px",fontWeight:300,padding:"9px 0",fontFamily:"inherit"} as React.CSSProperties;
  const SEL={...INP,cursor:"pointer"} as React.CSSProperties;

  const filtered = courses.filter(c=>(c.title||"").toLowerCase().includes(search.toLowerCase()));

  const CATS=["language","development","design","business"];
  const LEVELS=["beginner","intermediate","advanced"];
  const TYPES=["video","pdf","quiz","file"];
  const CAT_LBL:any={language:t("Хэл","Language"),development:t("Хөгжүүлэлт","Development"),design:t("Дизайн","Design"),business:t("Бизнес","Business")};
  const LVL_LBL:any={beginner:t("Анхан","Beginner"),intermediate:t("Дунд","Intermediate"),advanced:t("Ахисан","Advanced")};
  const TYPE_LBL:any={video:t("Видео","Video"),pdf:"PDF",quiz:"Quiz",file:t("Файл","File")};

  const modalBg = {position:"fixed" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"};
  const modalBox = {background:DROP,border:`1px solid ${DROPB}`,borderRadius:"14px",padding:"28px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto" as const};

  return (
    <AdminLayout>
      <div style={{padding:"clamp(24px,4vw,40px) clamp(20px,4vw,48px)",background:BG,minHeight:"100vh"}}>

        {/* Header */}
        <div style={{marginBottom:"28px",paddingBottom:"20px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              {view==="detail"&&selected&&(
                <button onClick={()=>{setView("list");setSelected(null);}} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"12px",display:"flex",alignItems:"center",gap:"4px",fontFamily:"inherit",padding:0}}>
                  <i className="fa-solid fa-arrow-left" style={{fontSize:"10px"}}/>
                  {t("Буцах","Back")}
                </button>
              )}
              <h1 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
                {view==="detail"&&selected ? selected.title : t("Сургалтууд","Courses")}
              </h1>
              {view==="list"&&<span style={{fontSize:"16px",color:MUTED}}>{filtered.length}</span>}
            </div>
            {view==="list"&&(
              <button onClick={()=>setCM(true)} style={{padding:"9px 20px",background:TEXT,color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px"}}>
                <i className="fa-solid fa-plus" style={{fontSize:"11px"}}/>
                {t("Сургалт нэмэх","Add course")}
              </button>
            )}
            {view==="detail"&&selected&&(
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={()=>openEditCourse(selected)} style={{padding:"8px 16px",border:`1px solid ${RULE}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                  <i className="fa-solid fa-pen" style={{fontSize:"11px",marginRight:"5px"}}/>
                  {t("Засах","Edit")}
                </button>
                <button onClick={()=>togglePublish(selected._id,selected.status)} style={{padding:"8px 16px",border:`1px solid ${selected.status==="published"?"rgba(251,191,36,0.3)":"rgba(34,197,94,0.3)"}`,background:selected.status==="published"?"rgba(251,191,36,0.08)":"rgba(34,197,94,0.08)",color:selected.status==="published"?"#f59e0b":"#22c55e",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                  {selected.status==="published"?t("Нуух","Unpublish"):t("Нийтлэх","Publish")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LIST VIEW */}
        {view==="list"&&(
          <>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={t("Хайх...","Search...")}
              style={{...INP,width:"240px",marginBottom:"20px"}}/>

            {loading?(
              <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{t("Ачааллаж байна...","Loading...")}</div>
            ):filtered.length===0?(
              <div style={{padding:"48px 0",textAlign:"center"}}>
                <div style={{fontSize:"13px",color:MUTED,fontWeight:300,marginBottom:"16px"}}>{t("Сургалт байхгүй","No courses yet")}</div>
                <button onClick={()=>setCM(true)} style={{padding:"9px 20px",background:TEXT,color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                  {t("Эхний сургалт нэмэх","Add first course")}
                </button>
              </div>
            ):(
              filtered.map((c:any,i:number)=>(
                <div key={c._id||i} style={{display:"flex",alignItems:"center",gap:"16px",padding:"14px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>{setSelected(c);setView("detail");}}>
                  <span style={{fontSize:"11px",color:MUTED,fontWeight:300,width:"24px",flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"13px",fontWeight:300,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                    <div style={{fontSize:"11px",color:MUTED,marginTop:"1px"}}>{CAT_LBL[c.category]||c.category} · {LVL_LBL[c.level]||c.level} · {(c.sections||[]).reduce((a:number,s:any)=>a+(s.lessons||[]).length,0)} {t("хичээл","lessons")}</div>
                  </div>
                  <span style={{fontSize:"10px",color:c.status==="published"?"#22c55e":MUTED,letterSpacing:"0.06em",flexShrink:0}}>{c.status}</span>
                  <div style={{display:"flex",gap:"6px",flexShrink:0}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>togglePublish(c._id,c.status)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"12px",padding:"3px"}}
                      onMouseEnter={e=>e.currentTarget.style.color=c.status==="published"?"#f59e0b":"#22c55e"}
                      onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                      <i className={`fa-solid ${c.status==="published"?"fa-eye-slash":"fa-eye"}`}/>
                    </button>
                    <button onClick={()=>setDel(c._id)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"12px",padding:"3px"}}
                      onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                      onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                      <i className="fa-solid fa-trash"/>
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* DETAIL VIEW */}
        {view==="detail"&&selected&&(
          <div>
            {/* Course info */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${RULE}`,marginBottom:"32px"}}>
              {[
                {label:t("Ангилал","Category"),val:CAT_LBL[selected.category]||selected.category},
                {label:t("Түвшин","Level"),val:LVL_LBL[selected.level]||selected.level},
                {label:t("Багш","Instructor"),val:selected.instructor||"—"},
              ].map((item,i,arr)=>(
                <div key={i} style={{padding:"16px 0",borderRight:i<arr.length-1?`1px solid ${RULE}`:"none",paddingRight:i<arr.length-1?"20px":"0",paddingLeft:i>0?"20px":"0"}}>
                  <div style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,marginBottom:"4px"}}>{item.label}</div>
                  <div style={{fontSize:"13px",fontWeight:300,color:TEXT}}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* Sections */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"16px"}}>
              <span style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED}}>
                {t("Хэсэг, Хичээлүүд","Sections & Lessons")}
              </span>
              <button onClick={()=>setSM(true)} style={{fontSize:"12px",color:TEXT,background:"none",border:`1px solid ${RULE}`,borderRadius:"100px",padding:"5px 14px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"5px"}}>
                <i className="fa-solid fa-plus" style={{fontSize:"10px"}}/>
                {t("Хэсэг нэмэх","Add section")}
              </button>
            </div>

            {(selected.sections||[]).length===0?(
              <div style={{padding:"32px 0",fontSize:"13px",color:MUTED,fontWeight:300}}>
                {t("Хэсэг байхгүй. Хэсэг нэмнэ үү.","No sections yet. Add a section to get started.")}
              </div>
            ):(
              (selected.sections||[]).map((sec:any,si:number)=>(
                <div key={si} style={{marginBottom:"24px",border:`1px solid ${RULE}`,borderRadius:"8px",overflow:"hidden"}}>
                  {/* Section header */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",borderBottom:`1px solid ${RULE}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      <span style={{fontSize:"10px",color:MUTED,letterSpacing:"0.08em"}}>{String(si+1).padStart(2,"0")}</span>
                      <span style={{fontSize:"13px",fontWeight:400,color:TEXT}}>{sec.title}</span>
                      <span style={{fontSize:"10px",color:MUTED}}>({(sec.lessons||[]).length} {t("хичээл","lessons")})</span>
                    </div>
                    <div style={{display:"flex",gap:"6px"}}>
                      <button onClick={()=>openAddLesson(si)} style={{padding:"5px 12px",border:`1px solid ${RULE}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"11px",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"4px"}}
                        onMouseEnter={e=>e.currentTarget.style.color=TEXT}
                        onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                        <i className="fa-solid fa-plus" style={{fontSize:"9px"}}/>
                        {t("Хичээл нэмэх","Add lesson")}
                      </button>
                      <button onClick={()=>deleteSection(si)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"12px",padding:"3px"}}
                        onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                        onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                        <i className="fa-solid fa-trash"/>
                      </button>
                    </div>
                  </div>

                  {/* Lessons */}
                  {(sec.lessons||[]).length===0?(
                    <div style={{padding:"16px",fontSize:"12px",color:MUTED,fontWeight:300}}>
                      {t("Хичээл байхгүй","No lessons yet")}
                    </div>
                  ):(
                    (sec.lessons||[]).map((lesson:any,li:number)=>(
                      <div key={li} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 16px",borderBottom:li<sec.lessons.length-1?`1px solid ${RULE}`:"none",transition:"background 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{fontSize:"10px",color:MUTED,width:"20px",flexShrink:0}}>{li+1}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"12px",fontWeight:300,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lesson.title}</div>
                          <div style={{display:"flex",alignItems:"center",gap:"6px",marginTop:"2px"}}>
                            <span style={{fontSize:"9px",letterSpacing:"0.08em",color:MUTED,textTransform:"uppercase"}}>{TYPE_LBL[lesson.type]||lesson.type}</span>
                            {lesson.videoUrl&&<span style={{fontSize:"9px",color:MUTED}}>· video</span>}
                            {lesson.pdfUrl&&<span style={{fontSize:"9px",color:MUTED}}>· pdf</span>}
                          </div>
                        </div>
                        <div style={{display:"flex",gap:"4px"}}>
                          <button onClick={()=>openEditLesson(si,li,lesson)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"11px",padding:"3px"}}
                            onMouseEnter={e=>e.currentTarget.style.color=TEXT}
                            onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                            <i className="fa-solid fa-pen"/>
                          </button>
                          <button onClick={()=>deleteLesson(si,li)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"11px",padding:"3px"}}
                            onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                            onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                            <i className="fa-solid fa-trash"/>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Course Modal */}
      {courseModal&&(
        <div style={modalBg}>
          <div style={modalBox}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
              <div style={{fontSize:"16px",fontWeight:300,color:TEXT}}>{editCourse?t("Сургалт засах","Edit course"):t("Шинэ сургалт","New course")}</div>
              <button onClick={closeCM} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"16px"}}><i className="fa-solid fa-xmark"/></button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
              {[
                {label:t("Гарчиг","Title"),key:"title",ph:t("Сургалтын нэр","Course title")},
                {label:"Slug",key:"slug",ph:"react-nextjs-mastery"},
                {label:t("Тайлбар","Description"),key:"description",ph:t("Сургалтын тухай...","About this course...")},
                {label:t("Багш","Instructor"),key:"instructor",ph:t("Багшийн нэр","Instructor name")},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{f.label}</label>
                  <input value={(cForm as any)[f.key]} onChange={e=>{const v=e.target.value;setCF(p=>({...p,[f.key]:v,...(f.key==="title"&&!editCourse?{slug:autoSlug(v)}:{})}));}} style={INP} placeholder={f.ph}/>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px"}}>
                {[
                  {label:t("Ангилал","Category"),key:"category",opts:CATS.map(c=>({val:c,lbl:CAT_LBL[c]}))},
                  {label:t("Түвшин","Level"),key:"level",opts:LEVELS.map(l=>({val:l,lbl:LVL_LBL[l]}))},
                  {label:t("Статус","Status"),key:"status",opts:[{val:"draft",lbl:t("Ноорог","Draft")},{val:"published",lbl:t("Нийтлэх","Publish")}]},
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{f.label}</label>
                    <select value={(cForm as any)[f.key]} onChange={e=>setCF(p=>({...p,[f.key]:e.target.value}))} style={SEL}>
                      {f.opts.map(o=><option key={o.val} value={o.val}>{o.lbl}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:"10px",marginTop:"28px"}}>
              <button onClick={saveCourse} disabled={saving||!cForm.title} style={{flex:1,padding:"10px",background:cForm.title?TEXT:"rgba(0,0,0,0.1)",color:cForm.title?(isDark?"#000":"#fff"):MUTED,border:"none",borderRadius:"100px",cursor:cForm.title?"pointer":"not-allowed",fontSize:"13px",fontWeight:500,fontFamily:"inherit"}}>
                {saving?t("Хадгалж байна...","Saving..."):t("Хадгалах","Save")}
              </button>
              <button onClick={closeCM} style={{padding:"10px 20px",border:`1px solid ${DROPB}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"13px",fontFamily:"inherit"}}>
                {t("Цуцлах","Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {sectionModal&&(
        <div style={modalBg}>
          <div style={{...modalBox,maxWidth:"360px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{fontSize:"15px",fontWeight:300,color:TEXT}}>{t("Хэсэг нэмэх","Add section")}</div>
              <button onClick={()=>{setSM(false);setSF({title:"";}} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"15px"}}><i className="fa-solid fa-xmark"/></button>
            </div>
            <div style={{marginBottom:"20px"}}>
              <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{t("Хэсгийн нэр","Section title")}</label>
              <input value={sForm.title} onChange={e=>setSF({title:e.target.value})} style={INP}
                placeholder={t("Жишээ: 1-р бүлэг — Танилцуулга","e.g. Chapter 1 — Introduction")}
                onKeyDown={e=>e.key==="Enter"&&addSection()} autoFocus/>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={addSection} disabled={saving||!sForm.title.trim()} style={{flex:1,padding:"9px",background:sForm.title.trim()?TEXT:"transparent",color:sForm.title.trim()?(isDark?"#000":"#fff"):MUTED,border:`1px solid ${sForm.title.trim()?TEXT:RULE}`,borderRadius:"100px",cursor:sForm.title.trim()?"pointer":"not-allowed",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>
                {saving?t("Нэмж байна...","Adding..."):t("Нэмэх","Add")}
              </button>
              <button onClick={()=>{setSM(false);setSF({title:""});}} style={{padding:"9px 16px",border:`1px solid ${DROPB}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                {t("Цуцлах","Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {lessonModal&&(
        <div style={modalBg}>
          <div style={modalBox}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
              <div style={{fontSize:"15px",fontWeight:300,color:TEXT}}>{editLesson?t("Хичээл засах","Edit lesson"):t("Хичээл нэмэх","Add lesson")}</div>
              <button onClick={()=>{setLM(false);setEL(null);}} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"15px"}}><i className="fa-solid fa-xmark"/></button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
              <div>
                <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{t("Хичээлийн нэр","Lesson title")}</label>
                <input value={lForm.title} onChange={e=>setLF(p=>({...p,title:e.target.value}))} style={INP} placeholder={t("Хичээлийн нэр","Lesson title")} autoFocus/>
              </div>
              <div>
                <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{t("Төрөл","Type")}</label>
                <select value={lForm.type} onChange={e=>setLF(p=>({...p,type:e.target.value}))} style={SEL}>
                  {TYPES.map(tp=><option key={tp} value={tp}>{TYPE_LBL[tp]}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{t("Тайлбар","Description")}</label>
                <input value={lForm.description} onChange={e=>setLF(p=>({...p,description:e.target.value}))} style={INP} placeholder={t("Хичээлийн тайлбар...","Lesson description...")}/>
              </div>
              <div>
                <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>
                  {t("Видео URL","Video URL")} <span style={{color:MUTED,fontWeight:300,fontSize:"10px"}}>(YouTube / Drive / Supabase)</span>
                </label>
                <input value={lForm.videoUrl} onChange={e=>setLF(p=>({...p,videoUrl:e.target.value}))} style={INP} placeholder="https://youtube.com/watch?v=... or https://...supabase.co/..."/>
              </div>
              <div>
                <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>
                  PDF URL <span style={{color:MUTED,fontWeight:300,fontSize:"10px"}}>(Supabase / Drive)</span>
                </label>
                <input value={lForm.pdfUrl} onChange={e=>setLF(p=>({...p,pdfUrl:e.target.value}))} style={INP} placeholder="https://...supabase.co/.../file.pdf"/>
              </div>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"24px"}}>
              <button onClick={saveLesson} disabled={saving||!lForm.title.trim()} style={{flex:1,padding:"10px",background:lForm.title.trim()?TEXT:"transparent",color:lForm.title.trim()?(isDark?"#000":"#fff"):MUTED,border:`1px solid ${lForm.title.trim()?TEXT:RULE}`,borderRadius:"100px",cursor:lForm.title.trim()?"pointer":"not-allowed",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>
                {saving?t("Хадгалж байна...","Saving..."):t("Хадгалах","Save")}
              </button>
              <button onClick={()=>{setLM(false);setEL(null);}} style={{padding:"10px 16px",border:`1px solid ${DROPB}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                {t("Цуцлах","Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm&&(
        <div style={modalBg}>
          <div style={{...modalBox,maxWidth:"300px"}}>
            <div style={{fontSize:"14px",fontWeight:400,color:TEXT,marginBottom:"6px"}}>{t("Устгах уу?","Delete this course?")}</div>
            <div style={{fontSize:"12px",color:MUTED,fontWeight:300,marginBottom:"20px"}}>{t("Бүх хичээл, контент устна.","All lessons and content will be deleted.")}</div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>delCourse(delConfirm)} style={{flex:1,padding:"9px",background:"#ef4444",border:"none",color:"#fff",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>{t("Устгах","Delete")}</button>
              <button onClick={()=>setDel(null)} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${DROPB}`,color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>{t("Цуцлах","Cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
