"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

const LEVEL_LABEL: any = {
  beginner:     { mn:"Анхан",  en:"Beginner",     ja:"初級", ko:"초급", fr:"Débutant",    de:"Anfänger",      zh:"初级" },
  intermediate: { mn:"Дунд",   en:"Intermediate", ja:"中級", ko:"중급", fr:"Intermédiaire",de:"Mittel",        zh:"中级" },
  advanced:     { mn:"Ахисан", en:"Advanced",     ja:"上級", ko:"고급", fr:"Avancé",      de:"Fortgeschritten",zh:"高级" },
};

export default function LanguagePage() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoad]    = useState(true);
  const [search, setSearch]   = useState("");
  const [hasAccess, setAccess]= useState(false);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;
  const lv=(key:string)=>{ const l=LEVEL_LABEL[key]; return l?(l[lang as keyof typeof l]||l.en) as string:key; };

  useEffect(()=>{
    fetch("/api/courses/public")
      .then(r=>r.json())
      .then(d=>{ if(Array.isArray(d)) setCourses(d.filter((c:any)=>c.category==="language")); })
      .catch(()=>{}).finally(()=>setLoad(false));
    fetch("/api/check-access").then(r=>r.json()).then(d=>setAccess(!!d.hasAccess)).catch(()=>{});
  },[]);

  if(!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;
  const filtered = courses.filter(c=>(c.title||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 24px"}}>
        <Link href="/courses" style={{color:colors.text3,fontSize:"13px",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"6px",marginBottom:"16px"}}>
          <i className="fa-solid fa-arrow-left" style={{fontSize:"11px"}}/>
          {t("Бүх сургалт","All Courses","すべてのコース","전체 강의","Tous les cours","Alle Kurse","所有课程")}
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
          <i className="fa-solid fa-language" style={{fontSize:"24px",color:colors.text3}}/>
          <h1 style={{color:colors.text,fontSize:"26px",fontWeight:800}}>
            {t("Хэлний сургалт","Language Courses","語学コース","언어 강의","Cours de Langues","Sprachkurse","语言课程")}
          </h1>
        </div>
        <p style={{color:colors.text3,fontSize:"13px",marginBottom:"24px"}}>
          {t("Дэлхийн хэлүүдийг суралц","Learn world languages","世界の言語を学ぼう","세계 언어를 배우세요","Apprenez les langues du monde","Lerne Weltsprachen","学习世界语言")}
        </p>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={t("Хайх...","Search...","検索...","검색...","Rechercher...","Suchen...","搜索...")}
          style={{width:"100%",maxWidth:"340px",height:"40px",background:isDark?"rgba(255,255,255,0.06)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"10px",padding:"0 14px",color:colors.text,fontSize:"14px",outline:"none",marginBottom:"24px",boxSizing:"border-box" as const}}/>
        {loading?(
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-language" style={{fontSize:"32px",display:"block",marginBottom:"10px"}}/>
            <div style={{fontWeight:600}}>{t("Хэлний сургалт олдсонгүй","No language courses found","語学コースが見つかりません","언어 강의를 찾을 수 없음","Aucun cours de langue","Keine Sprachkurse","未找到语言课程")}</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px"}}>
            {filtered.map(c=>(
              <div key={c._id} style={{background:isDark?"rgba(255,255,255,0.03)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"14px",overflow:"hidden",transition:"all 0.2s",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.15)":"#bbb";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=colors.border;}}>
                <div style={{height:"90px",background:isDark?"rgba(255,255,255,0.04)":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  {c.thumbnail&&c.thumbnail.length<=4?<span style={{fontSize:"36px"}}>{c.thumbnail}</span>:c.thumbnail?.startsWith("http")?<img src={c.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<i className="fa-solid fa-language" style={{fontSize:"30px",color:colors.text3}}/>}
                  <span style={{position:"absolute",bottom:"5px",right:"8px",background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:"9px",padding:"2px 6px",borderRadius:"4px"}}>{lv(c.level||"beginner")}</span>
                </div>
                <div style={{padding:"12px"}}>
                  <div style={{color:colors.text,fontWeight:700,fontSize:"13px",marginBottom:"4px"}}>{c.title}</div>
                  {c.description&&<div style={{color:colors.text3,fontSize:"11px",marginBottom:"8px",lineHeight:1.4}}>{c.description.slice(0,60)}{c.description.length>60?"...":""}</div>}
                  {hasAccess?(
                    <Link href={`/courses/${c.slug||c._id}`} style={{display:"flex",alignItems:"center",gap:"6px",background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:"8px",padding:"7px 12px",textDecoration:"none"}}>
                      <i className="fa-solid fa-circle-play" style={{color:"#34d399",fontSize:"13px"}}/>
                      <span style={{color:"#34d399",fontSize:"12px",fontWeight:700}}>{t("Үзэх","Watch Free","視聴","무료 시청","Regarder","Ansehen","观看")}</span>
                    </Link>
                  ):(
                    <Link href="/payment" style={{display:"flex",alignItems:"center",gap:"6px",background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",border:`1px solid ${colors.border}`,borderRadius:"8px",padding:"7px 12px",textDecoration:"none"}}>
                      <i className="fa-solid fa-lock" style={{color:"#f59e0b",fontSize:"12px"}}/>
                      <span style={{color:colors.text3,fontSize:"12px"}}>{t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}</span>
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
