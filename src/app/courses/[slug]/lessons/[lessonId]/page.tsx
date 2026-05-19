"use client";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function LessonPage() {
  const { isDark, mounted } = useTheme();
  const { lang } = useLang();
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug     = params.slug as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse]       = useState<any>(null);
  const [lesson, setLesson]       = useState<any>(null);
  const [allLessons, setAll]      = useState<any[]>([]);
  const [completedIds, setDone]   = useState<string[]>([]);
  const [sidebarOpen, setSidebar] = useState(false);
  const [pdfPage, setPdfPage]     = useState(1);
  const [pdfTotal, setPdfTotal]   = useState(1);
  const [markingDone, setMarking] = useState(false);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    if(status==="unauthenticated") router.push("/auth/login");
  },[status]);

  useEffect(()=>{
    if(!slug||!lessonId) return;
    fetch(`/api/courses/${slug}/lessons/${lessonId}`)
      .then(r=>r.json())
      .then(d=>{
        setCourse(d.course);
        setLesson(d.lesson);
        setAll(d.allLessons||[]);
        setDone(d.completedIds||[]);
        setPdfPage(1);
      }).catch(()=>{});
  },[slug,lessonId]);

  async function markDone() {
    if(!lesson||markingDone) return;
    setMarking(true);
    try {
      await fetch(`/api/courses/${slug}/lessons/${lessonId}/complete`,{method:"POST"});
      setDone(p=>[...p,lessonId]);
    } finally { setMarking(false); }
  }

  const isDone = completedIds.includes(lessonId);

  // Next/prev lesson
  const curIdx = allLessons.findIndex(l=>l._id?.toString()===lessonId);
  const prevLesson = curIdx>0?allLessons[curIdx-1]:null;
  const nextLesson = curIdx<allLessons.length-1?allLessons[curIdx+1]:null;

  // YouTube embed ID
  function ytId(url:string) {
    return url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]||"";
  }

  // Google Drive embed
  function driveEmbed(url:string) {
    const id = url.match(/\/d\/([^/]+)/)?.[1];
    return id?`https://drive.google.com/file/d/${id}/preview`:url;
  }

  // PDF direct URL with page
  function pdfSrc(url:string) {
    return `${url}#page=${pdfPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  }

  function isYoutube(url:string){ return url.includes("youtube")||url.includes("youtu.be"); }
  function isDrive(url:string){ return url.includes("drive.google"); }
  function isPdf(url:string){ return url.toLowerCase().includes(".pdf")||url.includes("supabase")||url.includes("pdf"); }

  if(!mounted||status==="loading") return <div style={{minHeight:"100vh",background:"#F2F0EB"}}/>;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const HOVER = isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)";
  const ACTIVE_BG = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)";

  if(!course||!lesson) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:"13px",color:MUTED,fontWeight:300}}>
        {t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>

      {/* Top bar */}
      <div style={{borderBottom:`1px solid ${RULE}`,padding:"0 clamp(16px,3vw,32px)",display:"flex",alignItems:"center",gap:"16px",height:"52px",background:BG}}>
        <Link href={`/courses/${slug}`} style={{fontSize:"12px",color:MUTED,textDecoration:"none",display:"flex",alignItems:"center",gap:"4px",flexShrink:0}}>
          <i className="fa-solid fa-arrow-left" style={{fontSize:"10px"}}/>
          {t("Буцах","Back","戻る","돌아가기","Retour","Zurück","返回")}
        </Link>
        <div style={{width:"1px",height:"16px",background:RULE,flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"11px",color:MUTED,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.title}</div>
          <div style={{fontSize:"13px",fontWeight:400,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lesson.title}</div>
        </div>
        {/* Progress */}
        <div style={{fontSize:"11px",color:MUTED,flexShrink:0,display:"flex",alignItems:"center",gap:"6px"}}>
          <div style={{width:"60px",height:"2px",background:RULE,borderRadius:"1px",overflow:"hidden"}}>
            <div style={{width:`${Math.round((completedIds.length/Math.max(allLessons.length,1))*100)}%`,height:"100%",background:"#22c55e",transition:"width 0.3s"}}/>
          </div>
          <span>{completedIds.length}/{allLessons.length}</span>
        </div>
        {/* Mobile sidebar toggle */}
        <button onClick={()=>setSidebar(!sidebarOpen)} className="sidebar-toggle" style={{background:"none",border:`1px solid ${RULE}`,color:MUTED,width:"32px",height:"32px",borderRadius:"6px",cursor:"pointer",display:"none",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <i className={`fa-solid ${sidebarOpen?"fa-xmark":"fa-list"}`} style={{fontSize:"12px"}}/>
        </button>
      </div>

      <div style={{display:"flex",height:"calc(100vh - 112px)"}}>

        {/* Sidebar */}
        <aside style={{width:"240px",flexShrink:0,borderRight:`1px solid ${RULE}`,overflowY:"auto",background:BG,display:"flex",flexDirection:"column"}} className="lesson-sidebar">
          <div style={{padding:"16px 16px 8px",borderBottom:`1px solid ${RULE}`}}>
            <div style={{fontSize:"9px",letterSpacing:"0.14em",textTransform:"uppercase",color:MUTED}}>
              {t("Хичээлүүд","Lessons","レッスン","레슨","Leçons","Lektionen","课程列表")}
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
            {allLessons.map((l:any,i:number)=>{
              const isActive = l._id?.toString()===lessonId;
              const done = completedIds.includes(l._id?.toString());
              return (
                <Link key={l._id?.toString()||i} href={`/courses/${slug}/lessons/${l._id}`} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 10px",borderRadius:"6px",textDecoration:"none",marginBottom:"1px",background:isActive?ACTIVE_BG:"transparent",transition:"background 0.15s"}}
                  onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=HOVER;}}
                  onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                  <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`1px solid ${done?"#22c55e":isActive?TEXT:RULE}`,background:done?"rgba(34,197,94,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {done
                      ?<i className="fa-solid fa-check" style={{fontSize:"8px",color:"#22c55e"}}/>
                      :<span style={{fontSize:"8px",color:isActive?TEXT:MUTED,fontWeight:500}}>{i+1}</span>
                    }
                  </div>
                  <span style={{fontSize:"12px",color:isActive?TEXT:MUTED,fontWeight:isActive?400:300,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{l.title}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen&&(
          <div style={{position:"fixed",inset:0,zIndex:100}} onClick={()=>setSidebar(false)}>
            <aside style={{position:"absolute",top:0,left:0,bottom:0,width:"260px",background:BG,borderRight:`1px solid ${RULE}`,overflowY:"auto",padding:"16px 8px",zIndex:101}} onClick={e=>e.stopPropagation()}>
              {allLessons.map((l:any,i:number)=>{
                const isActive=l._id?.toString()===lessonId;
                const done=completedIds.includes(l._id?.toString());
                return(
                  <Link key={l._id?.toString()||i} href={`/courses/${slug}/lessons/${l._id}`} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",borderRadius:"6px",textDecoration:"none",marginBottom:"2px",background:isActive?ACTIVE_BG:"transparent"}}>
                    <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`1px solid ${done?"#22c55e":isActive?TEXT:RULE}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {done?<i className="fa-solid fa-check" style={{fontSize:"8px",color:"#22c55e"}}/>:<span style={{fontSize:"8px",color:isActive?TEXT:MUTED}}>{i+1}</span>}
                    </div>
                    <span style={{fontSize:"13px",color:isActive?TEXT:MUTED,fontWeight:isActive?400:300}}>{l.title}</span>
                  </Link>
                );
              })}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

          {/* Video */}
          {lesson.videoUrl&&(
            <div style={{background:"#000",flexShrink:0}}>
              <div style={{maxWidth:"900px",margin:"0 auto",aspectRatio:"16/9",position:"relative"}}>
                {isYoutube(lesson.videoUrl)?(
                  <iframe src={`https://www.youtube.com/embed/${ytId(lesson.videoUrl)}?autoplay=0&rel=0`} style={{width:"100%",height:"100%",border:"none"}} allowFullScreen/>
                ):isDrive(lesson.videoUrl)?(
                  <iframe src={driveEmbed(lesson.videoUrl)} style={{width:"100%",height:"100%",border:"none"}} allowFullScreen/>
                ):(
                  <video src={lesson.videoUrl} controls style={{width:"100%",height:"100%"}}/>
                )}
              </div>
            </div>
          )}

          {/* PDF viewer — clean editorial */}
          {lesson.pdfUrl&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"600px"}}>
              {/* PDF controls */}
              <div style={{borderBottom:`1px solid ${RULE}`,padding:"10px clamp(16px,3vw,32px)",display:"flex",alignItems:"center",gap:"12px",background:BG,flexShrink:0}}>
                <span style={{fontSize:"11px",color:MUTED,letterSpacing:"0.06em"}}>PDF</span>
                <div style={{flex:1}}/>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <button onClick={()=>setPdfPage(p=>Math.max(1,p-1))} disabled={pdfPage<=1} style={{width:"28px",height:"28px",border:`1px solid ${RULE}`,background:"transparent",color:pdfPage<=1?MUTED:TEXT,borderRadius:"6px",cursor:pdfPage<=1?"not-allowed":"pointer",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <i className="fa-solid fa-chevron-left"/>
                  </button>
                  <span style={{fontSize:"12px",color:MUTED,minWidth:"80px",textAlign:"center"}}>
                    {t("Хуудас","Page","ページ","페이지","Page","Seite","页面")} {pdfPage}
                  </span>
                  <button onClick={()=>setPdfPage(p=>p+1)} style={{width:"28px",height:"28px",border:`1px solid ${RULE}`,background:"transparent",color:TEXT,borderRadius:"6px",cursor:"pointer",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <i className="fa-solid fa-chevron-right"/>
                  </button>
                </div>
                <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:"11px",color:MUTED,textDecoration:"none",display:"flex",alignItems:"center",gap:"4px"}}>
                  <i className="fa-solid fa-arrow-up-right-from-square" style={{fontSize:"10px"}}/>
                  {t("Нээх","Open","開く","열기","Ouvrir","Öffnen","打开")}
                </a>
              </div>
              {/* PDF frame */}
              <div style={{flex:1,background:isDark?"#111":"#e8e8e8",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px",overflowY:"auto"}}>
                <div style={{width:"100%",maxWidth:"760px",background:"#fff",boxShadow:"0 2px 20px rgba(0,0,0,0.15)",aspectRatio:"8.5/11"}}>
                  <iframe
                    key={`${lesson.pdfUrl}-${pdfPage}`}
                    src={pdfSrc(lesson.pdfUrl)}
                    style={{width:"100%",height:"100%",border:"none"}}
                    title="PDF viewer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description + actions */}
          <div style={{padding:"clamp(16px,3vw,32px)",borderTop:`1px solid ${RULE}`,flexShrink:0}}>
            {lesson.description&&(
              <p style={{fontSize:"14px",color:MUTED,lineHeight:1.8,fontWeight:300,marginBottom:"24px",maxWidth:"680px"}}>{lesson.description}</p>
            )}

            {/* Prev / Next / Done */}
            <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
              {prevLesson&&(
                <Link href={`/courses/${slug}/lessons/${prevLesson._id}`} style={{padding:"8px 18px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",borderRadius:"100px",textDecoration:"none",display:"flex",alignItems:"center",gap:"5px"}}>
                  <i className="fa-solid fa-arrow-left" style={{fontSize:"10px"}}/>
                  {t("Өмнөх","Previous","前へ","이전","Précédent","Zurück","上一个")}
                </Link>
              )}
              <button onClick={markDone} disabled={isDone||markingDone} style={{padding:"8px 18px",background:isDone?"rgba(34,197,94,0.08)":"transparent",border:`1px solid ${isDone?"rgba(34,197,94,0.3)":RULE}`,color:isDone?"#22c55e":MUTED,fontSize:"12px",borderRadius:"100px",cursor:isDone?"default":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"5px"}}>
                {isDone
                  ?<><i className="fa-solid fa-check" style={{fontSize:"10px"}}/>{t("Дүүргэсэн","Completed","完了","완료","Complété","Abgeschlossen","已完成")}</>
                  :<>{t("Дүүргэх","Mark complete","完了にする","완료로 표시","Marquer complété","Als erledigt markieren","标记完成")}</>
                }
              </button>
              {nextLesson&&(
                <Link href={`/courses/${slug}/lessons/${nextLesson._id}`} style={{padding:"8px 18px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",textDecoration:"none",display:"flex",alignItems:"center",gap:"5px",marginLeft:"auto"}}>
                  {t("Дараах","Next","次へ","다음","Suivant","Weiter","下一个")}
                  <i className="fa-solid fa-arrow-right" style={{fontSize:"10px"}}/>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .lesson-sidebar{display:none!important;}
          .sidebar-toggle{display:flex!important;}
        }
      `}</style>
    </div>
  );
}
