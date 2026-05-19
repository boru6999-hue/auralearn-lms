"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

export default function HomePage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [count, setCount] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    const timer = setTimeout(()=>{
      let n=0; const iv=setInterval(()=>{n+=80;setCount(n);if(n>=5000){clearInterval(iv);setCount(5000);}},15);
    },400);
    return()=>clearTimeout(timer);
  },[]);

  useEffect(()=>{
    fetch("/api/courses/public").then(r=>r.json()).then(d=>{if(Array.isArray(d))setCourses(d.slice(0,5));}).catch(()=>{});
  },[]);

  const CAT_LABEL: any = {
    language:    {mn:"Хэл",en:"Language",ja:"言語",ko:"언어"},
    development: {mn:"Хөгжүүлэлт",en:"Development",ja:"開発",ko:"개발"},
    design:      {mn:"Дизайн",en:"Design",ja:"デザイン",ko:"디자인"},
    business:    {mn:"Бизнес",en:"Business",ja:"ビジネス",ko:"비즈니스"},
  };
  const LEVEL_LABEL: any = {
    beginner:     {mn:"Анхан",en:"Beginner",ja:"初級",ko:"초급"},
    intermediate: {mn:"Дунд",en:"Intermediate",ja:"中級",ko:"중급"},
    advanced:     {mn:"Ахисан",en:"Advanced",ja:"上級",ko:"고급"},
  };
  const cl=(k:string)=>{const c=CAT_LABEL[k];return c?(c[lang]||c.en):k;};
  const lv=(k:string)=>{const l=LEVEL_LABEL[k];return l?(l[lang]||l.en):k;};

  const FEATURES = [
    {icon:"fa-circle-play",title:t("Видео хичээл","Video lessons","動画レッスン","동영상 레슨","Vidéos","Videokosten","视频课程"),desc:t("Зогссон газраасаа үргэлжлүүл. Auto-next. Хугацааг хадгална.","Resume where you left off. Auto-next. Saves your watch time.")},
    {icon:"fa-robot",title:t("AI туслагч","AI assistant","AIアシスタント","AI 어시스턴트","Assistant IA","KI-Assistent","AI助手"),desc:t("Gemini Chat, Quiz Generator, Сургалт зөвлөгч.","Gemini-powered chat, quiz generator and course recommendations.")},
    {icon:"fa-certificate",title:t("Гэрчилгээ","Certificate","証明書","수료증","Certificat","Zertifikat","证书"),desc:t("Бүх хичээл дүүргэж, 70%+ авсны дараа гэрчилгээ авна.","Complete all lessons and pass the quiz with 70%+ to earn your certificate.")},
  ];

  const DEMO = [
    {_id:"1",title:"English for Professionals",category:"language",level:"beginner",slug:"english"},
    {_id:"2",title:"React & Next.js Mastery",category:"development",level:"intermediate",slug:"react",live:true},
    {_id:"3",title:"UI/UX Fundamentals",category:"design",level:"beginner",slug:"uiux"},
    {_id:"4",title:"Startup Fundamentals",category:"business",level:"intermediate",slug:"startup"},
    {_id:"5",title:"日本語 N3",category:"language",level:"intermediate",slug:"japanese"},
  ];
  const displayCourses = courses.length>0?courses:DEMO;

  // Use CSS variables so no flash — always render, theme handled by data-theme attr
  return (
    <div className="home-page" style={{minHeight:"100vh",fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <style>{`
        .home-page{background:var(--home-bg,#F2F0EB);color:var(--home-text,#1a1a1a);}
        html[data-theme="dark"] .home-page{background:#0a0a0f;color:#fff;}
        .home-rule{color:rgba(0,0,0,0.35);}
        html[data-theme="dark"] .home-rule{color:rgba(255,255,255,0.35);}
        .h-rule-line{background:rgba(0,0,0,0.08);}
        html[data-theme="dark"] .h-rule-line{background:rgba(255,255,255,0.06);}
        .h-hover:hover{background:rgba(0,0,0,0.025);}
        html[data-theme="dark"] .h-hover:hover{background:rgba(255,255,255,0.03);}
        .h-btn-primary{background:#1a1a1a;color:#fff;}
        html[data-theme="dark"] .h-btn-primary{background:#fff;color:#000;}
        .h-feat-border{border-right:1px solid rgba(0,0,0,0.08);}
        html[data-theme="dark"] .h-feat-border{border-right:1px solid rgba(255,255,255,0.06);}
        @media(max-width:640px){
          .home-hero-grid{grid-template-columns:1fr!important;}
          .home-hero-left{border-right:none!important;padding-right:0!important;border-bottom:1px solid rgba(0,0,0,0.08);padding-bottom:28px!important;}
          html[data-theme="dark"] .home-hero-left{border-bottom-color:rgba(255,255,255,0.06)!important;}
          .home-hero-right{padding-left:0!important;padding-top:24px!important;}
          .home-feat-grid{grid-template-columns:1fr!important;}
          .h-feat-border{border-right:none!important;border-bottom:1px solid rgba(0,0,0,0.08)!important;}
          html[data-theme="dark"] .h-feat-border{border-bottom-color:rgba(255,255,255,0.06)!important;}
        }
      `}</style>

      {!mounted ? (
        // SSR placeholder — same dimensions, no flash
        <div style={{maxWidth:"1080px",margin:"0 auto",padding:"0 clamp(24px,5vw,48px)"}}>
          <div style={{height:"clamp(300px,50vw,500px)"}}/>
        </div>
      ) : (
      <div style={{maxWidth:"1080px",margin:"0 auto",padding:"0 clamp(24px,5vw,48px)"}}>
        {/* HERO */}
        <div className="home-hero-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,padding:"clamp(40px,8vw,56px) 0 40px",borderBottom:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}`}}>
          <div className="home-hero-left" style={{paddingRight:"clamp(24px,4vw,48px)",borderRight:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}`}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
              <span style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)"}}>
                {t("Онлайн сургалтын платформ","Online learning platform","オンライン学習","온라인 학습","Plateforme d'apprentissage","Online-Lernen","在线学习平台")}
              </span>
              <div style={{flex:1,height:"1px",background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}}/>
            </div>
            <h1 style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:300,color:isDark?"#fff":"#1a1a1a",letterSpacing:"-2px",lineHeight:1.1,marginBottom:"20px"}}>
              {t("Ур чадвараа","Level up","スキルを","실력을","Améliorez","Steigern Sie","提升")}<br/>
              <span style={{color:isDark?"rgba(255,255,255,0.25)":"rgba(0,0,0,0.2)"}}>{t("дэвшүүл.","your skills.","上げよう。","올리세요。","vos compétences.","Ihre Fähigkeiten.","您的技能。")}</span>
            </h1>
            <p style={{fontSize:"13px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",lineHeight:1.8,fontWeight:300,marginBottom:"28px",maxWidth:"340px"}}>
              {t("Мэргэжлийн багш нараас суралцаж, 7 хэлд дэмжлэгтэй, AI-аар хангагдсан платформ.","Professional instructors. Seven languages. AI-powered learning.","プロ講師から学ぶ。7言語対応。AI搭載。","전문 강사, 7개 언어, AI 탑재.","Instructeurs professionnels. Sept langues. IA.","Profis-Dozenten. Sieben Sprachen. KI.","专业讲师。七种语言。AI驱动。")}
            </p>
            <div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap"}}>
              <Link href="/courses" className="h-btn-primary" style={{padding:"10px 24px",fontSize:"12px",fontWeight:500,borderRadius:"100px",textDecoration:"none",letterSpacing:"0.02em"}}>
                {t("Сургалт үзэх","Browse courses","コースを見る","강의 보기","Voir les cours","Kurse ansehen","浏览课程")}
              </Link>
              <Link href="/auth/register" style={{fontSize:"12px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",textDecoration:"none",display:"flex",alignItems:"center",gap:"4px"}}>
                {t("Бүртгүүлэх","Get started","始める","시작하기","Commencer","Loslegen","开始")}
                <i className="fa-solid fa-arrow-right" style={{fontSize:"10px"}}/>
              </Link>
            </div>
          </div>

          <div className="home-hero-right" style={{paddingLeft:"clamp(24px,4vw,48px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            {[
              {label:t("Бүртгэлтэй оюутан","Students enrolled","登録済み学生","등록된 학생","Étudiants inscrits","Eingeschriebene","注册学生"),val:`${count>=5000?"5,000+":count.toLocaleString()}`},
              {label:t("Нийт сургалт","Courses available","利用可能コース","이용 가능 강의","Cours disponibles","Verfügbare Kurse","可用课程"),val:"100+"},
              {label:t("Хэл","Languages","言語","언어","Langues","Sprachen","语言"),val:"7"},
              {label:t("Мэргэжлийн багш","Expert instructors","専門講師","전문 강사","Instructeurs","Dozenten","专业讲師"),val:"50+"},
            ].map((s,i,arr)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"clamp(12px,2vw,16px) 0",borderBottom:i<arr.length-1?`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}`:""} as React.CSSProperties}>
                <span style={{fontSize:"11px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",letterSpacing:"0.03em"}}>{s.label}</span>
                <span style={{fontSize:"clamp(22px,3vw,26px)",fontWeight:300,color:isDark?"#fff":"#1a1a1a",letterSpacing:"-1px"}}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COURSES */}
        <div style={{padding:"clamp(28px,4vw,40px) 0",borderBottom:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"20px"}}>
            <span style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)"}}>
              {t("Сургалтууд","Courses","コース","강의","Cours","Kurse","课程")}
            </span>
            <Link href="/courses" style={{fontSize:"11px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",textDecoration:"none"}}>
              {t("Бүгдийг харах","View all","すべて見る","모두 보기","Voir tout","Alle ansehen","查看全部")} →
            </Link>
          </div>
          {displayCourses.map((c:any,i:number)=>(
            <Link key={c._id||i} href={`/courses/${c.slug||c._id}`} className="h-hover" style={{display:"grid",gridTemplateColumns:"36px 1fr auto",gap:"16px",alignItems:"center",padding:"clamp(12px,2vw,16px) 0",borderBottom:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}`,textDecoration:"none",transition:"background 0.15s"}}>
              <span style={{fontSize:"11px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",fontWeight:300,letterSpacing:"0.04em"}}>{String(i+1).padStart(2,"0")}</span>
              <div>
                <div style={{fontSize:"9px",letterSpacing:"0.14em",textTransform:"uppercase",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",marginBottom:"3px"}}>{cl(c.category||"development")} · {lv(c.level||"beginner")}</div>
                <div style={{fontSize:"clamp(13px,2vw,15px)",fontWeight:300,color:isDark?"#fff":"#1a1a1a",letterSpacing:"-0.3px"}}>{c.title}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                {(c as any).live&&<div style={{display:"flex",alignItems:"center",gap:"4px",padding:"3px 9px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:"100px"}}>
                  <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#ef4444"}}/>
                  <span style={{fontSize:"9px",letterSpacing:"0.08em",color:"rgba(239,68,68,0.65)"}}>LIVE</span>
                </div>}
                <i className="fa-solid fa-arrow-right" style={{fontSize:"11px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)"}}/>
              </div>
            </Link>
          ))}
        </div>

        {/* FEATURES */}
        <div className="home-feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",paddingBottom:"clamp(32px,5vw,48px)"}}>
          {FEATURES.map((f,i)=>(
            <div key={i} className={i<2?"h-feat-border":""} style={{padding:"28px 24px",display:"flex",flexDirection:"column",gap:"10px"}}>
              <i className={`fa-solid ${f.icon}`} style={{fontSize:"16px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)"}}/>
              <div style={{fontSize:"13px",fontWeight:500,color:isDark?"#fff":"#1a1a1a",letterSpacing:"-0.2px"}}>{f.title}</div>
              <div style={{fontSize:"12px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",lineHeight:1.7,fontWeight:300}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Footer */}
      <div style={{borderTop:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}`,padding:"16px clamp(24px,5vw,48px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
        <span style={{fontSize:"11px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)"}}>auralearn-lms.vercel.app</span>
        <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
          <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e"}}/>
          <span style={{fontSize:"11px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)"}}>
            {t("Бүх систем ажиллаж байна","All systems operational","全システム稼働中","모든 시스템 정상","Tous systèmes opérationnels","Alle Systeme betriebsbereit","所有系统正常")}
          </span>
        </div>
        <span style={{fontSize:"11px",color:isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)"}}>SW25-1 · Т.Буянбат · 2026</span>
      </div>
    </div>
  );
}
