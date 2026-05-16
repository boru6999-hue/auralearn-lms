"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

const CAT_LABEL: any = {
  development: { mn:"Хөгжүүлэлт", en:"Development", ja:"開発",    ko:"개발",    fr:"Développement",  de:"Entwicklung", zh:"开发" },
  design:      { mn:"Дизайн",     en:"Design",      ja:"デザイン", ko:"디자인",  fr:"Design",         de:"Design",      zh:"设计" },
  business:    { mn:"Бизнес",     en:"Business",    ja:"ビジネス", ko:"비즈니스",fr:"Business",       de:"Business",    zh:"商业" },
};
const LEVEL_LABEL: any = {
  beginner:     { mn:"Анхан",  en:"Beginner",     ja:"初級", ko:"초급", fr:"Débutant",    de:"Anfänger",      zh:"初级" },
  intermediate: { mn:"Дунд",   en:"Intermediate", ja:"中級", ko:"중급", fr:"Intermédiaire",de:"Mittel",        zh:"中级" },
  advanced:     { mn:"Ахисан", en:"Advanced",     ja:"上級", ko:"고급", fr:"Avancé",      de:"Fortgeschritten",zh:"高级" },
};

export default function DevelopmentPage() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoad]    = useState(true);
  const [search, setSearch]   = useState("");
  const [hasAccess, setAccess]= useState(false);
  const [catFilter, setCatF]  = useState("all");

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;
  const cl=(key:string)=>{ const l=CAT_LABEL[key]; return l?(l[lang as keyof typeof l]||l.en) as string:key; };
  const lv=(key:string)=>{ const l=LEVEL_LABEL[key]; return l?(l[lang as keyof typeof l]||l.en) as string:key; };

  useEffect(()=>{
    fetch("/api/courses/public")
      .then(r=>r.json())
      .then(d=>{ if(Array.isArray(d)) setCourses(d.filter((c:any)=>["development","design","business"].includes(c.category))); })
      .catch(()=>{}).finally(()=>setLoad(false));
    fetch("/api/check-access").then(r=>r.json()).then(d=>setAccess(!!d.hasAccess)).catch(()=>{});
  },[]);

  if(!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;

  const filtered = courses.filter(c=>
    (catFilter==="all"||c.category===catFilter)&&
    (c.title||"").toLowerCase().includes(search.toLowerCase())
  );

  const ICON: any = { development:"fa-code", design:"fa-pen-nib", business:"fa-briefcase" };

  return (
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 24px"}}>
        <Link href="/courses" style={{color:colors.text3,fontSize:"13px",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"6px",marginBottom:"16px"}}>
          <i className="fa-solid fa-arrow-left" style={{fontSize:"11px"}}/>
          {t("Бүх сургалт","All Courses","すべてのコース","전체 강의","Tous les cours","Alle Kurse","所有课程")}
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
          <i className="fa-solid fa-code" style={{fontSize:"24px",color:colors.text3}}/>
          <h1 style={{color:colors.text,fontSize:"26px",fontWeight:800}}>
            {t("Хөгжүүлэлт & Дизайн","Development & Design","開発＆デザイン","개발 & 디자인","Développement & Design","Entwicklung & Design","开发 & 设计")}
          </h1>
        </div>
        <p style={{color:colors.text3,fontSize:"13px",marginBottom:"20px"}}>
          {t("Мэргэжлийн ур чадвар хөгжүүл","Build professional skills","プロのスキルを身につけよう","전문 기술을 키우세요","Développez des compétences professionnelles","Professionelle Fähigkeiten entwickeln","培养专业技能")}
        </p>

        {/* Sub-category filter */}
        <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
          {["all","development","design","business"].map(ct=>(
            <button key={ct} onClick={()=>setCatF(ct)} style={{padding:"5px 14px",borderRadius:"20px",border:"none",cursor:"pointer",background:catFilter===ct?(isDark?"#fff":"#000"):(isDark?"rgba(255,255,255,0.06)":"#f0f0f0"),color:catFilter===ct?(isDark?"#000":"#fff"):colors.text2,fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",gap:"5px",transition:"all 0.15s"}}>
              {ct!=="all"&&<i className={`fa-solid ${ICON[ct]||"fa-circle"}`} style={{fontSize:"10px"}}/>}
              {ct==="all"?t("Бүгд","All","すべて","전체","Tous","Alle","全部"):cl(ct)}
            </button>
          ))}
        </div>

        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={t("Хайх...","Search...","検索...","검색...","Rechercher...","Suchen...","搜索...")}
          style={{width:"100%",maxWidth:"340px",height:"40px",background:isDark?"rgba(255,255,255,0.06)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"10px",padding:"0 14px",color:colors.text,fontSize:"14px",outline:"none",marginBottom:"24px",boxSizing:"border-box" as const}}/>

        {loading?(
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-code" style={{fontSize:"32px",display:"block",marginBottom:"10px"}}/>
            <div style={{fontWeight:600}}>{t("Сургалт олдсонгүй","No courses found","コースが見つかりません","강의를 찾을 수 없음","Aucun cours trouvé","Keine Kurse gefunden","未找到课程")}</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px"}}>
            {filtered.map(c=>(
              <div key={c._id} style={{background:isDark?"rgba(255,255,255,0.03)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"14px",overflow:"hidden",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.15)":"#bbb";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=colors.border;}}>
                <div style={{height:"90px",background:isDark?"rgba(255,255,255,0.04)":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  {c.thumbnail&&c.thumbnail.length<=4?<span style={{fontSize:"36px"}}>{c.thumbnail}</span>:c.thumbnail?.startsWith("http")?<img src={c.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<i className={`fa-solid ${ICON[c.category]||"fa-code"}`} style={{fontSize:"28px",color:colors.text3}}/>}
                  <div style={{position:"absolute",bottom:"0",left:"0",right:"0",padding:"3px 8px",background:"rgba(0,0,0,0.5)",display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"#fff",fontSize:"9px"}}>{cl(c.category||"development")}</span>
                    <span style={{color:"#fff",fontSize:"9px"}}>{lv(c.level||"beginner")}</span>
                  </div>
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
