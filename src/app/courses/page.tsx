"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

const CATS = [
  { id:"all",         icon:"fa-th-large",  mn:"Бүгд",       en:"All"         },
  { id:"language",    icon:"fa-language",   mn:"Хэл",        en:"Language"    },
  { id:"development", icon:"fa-code",       mn:"Хөгжүүлэлт", en:"Development" },
  { id:"design",      icon:"fa-pen-nib",    mn:"Дизайн",     en:"Design"      },
  { id:"business",    icon:"fa-briefcase",  mn:"Бизнес",     en:"Business"    },
];

const LEVEL_LABEL: any = {
  beginner:     { mn:"Анхан",  en:"Beginner"     },
  intermediate: { mn:"Дунд",   en:"Intermediate" },
  advanced:     { mn:"Ахисан", en:"Advanced"     },
};

export default function CoursesPage() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [courses, setCourses]  = useState<any[]>([]);
  const [loading, setLoad]     = useState(true);
  const [cat, setCat]          = useState("all");
  const [search, setSearch]    = useState("");
  const [hasAccess, setAccess] = useState(false);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;
  const cl=(key:string)=>{ const c=CATS.find(x=>x.id===key); return c?(c[lang as keyof typeof c]||c.en) as string:key; };
  const lv=(key:string)=>{ const l=LEVEL_LABEL[key]; return l?(l[lang as keyof typeof l]||l.en) as string:key; };

  useEffect(()=>{
    fetch("/api/courses/public").then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setCourses(d); }).catch(()=>{}).finally(()=>setLoad(false));
    fetch("/api/check-access").then(r=>r.json()).then(d=>setAccess(!!d.hasAccess)).catch(()=>{});
  },[]);

  if(!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;

  const filtered = courses.filter(c=>(cat==="all"||c.category===cat)&&(c.title||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"clamp(16px,4vw,32px) clamp(12px,4vw,24px)"}}>

        {/* Header */}
        <div style={{marginBottom:"20px"}}>
          <h1 style={{color:colors.text,fontSize:"clamp(20px,4vw,26px)",fontWeight:800,marginBottom:"6px"}}>
            {t("Сургалтууд","Courses","コース","강의","Cours","Kurse","课程")}
          </h1>
          <p style={{color:colors.text3,fontSize:"13px"}}>{t("Мэргэжлийн багш нараас суралцаарай","Learn from professional instructors")}</p>
        </div>

        {/* Access banner */}
        {hasAccess ? (
          <div style={{background:isDark?"rgba(52,211,153,0.08)":"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:"12px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
            <i className="fa-solid fa-circle-check" style={{color:"#34d399",fontSize:"16px",flexShrink:0}}/>
            <span style={{color:colors.text,fontSize:"13px",fontWeight:600}}>
              {t("Сарын эрхтэй — бүх сургалт үнэгүй!","Active subscription — all courses unlocked!")}
            </span>
          </div>
        ) : (
          <div style={{background:isDark?"rgba(255,255,255,0.04)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"12px",padding:"14px 16px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
            <div>
              <div style={{color:colors.text,fontSize:"13px",fontWeight:600}}>{t("Бүх сургалтад хандах эрх авах","Get access to all courses")}</div>
              <div style={{color:colors.text3,fontSize:"12px"}}>{t("Сарын захиалга авснаар бүх сургалтыг үзнэ","Monthly subscription unlocks all courses")}</div>
            </div>
            <Link href="/payment" style={{background:isDark?"#fff":"#000",color:isDark?"#000":"#fff",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontSize:"13px",fontWeight:700,whiteSpace:"nowrap" as const,flexShrink:0}}>
              {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}
            </Link>
          </div>
        )}

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={t("Сургалт хайх...","Search courses...")}
          style={{width:"100%",maxWidth:"360px",height:"40px",background:isDark?"rgba(255,255,255,0.06)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"10px",padding:"0 14px",color:colors.text,fontSize:"14px",outline:"none",marginBottom:"14px",boxSizing:"border-box" as const}}/>

        {/* Category tabs - scrollable on mobile */}
        <div style={{display:"flex",gap:"8px",marginBottom:"20px",overflowX:"auto",paddingBottom:"4px",WebkitOverflowScrolling:"touch" as any}}>
          {CATS.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",background:cat===c.id?(isDark?"#fff":"#000"):(isDark?"rgba(255,255,255,0.06)":"#f0f0f0"),color:cat===c.id?(isDark?"#000":"#fff"):colors.text2,fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",gap:"6px",transition:"all 0.15s",flexShrink:0}}>
              <i className={`fa-solid ${c.icon}`} style={{fontSize:"11px"}}/>
              {cl(c.id)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-graduation-cap" style={{fontSize:"32px",display:"block",marginBottom:"10px"}}/>
            <div style={{fontWeight:600}}>{t("Сургалт олдсонгүй","No courses found")}</div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))",gap:"12px"}}>
            {filtered.map(c=>(
              <div key={c._id} style={{background:isDark?"rgba(255,255,255,0.03)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"14px",overflow:"hidden",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.15)":"#bbb";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=colors.border;}}>
                <div style={{height:"100px",background:isDark?"rgba(255,255,255,0.04)":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                  {c.thumbnail&&c.thumbnail.length<=4?<span style={{fontSize:"36px"}}>{c.thumbnail}</span>:c.thumbnail?.startsWith("http")?<img src={c.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<i className="fa-solid fa-graduation-cap" style={{fontSize:"28px",color:colors.text3}}/>}
                  {c.featured&&<span style={{position:"absolute",top:"8px",right:"8px",background:isDark?"rgba(255,255,255,0.9)":"#000",color:isDark?"#000":"#fff",fontSize:"9px",fontWeight:700,padding:"2px 7px",borderRadius:"10px"}}>★</span>}
                  <div style={{position:"absolute",bottom:"0",left:"0",right:"0",padding:"3px 8px",background:"rgba(0,0,0,0.5)",display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"#fff",fontSize:"9px"}}>{cl(c.category||"development")}</span>
                    <span style={{color:"#fff",fontSize:"9px"}}>{lv(c.level||"beginner")}</span>
                  </div>
                </div>
                <div style={{padding:"12px"}}>
                  <div style={{color:colors.text,fontWeight:700,fontSize:"13px",marginBottom:"4px",lineHeight:1.3}}>{c.title}</div>
                  {c.description&&<div style={{color:colors.text3,fontSize:"11px",marginBottom:"8px",lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:"2",WebkitBoxOrient:"vertical" as any}}>{c.description}</div>}
                  {hasAccess ? (
                    <Link href={`/courses/${c.slug||c._id}`} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:"8px",padding:"8px 10px",textDecoration:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                        <i className="fa-solid fa-circle-play" style={{color:"#34d399",fontSize:"12px"}}/>
                        <span style={{color:"#34d399",fontSize:"12px",fontWeight:700}}>{t("Үзэх","Watch Free")}</span>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{color:"#34d399",fontSize:"10px"}}/>
                    </Link>
                  ) : (
                    <Link href="/payment" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",border:`1px solid ${colors.border}`,borderRadius:"8px",padding:"8px 10px",textDecoration:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                        <i className="fa-solid fa-lock" style={{color:"#f59e0b",fontSize:"11px"}}/>
                        <span style={{color:colors.text3,fontSize:"12px"}}>{t("Захиалах","Subscribe")}</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
