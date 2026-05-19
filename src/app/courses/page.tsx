"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

const CAT_LABEL: any = {
  language:    { mn:"Хэл",        en:"Language",    ja:"言語",     ko:"언어",    fr:"Langues",       de:"Sprachen",  zh:"语言" },
  development: { mn:"Хөгжүүлэлт", en:"Development", ja:"開発",     ko:"개발",    fr:"Développement", de:"Entwicklung",zh:"开发" },
  design:      { mn:"Дизайн",     en:"Design",      ja:"デザイン", ko:"디자인",  fr:"Design",        de:"Design",    zh:"设计" },
  business:    { mn:"Бизнес",     en:"Business",    ja:"ビジネス", ko:"비즈니스",fr:"Business",      de:"Business",  zh:"商业" },
};
const LEVEL_LABEL: any = {
  beginner:     { mn:"Анхан",  en:"Beginner",     ja:"初級", ko:"초급" },
  intermediate: { mn:"Дунд",   en:"Intermediate", ja:"中級", ko:"중급" },
  advanced:     { mn:"Ахисан", en:"Advanced",     ja:"上級", ko:"고급" },
};
const CATS = ["all","language","development","design","business"];

export default function CoursesPage() {
  const { isDark, mounted } = useTheme();
  const { lang } = useLang();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoad]    = useState(true);
  const [cat, setCat]         = useState("all");
  const [search, setSearch]   = useState("");
  const [hasAccess, setAccess]= useState(false);

  const t = (mn: string, en: string, ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;
  const cl = (key: string) => { const c = CAT_LABEL[key]; return c?(c[lang]||c.en) as string:key; };
  const lv = (key: string) => { const l = LEVEL_LABEL[key]; return l?(l[lang]||l.en) as string:key; };

  useEffect(() => {
    fetch("/api/courses/public").then(r=>r.json()).then(d=>{if(Array.isArray(d))setCourses(d);}).catch(()=>{}).finally(()=>setLoad(false));
    fetch("/api/check-access").then(r=>r.json()).then(d=>setAccess(!!d.hasAccess)).catch(()=>{});
  },[]);

  if (!mounted) return <div style={{minHeight:"100vh",background:"#F2F0EB"}}/>;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const HOVER = isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  const filtered = courses.filter(c=>(cat==="all"||c.category===cat)&&(c.title||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1080px",margin:"0 auto",padding:"0 48px"}}>

        {/* Header */}
        <div style={{padding:"48px 0 32px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:"24px"}}>
            <h1 style={{fontSize:"32px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
              {t("Сургалтууд","Courses","コース","강의","Cours","Kurse","课程")}
            </h1>
            {hasAccess&&(
              <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e"}}/>
                <span style={{fontSize:"11px",color:MUTED,letterSpacing:"0.04em"}}>
                  {t("Сарын эрхтэй","Active subscription","サブスク有効","구독 중","Abonnement actif","Aktives Abo","订阅中")}
                </span>
              </div>
            )}
          </div>

          {/* Search + filter row */}
          <div style={{display:"flex",alignItems:"center",gap:"24px",flexWrap:"wrap"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={t("Хайх...","Search...","検索...","검색...","Rechercher...","Suchen...","搜索...")}
              style={{height:"34px",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"13px",fontWeight:300,width:"220px",padding:"0 0 0 0",fontFamily:"inherit"}}/>
            <div style={{display:"flex",gap:"0",borderBottom:`1px solid ${RULE}`}}>
              {CATS.map(c=>(
                <button key={c} onClick={()=>setCat(c)} style={{padding:"8px 16px",background:"none",border:"none",cursor:"pointer",fontSize:"11px",letterSpacing:"0.08em",textTransform:"uppercase",color:cat===c?TEXT:MUTED,borderBottom:cat===c?`1px solid ${TEXT}`:"1px solid transparent",marginBottom:"-1px",fontFamily:"inherit",transition:"all 0.15s"}}>
                  {c==="all"?t("Бүгд","All","すべて","전체","Tous","Alle","全部"):cl(c)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course list */}
        <div style={{padding:"8px 0 48px"}}>
          {loading?(
            <div style={{padding:"60px 0",textAlign:"center",color:MUTED,fontSize:"13px",fontWeight:300}}>
              {t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}
            </div>
          ):filtered.length===0?(
            <div style={{padding:"60px 0",textAlign:"center"}}>
              <div style={{fontSize:"13px",color:MUTED,fontWeight:300,marginBottom:"16px"}}>
                {t("Сургалт олдсонгүй","No courses found","コースが見つかりません","강의를 찾을 수 없음","Aucun cours trouvé","Keine Kurse gefunden","未找到课程")}
              </div>
              <Link href="/admin/courses" style={{fontSize:"12px",color:MUTED,textDecoration:"none"}}>
                {t("Admin-д сургалт нэмэх →","Add courses from admin →")}
              </Link>
            </div>
          ):(
            filtered.map((c,i)=>(
              <div key={c._id||i} style={{display:"grid",gridTemplateColumns:"40px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{fontSize:"11px",color:MUTED,letterSpacing:"0.04em",fontWeight:300}}>{String(i+1).padStart(2,"0")}</span>
                <div>
                  <div style={{fontSize:"9px",letterSpacing:"0.14em",textTransform:"uppercase",color:MUTED,marginBottom:"3px"}}>{cl(c.category||"development")} · {lv(c.level||"beginner")}</div>
                  <div style={{fontSize:"15px",fontWeight:300,color:TEXT,letterSpacing:"-0.3px"}}>{c.title}</div>
                  {c.instructor&&<div style={{fontSize:"11px",color:MUTED,marginTop:"3px"}}>{c.instructor}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <span style={{fontSize:"11px",color:MUTED}}>
                    {c.sections?.reduce((a:number,s:any)=>a+(s.lessons?.length||0),0)||0} {t("хичээл","lessons","レッスン","레슨","leçons","Lektionen","课程")}
                  </span>
                  {hasAccess?(
                    <Link href={`/courses/${c.slug||c._id}`} style={{padding:"6px 16px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"11px",fontWeight:500,borderRadius:"100px",textDecoration:"none",whiteSpace:"nowrap" as const,letterSpacing:"0.02em"}}>
                      {t("Үзэх","Watch","視聴","시청","Voir","Ansehen","观看")}
                    </Link>
                  ):(
                    <Link href="/payment" style={{padding:"6px 16px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"11px",borderRadius:"100px",textDecoration:"none",whiteSpace:"nowrap" as const}}>
                      {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        {!hasAccess&&(
          <div style={{borderTop:`1px solid ${RULE}`,padding:"40px 0",display:"grid",gridTemplateColumns:"1fr auto",gap:"24px",alignItems:"center"}}>
            <div>
              <div style={{fontSize:"18px",fontWeight:300,color:TEXT,letterSpacing:"-0.5px",marginBottom:"6px"}}>
                {t("Бүх сургалтад хандах эрх авах","Get full access to all courses","すべてのコースにアクセス","모든 강의 이용하기","Accéder à tous les cours","Alle Kurse freischalten","获取所有课程访问权限")}
              </div>
              <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>
                {t("Сарын захиалгаар бүх сургалт, live хичээл, AI туслагч үнэгүй.","Monthly subscription unlocks all courses, live classes and AI assistant.","月額サブスクで全コース、ライブ、AI無料。","월정액으로 모든 강의, 라이브, AI 무료.","Abonnement mensuel pour tout débloquer.","Monatliches Abo für alles.","月度订阅解锁所有功能。")}
              </div>
            </div>
            <Link href="/payment" style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",textDecoration:"none",whiteSpace:"nowrap" as const}}>
              {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
