"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CoursePlayer() {
  const { slug } = useParams();
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [course, setCourse]       = useState<any>(null);
  const [progress, setProgress]   = useState<any>({ lessons: [], lastLessonId: "" });
  const [activeLesson, setLesson] = useState<any>(null);
  const [activeSection, setSection] = useState<any>(null);
  const [tab, setTab]             = useState<"overview"|"resources"|"notes"|"discussion">("overview");
  const [loading, setLoad]        = useState(true);
  const [comments, setComments]   = useState<any[]>([]);
  const [comment, setComment]     = useState("");
  const [note, setNote]           = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [quizAnswers, setQuizA]   = useState<Record<number,number>>({});
  const [quizSubmitted, setQuizS] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [sidebarOpen, setSidebar] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimer = useRef<NodeJS.Timeout|null>(null);

  const t=(mn:string,en:string)=>lang==="mn"?mn:en;
  const BG    =isDark?"#0a0a0a":"#f0f0f0";
  const CARD  =isDark?"#111":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e0e0e0";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#999";
  const MUTED2=isDark?"#888":"#666";

  // Total lessons count
  const totalLessons = course?.sections?.reduce((a: number, s: any) => a + (s.lessons?.length||0), 0) || 0;

  // Get lesson progress
  function getLessonP(lessonId: string) {
    return progress?.lessons?.find((l: any) => l.lessonId === lessonId);
  }

  // Completion percent
  const completedCount = progress?.lessons?.filter((l: any) => l.completed).length || 0;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/courses/${slug}`)
      .then(r => r.json())
      .then(data => {
        setCourse(data);
        // Load progress
        fetch(`/api/progress?courseId=${data._id}`)
          .then(r => r.json())
          .then(p => {
            setProgress(p);
            // Resume last lesson or start first
            const firstSection = data.sections?.[0];
            const firstLesson  = firstSection?.lessons?.[0];
            if (p?.lastLessonId) {
              // Find last lesson
              let found = false;
              for (const sec of data.sections || []) {
                for (const les of sec.lessons || []) {
                  if (les._id === p.lastLessonId) {
                    setSection(sec); setLesson(les); found = true; break;
                  }
                }
                if (found) break;
              }
              if (!found && firstLesson) { setSection(firstSection); setLesson(firstLesson); }
            } else if (firstLesson) {
              setSection(firstSection); setLesson(firstLesson);
            }
          });
      })
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [slug]);

  // Load comments when tab changes
  useEffect(() => {
    if (tab === "discussion" && course && activeLesson) {
      fetch(`/api/comments?courseId=${course._id}&lessonId=${activeLesson._id}`)
        .then(r => r.json()).then(d => setComments(Array.isArray(d) ? d : []));
    }
  }, [tab, activeLesson, course]);

  // Load note for current lesson
  useEffect(() => {
    if (activeLesson) {
      const lp = getLessonP(activeLesson._id);
      setNote(lp?.notes || "");
      setQuizA({});
      setQuizS(false);
      setQuizScore(0);
    }
  }, [activeLesson]);

  // Video time save
  function handleTimeUpdate() {
    if (!videoRef.current || !activeLesson || !course) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id, lessonId: activeLesson._id, watchTime: currentTime, totalLessons }),
      });
    }, 3000);
  }

  // Resume video from saved time
  useEffect(() => {
    if (videoRef.current && activeLesson?.type === "video") {
      const lp = getLessonP(activeLesson._id);
      if (lp?.watchTime && lp.watchTime > 5) {
        videoRef.current.currentTime = lp.watchTime;
      }
    }
  }, [activeLesson]);

  // Mark complete
  async function markComplete(lessonId: string, completed: boolean) {
    if (!course) return;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course._id, lessonId, completed, totalLessons }),
    });
    setProgress((prev: any) => {
      const lessons = [...(prev?.lessons || [])];
      const idx = lessons.findIndex((l: any) => l.lessonId === lessonId);
      if (idx >= 0) lessons[idx] = { ...lessons[idx], completed };
      else lessons.push({ lessonId, completed, watchTime: 0, quizScore: -1 });
      return { ...prev, lessons, completedCount: lessons.filter((l: any) => l.completed).length };
    });
  }

  // Toggle bookmark
  async function toggleBookmark(lessonId: string) {
    if (!course) return;
    const current = getLessonP(lessonId)?.bookmarked || false;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course._id, lessonId, bookmarked: !current }),
    });
    setProgress((prev: any) => {
      const lessons = [...(prev?.lessons || [])];
      const idx = lessons.findIndex((l: any) => l.lessonId === lessonId);
      if (idx >= 0) lessons[idx] = { ...lessons[idx], bookmarked: !current };
      else lessons.push({ lessonId, bookmarked: !current });
      return { ...prev, lessons };
    });
  }

  // Save note
  async function saveNote() {
    if (!course || !activeLesson) return;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course._id, lessonId: activeLesson._id, notes: note }),
    });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  // Submit quiz
  function submitQuiz() {
    if (!activeLesson?.quiz) return;
    let score = 0;
    activeLesson.quiz.forEach((q: any, i: number) => {
      if (quizAnswers[i] === q.correct) score++;
    });
    const passed = score >= Math.ceil(activeLesson.quiz.length * 0.7);
    setQuizScore(score);
    setQuizS(true);
    if (passed && course && activeLesson) {
      markComplete(activeLesson._id, true);
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id, lessonId: activeLesson._id, quizScore: score, completed: passed }),
      });
    }
  }

  // Post comment
  async function postComment() {
    if (!comment.trim() || !course || !activeLesson) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course._id, lessonId: activeLesson._id, content: comment }),
    });
    const data = await res.json();
    setComments(prev => [data, ...prev]);
    setComment("");
  }

  // Next lesson
  function goNext() {
    if (!course) return;
    let foundCurrent = false;
    for (const sec of course.sections) {
      for (const les of sec.lessons) {
        if (foundCurrent) { setSection(sec); setLesson(les); return; }
        if (les._id === activeLesson?._id) foundCurrent = true;
      }
    }
  }

  // Prev lesson
  function goPrev() {
    if (!course) return;
    let prev: any = null;
    let prevSec: any = null;
    for (const sec of course.sections) {
      for (const les of sec.lessons) {
        if (les._id === activeLesson?._id && prev) { setSection(prevSec); setLesson(prev); return; }
        prev = les; prevSec = sec;
      }
    }
  }


  // Convert various URLs to embed format
  function toEmbedUrl(url: string): string {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
    // Google Drive
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    return url;
  }

  function isEmbedUrl(url: string): boolean {
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("drive.google.com") || url.includes("/embed/");
  }

  if (!mounted || loading) return (
    <div style={{ minHeight:"100vh", background: isDark?"#000":"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:"28px", color:MUTED }}/>
    </div>
  );

  if (!course) return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"12px" }}>
      <i className="fa-solid fa-graduation-cap" style={{ fontSize:"40px", color:MUTED }}/>
      <div style={{ color:TEXT, fontSize:"16px", fontWeight:600 }}>{t("Сургалт олдсонгүй","Course not found")}</div>
      <Link href="/courses" style={{ color:MUTED2, fontSize:"13px", textDecoration:"none" }}>← {t("Бүх сургалт","All courses")}</Link>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'Inter',-apple-system,sans-serif", display:"flex", flexDirection:"column" }}>

      {/* Top bar */}
      <div style={{ height:"52px", background:CARD, borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", padding:"0 16px", gap:"12px", position:"sticky", top:0, zIndex:100, flexShrink:0 }}>
        <Link href="/courses" style={{ color:MUTED, fontSize:"13px", textDecoration:"none", display:"flex", alignItems:"center", gap:"5px" }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize:"11px" }}/>
        </Link>
        <div style={{ width:"1px", height:"18px", background:BORDER }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:TEXT, fontSize:"13px", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{course.title}</div>
        </div>
        {/* Progress bar */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"120px", height:"4px", background:isDark?"#222":"#e0e0e0", borderRadius:"2px" }}>
            <div style={{ height:"100%", width:`${percent}%`, background:"#34d399", borderRadius:"2px", transition:"width 0.3s" }}/>
          </div>
          <span style={{ color:MUTED, fontSize:"12px", whiteSpace:"nowrap" }}>{percent}%</span>
        </div>
        {percent === 100 && (
          <div style={{ background:"rgba(52,211,153,0.15)", color:"#34d399", padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:700, display:"flex", alignItems:"center", gap:"4px" }}>
            <i className="fa-solid fa-certificate"/>
            {t("Дууссан!","Completed!")}
          </div>
        )}
        <button onClick={()=>setSidebar(!sidebarOpen)} style={{ background:"none", border:`1px solid ${BORDER}`, color:MUTED, padding:"5px 10px", borderRadius:"6px", cursor:"pointer", fontSize:"11px" }}>
          <i className={`fa-solid fa-${sidebarOpen?"sidebar":"bars"}`}/>
        </button>
      </div>

      {/* Main layout */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width:"300px", flexShrink:0, background:CARD, borderRight:`1px solid ${BORDER}`, overflowY:"auto", height:"calc(100vh - 52px)", position:"sticky", top:"52px" }}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${BORDER}` }}>
              <div style={{ color:TEXT, fontSize:"13px", fontWeight:700, marginBottom:"6px" }}>{t("Хичээлүүд","Course Content")}</div>
              <div style={{ color:MUTED, fontSize:"11px" }}>{completedCount}/{totalLessons} {t("дууссан","completed")}</div>
            </div>
            {course.sections?.map((sec: any, si: number) => (
              <div key={sec._id||si}>
                <div style={{ padding:"10px 16px 6px", background:isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)", borderBottom:`1px solid ${BORDER}` }}>
                  <div style={{ color:TEXT, fontSize:"12px", fontWeight:700 }}>{sec.title}</div>
                  <div style={{ color:MUTED, fontSize:"10px" }}>{sec.lessons?.length || 0} {t("хичээл","lessons")}</div>
                </div>
                {sec.lessons?.map((les: any, li: number) => {
                  const lp = getLessonP(les._id);
                  const isActive = activeLesson?._id === les._id;
                  const ICON = { video:"fa-circle-play", pdf:"fa-file-pdf", quiz:"fa-question-circle", file:"fa-file-arrow-down" }[les.type as string] || "fa-circle-play";
                  return (
                    <div key={les._id||li} onClick={() => { setSection(sec); setLesson(les); setQuizA({}); setQuizS(false); }}
                      style={{ padding:"10px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px", borderBottom:`1px solid ${BORDER}`, background: isActive?(isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"):"transparent", transition:"all 0.15s" }}
                      onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)";}}
                      onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                      {lp?.completed
                        ? <i className="fa-solid fa-circle-check" style={{ color:"#34d399", fontSize:"14px", flexShrink:0 }}/>
                        : <i className={`fa-${isActive?"solid":"regular"} ${ICON}`} style={{ color:isActive?TEXT:MUTED, fontSize:"14px", flexShrink:0 }}/>
                      }
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:isActive?TEXT:MUTED2, fontSize:"12px", fontWeight:isActive?600:400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{les.title}</div>
                        <div style={{ color:MUTED, fontSize:"10px", marginTop:"1px" }}>
                          {les.type === "video" && les.duration ? `${Math.floor(les.duration/60)}:${String(les.duration%60).padStart(2,"0")}` : les.type}
                          {lp?.bookmarked && <i className="fa-solid fa-bookmark" style={{ marginLeft:"6px", color:"#f59e0b", fontSize:"9px" }}/>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Content area */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          {activeLesson ? (
            <>
              {/* Video */}
              {activeLesson.type === "video" && (
                <div style={{ background:"#000", width:"100%", aspectRatio:"16/9", maxHeight:"60vh" }}>
                  {activeLesson.videoUrl ? (
                    isEmbedUrl(activeLesson.videoUrl) ? (
                      <iframe src={toEmbedUrl(activeLesson.videoUrl)} style={{ width:"100%", height:"100%", border:"none" }} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
                    ) : (
                      <video ref={videoRef} src={activeLesson.videoUrl} controls style={{ width:"100%", height:"100%" }}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => { markComplete(activeLesson._id, true); setTimeout(goNext, 2000); }}/>
                    )
                  ) : (
                    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px" }}>
                      <i className="fa-solid fa-film" style={{ fontSize:"40px", color:"#333" }}/>
                      <span style={{ color:"#555", fontSize:"13px" }}>{t("Видео оруулаагүй","No video uploaded")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* PDF */}
              {activeLesson.type === "pdf" && (
                <div style={{ background:"#000", width:"100%", height:"70vh" }}>
                  {activeLesson.pdfUrl ? (
                    <iframe src={activeLesson.pdfUrl} style={{ width:"100%", height:"100%", border:"none" }}/>
                  ) : (
                    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px" }}>
                      <i className="fa-solid fa-file-pdf" style={{ fontSize:"40px", color:"#333" }}/>
                      <span style={{ color:"#555", fontSize:"13px" }}>{t("PDF оруулаагүй","No PDF uploaded")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* File download */}
              {activeLesson.type === "file" && (
                <div style={{ padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
                  <i className="fa-solid fa-file-arrow-down" style={{ fontSize:"48px", color:MUTED }}/>
                  <div style={{ color:TEXT, fontSize:"16px", fontWeight:600 }}>{activeLesson.title}</div>
                  {activeLesson.fileUrl ? (
                    <a href={activeLesson.fileUrl} download={activeLesson.fileName || "file"} onClick={() => markComplete(activeLesson._id, true)}
                      style={{ background:isDark?"#fff":"#000", color:isDark?"#000":"#fff", padding:"10px 24px", borderRadius:"8px", textDecoration:"none", fontWeight:600, display:"flex", alignItems:"center", gap:"8px" }}>
                      <i className="fa-solid fa-download"/>
                      {t("Татаж авах","Download")}
                    </a>
                  ) : (
                    <span style={{ color:MUTED, fontSize:"13px" }}>{t("Файл оруулаагүй","No file uploaded")}</span>
                  )}
                </div>
              )}

              {/* Quiz */}
              {activeLesson.type === "quiz" && (
                <div style={{ padding:"24px", maxWidth:"700px", margin:"0 auto", width:"100%" }}>
                  <div style={{ marginBottom:"20px" }}>
                    <h2 style={{ color:TEXT, fontSize:"18px", fontWeight:700, marginBottom:"4px" }}>{activeLesson.title}</h2>
                    <p style={{ color:MUTED, fontSize:"13px" }}>{activeLesson.quiz?.length || 0} {t("асуулт","questions")} · {t("Тэнцэхийн тулд 70%+ авах шаардлагатай","Need 70%+ to pass")}</p>
                  </div>

                  {quizSubmitted ? (
                    <div style={{ background: quizScore/activeLesson.quiz.length >= 0.7 ? "rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)", border:`1px solid ${quizScore/activeLesson.quiz.length >= 0.7 ? "rgba(52,211,153,0.3)":"rgba(248,113,113,0.3)"}`, borderRadius:"12px", padding:"20px", marginBottom:"20px", textAlign:"center" }}>
                      <div style={{ fontSize:"32px", marginBottom:"8px" }}>{quizScore/activeLesson.quiz.length >= 0.7 ? "🎉":"💪"}</div>
                      <div style={{ color:TEXT, fontSize:"18px", fontWeight:700, marginBottom:"4px" }}>{quizScore}/{activeLesson.quiz.length} {t("зөв","correct")}</div>
                      <div style={{ color:MUTED, fontSize:"13px" }}>{quizScore/activeLesson.quiz.length >= 0.7 ? t("Тэнцлээ!","Passed!") : t("Дахин оролдоно уу","Try again")}</div>
                      <button onClick={()=>{setQuizA({});setQuizS(false);}} style={{ marginTop:"12px", background:"none", border:`1px solid ${BORDER}`, color:TEXT, padding:"7px 16px", borderRadius:"8px", cursor:"pointer", fontSize:"13px" }}>
                        {t("Дахин оролдох","Try again")}
                      </button>
                    </div>
                  ) : null}

                  {activeLesson.quiz?.map((q: any, qi: number) => (
                    <div key={qi} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
                      <div style={{ color:TEXT, fontSize:"14px", fontWeight:600, marginBottom:"12px" }}>{qi+1}. {q.question}</div>
                      {q.options?.map((opt: string, oi: number) => {
                        const selected = quizAnswers[qi] === oi;
                        const correct  = quizSubmitted && q.correct === oi;
                        const wrong    = quizSubmitted && selected && !correct;
                        return (
                          <button key={oi} disabled={quizSubmitted} onClick={() => !quizSubmitted && setQuizA(prev => ({...prev,[qi]:oi}))}
                            style={{ width:"100%", textAlign:"left", padding:"10px 14px", borderRadius:"8px", marginBottom:"6px", cursor:quizSubmitted?"default":"pointer", fontSize:"13px", display:"flex", alignItems:"center", gap:"10px", transition:"all 0.15s",
                              border: correct ? "1px solid rgba(52,211,153,0.5)" : wrong ? "1px solid rgba(248,113,113,0.5)" : selected ? `1px solid ${isDark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)"}` : `1px solid ${BORDER}`,
                              background: correct ? "rgba(52,211,153,0.1)" : wrong ? "rgba(248,113,113,0.1)" : selected ? (isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)") : (isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)"),
                              color: correct ? "#34d399" : wrong ? "#f87171" : TEXT,
                            }}>
                            <span style={{ width:"22px", height:"22px", borderRadius:"50%", border:`1px solid ${correct?"#34d399":wrong?"#f87171":BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:700, flexShrink:0 }}>
                              {correct ? "✓" : wrong ? "✗" : ["A","B","C","D"][oi]}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                      {quizSubmitted && q.explanation && (
                        <div style={{ marginTop:"8px", padding:"8px 12px", background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)", borderRadius:"8px", color:MUTED, fontSize:"12px" }}>
                          <i className="fa-solid fa-lightbulb" style={{ marginRight:"6px", color:"#f59e0b" }}/>{q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted && activeLesson.quiz?.length > 0 && (
                    <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                      style={{ width:"100%", height:"44px", background: Object.keys(quizAnswers).length < activeLesson.quiz.length ? (isDark?"#222":"#ddd") : (isDark?"#fff":"#000"), color: Object.keys(quizAnswers).length < activeLesson.quiz.length ? MUTED : (isDark?"#000":"#fff"), border:"none", borderRadius:"10px", fontWeight:600, cursor: Object.keys(quizAnswers).length < activeLesson.quiz.length ? "not-allowed":"pointer", fontSize:"14px" }}>
                      {t("Илгээх","Submit")} →
                    </button>
                  )}
                </div>
              )}

              {/* Lesson header */}
              <div style={{ padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:`1px solid ${BORDER}`, background:CARD }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                    <span style={{ color:MUTED, fontSize:"12px" }}>{activeSection?.title}</span>
                    <span style={{ color:BORDER }}>›</span>
                    <span style={{ color:TEXT, fontSize:"13px", fontWeight:600 }}>{activeLesson.title}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                  {/* Bookmark */}
                  <button onClick={() => toggleBookmark(activeLesson._id)} style={{ background:"none", border:`1px solid ${BORDER}`, color: getLessonP(activeLesson._id)?.bookmarked ? "#f59e0b" : MUTED, padding:"5px 10px", borderRadius:"6px", cursor:"pointer", fontSize:"12px" }}>
                    <i className={`fa-${getLessonP(activeLesson._id)?.bookmarked?"solid":"regular"} fa-bookmark`}/>
                  </button>
                  {/* Complete */}
                  <button onClick={() => markComplete(activeLesson._id, !getLessonP(activeLesson._id)?.completed)}
                    style={{ background: getLessonP(activeLesson._id)?.completed ? "rgba(52,211,153,0.1)" : "none", border:`1px solid ${getLessonP(activeLesson._id)?.completed ? "rgba(52,211,153,0.4)" : BORDER}`, color: getLessonP(activeLesson._id)?.completed ? "#34d399" : MUTED, padding:"5px 12px", borderRadius:"6px", cursor:"pointer", fontSize:"12px", display:"flex", alignItems:"center", gap:"5px" }}>
                    <i className={`fa-solid ${getLessonP(activeLesson._id)?.completed ? "fa-circle-check" : "fa-circle"}`}/>
                    {getLessonP(activeLesson._id)?.completed ? t("Дууссан","Completed") : t("Дуусгах","Mark complete")}
                  </button>
                  {/* Prev/Next */}
                  <button onClick={goPrev} style={{ background:"none", border:`1px solid ${BORDER}`, color:MUTED, padding:"5px 10px", borderRadius:"6px", cursor:"pointer", fontSize:"12px" }}>
                    <i className="fa-solid fa-chevron-left"/>
                  </button>
                  <button onClick={goNext} style={{ background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", border:`1px solid ${BORDER}`, color:TEXT, padding:"5px 12px", borderRadius:"6px", cursor:"pointer", fontSize:"12px", display:"flex", alignItems:"center", gap:"5px" }}>
                    {t("Дараах","Next")} <i className="fa-solid fa-chevron-right"/>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:`1px solid ${BORDER}`, background:CARD, padding:"0 24px" }}>
                {(["overview","resources","notes","discussion"] as const).map(tb => (
                  <button key={tb} onClick={() => setTab(tb)} style={{ padding:"12px 16px", background:"none", border:"none", borderBottom: tab===tb ? "2px solid "+TEXT : "2px solid transparent", color: tab===tb ? TEXT : MUTED, fontSize:"13px", fontWeight: tab===tb ? 600 : 400, cursor:"pointer", textTransform:"capitalize" }}>
                    {tb === "overview"    ? t("Тойм","Overview")
                    :tb === "resources"  ? t("Материал","Resources")
                    :tb === "notes"      ? t("Тэмдэглэл","Notes")
                    :                     t("Хэлэлцүүлэг","Discussion")}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ padding:"24px", flex:1, background:BG }}>
                {tab === "overview" && (
                  <div style={{ maxWidth:"700px" }}>
                    <h2 style={{ color:TEXT, fontSize:"16px", fontWeight:700, marginBottom:"12px" }}>{activeLesson.title}</h2>
                    <p style={{ color:MUTED2, fontSize:"14px", lineHeight:1.7 }}>{activeLesson.description || t("Тайлбар байхгүй","No description available")}</p>
                    {course.instructor && (
                      <div style={{ marginTop:"20px", padding:"14px 16px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
                        <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <i className="fa-solid fa-user" style={{ color:MUTED, fontSize:"14px" }}/>
                        </div>
                        <div>
                          <div style={{ color:TEXT, fontSize:"13px", fontWeight:600 }}>{course.instructor}</div>
                          <div style={{ color:MUTED, fontSize:"11px" }}>{t("Багш","Instructor")}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === "resources" && (
                  <div style={{ maxWidth:"700px" }}>
                    <h3 style={{ color:TEXT, fontSize:"15px", fontWeight:700, marginBottom:"14px" }}>{t("Материалууд","Resources")}</h3>
                    {activeLesson.fileUrl ? (
                      <a href={activeLesson.fileUrl} download={activeLesson.fileName||"resource"} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:"10px", textDecoration:"none", marginBottom:"8px" }}>
                        <i className="fa-solid fa-file-arrow-down" style={{ color:MUTED, fontSize:"18px" }}/>
                        <div style={{ flex:1 }}>
                          <div style={{ color:TEXT, fontSize:"13px", fontWeight:500 }}>{activeLesson.fileName||activeLesson.title}</div>
                          <div style={{ color:MUTED, fontSize:"11px" }}>{t("Татах","Download")}</div>
                        </div>
                        <i className="fa-solid fa-download" style={{ color:MUTED, fontSize:"13px" }}/>
                      </a>
                    ) : (
                      <div style={{ color:MUTED, fontSize:"13px", textAlign:"center", padding:"40px" }}>
                        <i className="fa-solid fa-folder-open" style={{ fontSize:"28px", display:"block", marginBottom:"10px" }}/>
                        {t("Материал байхгүй","No resources available")}
                      </div>
                    )}
                  </div>
                )}

                {tab === "notes" && (
                  <div style={{ maxWidth:"700px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                      <h3 style={{ color:TEXT, fontSize:"15px", fontWeight:700 }}>{t("Миний тэмдэглэл","My Notes")}</h3>
                      {noteSaved && <span style={{ color:"#34d399", fontSize:"12px" }}>✓ {t("Хадгалагдлаа","Saved")}</span>}
                    </div>
                    <textarea value={note} onChange={e => setNote(e.target.value)}
                      placeholder={t("Энэ хичээлийн тэмдэглэл бичнэ үү...","Write your notes for this lesson...")}
                      style={{ width:"100%", minHeight:"200px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:"10px", padding:"14px", color:TEXT, fontSize:"14px", outline:"none", resize:"vertical", lineHeight:1.6, fontFamily:"inherit", boxSizing:"border-box" }}/>
                    <button onClick={saveNote} style={{ marginTop:"10px", background:isDark?"#fff":"#000", color:isDark?"#000":"#fff", border:"none", padding:"9px 20px", borderRadius:"8px", cursor:"pointer", fontWeight:600, fontSize:"13px" }}>
                      <i className="fa-solid fa-floppy-disk" style={{ marginRight:"6px" }}/>{t("Хадгалах","Save")}
                    </button>
                  </div>
                )}

                {tab === "discussion" && (
                  <div style={{ maxWidth:"700px" }}>
                    <h3 style={{ color:TEXT, fontSize:"15px", fontWeight:700, marginBottom:"16px" }}>{t("Хэлэлцүүлэг","Discussion")}</h3>
                    <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
                      <textarea value={comment} onChange={e => setComment(e.target.value)}
                        placeholder={t("Асуулт эсвэл санал бичнэ үү...","Ask a question or share your thoughts...")}
                        style={{ flex:1, height:"80px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:"10px", padding:"12px", color:TEXT, fontSize:"13px", outline:"none", resize:"none", fontFamily:"inherit" }}/>
                    </div>
                    <button onClick={postComment} disabled={!comment.trim()} style={{ marginBottom:"20px", background:isDark?"#fff":"#000", color:isDark?"#000":"#fff", border:"none", padding:"8px 18px", borderRadius:"8px", cursor:"pointer", fontWeight:600, fontSize:"13px" }}>
                      {t("Нийтлэх","Post")}
                    </button>
                    {comments.length === 0 ? (
                      <div style={{ color:MUTED, fontSize:"13px", textAlign:"center", padding:"30px" }}>
                        <i className="fa-solid fa-comments" style={{ fontSize:"24px", display:"block", marginBottom:"8px" }}/>
                        {t("Хэлэлцүүлэг байхгүй","No comments yet")}
                      </div>
                    ) : comments.map((c: any, i: number) => (
                      <div key={c._id||i} style={{ display:"flex", gap:"10px", marginBottom:"14px", padding:"12px 14px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:"10px" }}>
                        {c.userImage ? (
                          <img src={c.userImage} style={{ width:"32px", height:"32px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} alt=""/>
                        ) : (
                          <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"12px", fontWeight:700, color:TEXT }}>
                            {(c.userName||"?")[0].toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"4px" }}>
                            <span style={{ color:TEXT, fontSize:"12px", fontWeight:600 }}>{c.userName||"User"}</span>
                            <span style={{ color:MUTED, fontSize:"11px" }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                          </div>
                          <p style={{ color:MUTED2, fontSize:"13px", lineHeight:1.5, margin:0 }}>{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px" }}>
              <i className="fa-solid fa-graduation-cap" style={{ fontSize:"40px", color:MUTED }}/>
              <div style={{ color:TEXT, fontSize:"16px", fontWeight:600 }}>{t("Хичээл сонгоно уу","Select a lesson")}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
