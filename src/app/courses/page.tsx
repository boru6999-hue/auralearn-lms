"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

const CATS = [
  { id:"all",         icon:"fa-th-large",  mn:"Бүгд",       en:"All",          ja:"すべて",   ko:"전체",    fr:"Tous",           de:"Alle",        zh:"全部"  },
  { id:"language",    icon:"fa-language",  mn:"Хэл",        en:"Language",     ja:"言語",     ko:"언어",    fr:"Langues",        de:"Sprachen",    zh:"语言"  },
  { id:"development", icon:"fa-code",      mn:"Хөгжүүлэлт", en:"Development",  ja:"開発",     ko:"개발",    fr:"Développement",  de:"Entwicklung", zh:"开发"  },
  { id:"design",      icon:"fa-pen-nib",   mn:"Дизайн",     en:"Design",       ja:"デザイン", ko:"디자인",  fr:"Design",         de:"Design",      zh:"设计"  },
  { id:"business",    icon:"fa-briefcase", mn:"Бизнес",     en:"Business",     ja:"ビジネス", ko:"비즈니스",fr:"Business",       de:"Business",    zh:"商业"  },
];

const LEVEL_LABEL: any = {
  beginner:     { mn:"Анхан",  en:"Beginner",     ja:"初級", ko:"초급", fr:"Débutant",    de:"Anfänger",      zh:"初级" },
  intermediate: { mn:"Дунд",   en:"Intermediate", ja:"中級", ko:"중급", fr:"Intermédiaire",de:"Mittel",        zh:"中级" },
  advanced:     { mn:"Ахисан", en:"Advanced",     ja:"上級", ko:"고급", fr:"Avancé",      de:"Fortgeschritten",zh:"高级" },
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
    fetch("/api/courses/public")
      .then(r=>r.json())
      .then(d=>{ if(Array.isArray(d)) setCourses(d); })
      .catch(()=>{})
      .finally(()=>setLoad(false));
    fetch("/api/check-access")
      .then(r=>r.json())
      .then(d=>setAccess(!!d.hasAccess))
      .catch(()=>{});
  },[]);

  if(!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;

  const filtered = courses.filter(c=>
    (cat==="all"||c.category===cat)&&
    (c.title||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 24px"}}>

        {/* Header */}
        <div style={{marginBottom:"24px"}}>
          <h1 style={{color:colors.text,fontSize:"26px",fontWeight:800,marginBottom:"6px"}}>
            {t("Сургалтууд","Courses","コース","강의","Cours","Kurse","课程")}
          </h1>
          <p style={{color:colors.text3,fontSize:"13px"}}>
            {t("Мэргэжлийн багш нараас суралцаарай","Learn from professional instructors","プロの講師から学ぼう","전문 강사에게 배우세요","Apprenez des experts","Von Experten lernen","向专业讲师学习")}
          </p>
        </div>

        {/* Access banner */}
        {hasAccess ? (
          <div style={{background:isDark?"rgba(52,211,153,0.08)":"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:"12px",padding:"12px 18px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"10px"}}>
            <i className="fa-solid fa-circle-check" style={{color:"#34d399",fontSize:"16px"}}/>
            <span style={{color:colors.text,fontSize:"13px",fontWeight:600}}>
              {t("Сарын эрхтэй — бүх сургалт үнэгүй нээлттэй!","Active subscription — all courses unlocked!","サブスク有効 — 全コース無料！","구독 중 — 모든 강의 무료!","Abonnement actif — tous les cours débloqués!","Aktives Abo — alle Kurse freigeschaltet!","订阅中 — 全部课程已解锁！")}
            </span>
          </div>
        ) : (
          <div style={{background:isDark?"rgba(255,255,255,0.04)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"12px",padding:"14px 18px",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:colors.text,fontSize:"13px",fontWeight:600}}>
                {t("Бүх сургалтад хандах эрх авах","Get access to all courses","全コースにアクセス","모든 강의 이용하기","Accéder à tous les cours","Alle Kurse freischalten","获取全部课程访问权限")}
              </div>
              <div style={{color:colors.text3,fontSize:"12px"}}>
                {t("Сарын захиалга авснаар бүх сургалтыг үзнэ","Monthly subscription unlocks all courses","月額サブスクで全コース視聴可能","월정액으로 모든 강의 수강","Abonnement mensuel pour tous les cours","Monatliches Abo für alle Kurse","月度订阅解锁所有课程")}
              </div>
            </div>
            <Link href="/payment" style={{background:isDark?"#fff":"#000",color:isDark?"#000":"#fff",padding:"8px 20px",borderRadius:"8px",textDecoration:"none",fontSize:"13px",fontWeight:700,whiteSpace:"nowrap" as const}}>
              {t("Захиалах","Subscribe","登録する","구독하기","S'abonner","Abonnieren","立即订阅")}
            </Link>
          </div>
        )}

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={t("Сургалт хайх...","Search courses...","コース検索...","강의 검색...","Rechercher...","Kurse suchen...","搜索课程...")}
          style={{width:"100%",maxWidth:"360px",height:"40px",background:isDark?"rgba(255,255,255,0.06)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"10px",padding:"0 14px",color:colors.text,fontSize:"14px",outline:"none",marginBottom:"16px",boxSizing:"border-box" as const}}/>

        {/* Category tabs */}
        <div style={{display:"flex",gap:"8px",marginBottom:"24px",flexWrap:"wrap"}}>
          {CATS.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"6px 16px",borderRadius:"20px",border:"none",cursor:"pointer",background:cat===c.id?(isDark?"#fff":"#000"):(isDark?"rgba(255,255,255,0.06)":"#f0f0f0"),color:cat===c.id?(isDark?"#000":"#fff"):colors.text2,fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",gap:"6px",transition:"all 0.15s"}}>
              <i className={`fa-solid ${c.icon}`} style={{fontSize:"11px"}}/>
              {cl(c.id)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
            {t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"60px",color:colors.text3}}>
            <i className="fa-solid fa-graduation-cap" style={{fontSize:"32px",display:"block",marginBottom:"10px"}}/>
            <div style={{fontWeight:600,marginBottom:"4px"}}>{t("Сургалт олдсонгүй","No courses found","コースが見つかりません","강의를 찾을 수 없음","Aucun cours trouvé","Keine Kurse gefunden","未找到课程")}</div>
            <div style={{fontSize:"12px"}}>{t("Admin-д сургалт нэмнэ үү","Add courses from admin panel")}</div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"14px"}}>
            {filtered.map(c=>(
              <div key={c._id} style={{background:isDark?"rgba(255,255,255,0.03)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"14px",overflow:"hidden",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.15)":"#bbb";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=colors.border;}}>
                {/* Thumbnail */}
                <div style={{height:"110px",background:isDark?"rgba(255,255,255,0.04)":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                  {c.thumbnail&&c.thumbnail.length<=4
                    ?<span style={{fontSize:"40px"}}>{c.thumbnail}</span>
                    :c.thumbnail?.startsWith("http")
                      ?<img src={c.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                      :<i className="fa-solid fa-graduation-cap" style={{fontSize:"32px",color:colors.text3}}/>}
                  {c.featured&&<span style={{position:"absolute",top:"8px",right:"8px",background:isDark?"rgba(255,255,255,0.9)":"#000",color:isDark?"#000":"#fff",fontSize:"9px",fontWeight:700,padding:"2px 7px",borderRadius:"10px"}}>★</span>}
                  <div style={{position:"absolute",bottom:"0",left:"0",right:"0",padding:"4px 8px",background:"rgba(0,0,0,0.45)",display:"flex",gap:"6px"}}>
                    <span style={{color:"#fff",fontSize:"9px"}}>{cl(c.category||"development")}</span>
                    <span style={{color:"rgba(255,255,255,0.5)"}}>·</span>
                    <span style={{color:"#fff",fontSize:"9px"}}>{lv(c.level||"beginner")}</span>
                  </div>
                </div>
                {/* Info */}
                <div style={{padding:"12px 14px"}}>
                  <div style={{color:colors.text,fontWeight:700,fontSize:"13px",marginBottom:"6px",lineHeight:1.3}}>{c.title}</div>
                  {c.description&&<div style={{color:colors.text3,fontSize:"11px",marginBottom:"8px",lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:"2",WebkitBoxOrient:"vertical" as any}}>{c.description}</div>}
                  {c.instructor&&<div style={{color:colors.text3,fontSize:"11px",marginBottom:"8px"}}><i className="fa-solid fa-user" style={{marginRight:"4px"}}/>{c.instructor}</div>}
                  {hasAccess ? (
                    <Link href={`/courses/${c.slug||c._id}`} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:"8px",padding:"8px 12px",textDecoration:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <i className="fa-solid fa-circle-play" style={{color:"#34d399",fontSize:"13px"}}/>
                        <span style={{color:"#34d399",fontSize:"12px",fontWeight:700}}>{t("Үнэгүй үзэх","Watch Free","無料視聴","무료 시청","Regarder gratuitement","Kostenlos ansehen","免费观看")}</span>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{color:"#34d399",fontSize:"11px"}}/>
                    </Link>
                  ) : (
                    <Link href="/payment" style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",border:`1px solid ${colors.border}`,borderRadius:"8px",padding:"8px 12px",textDecoration:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <i className="fa-solid fa-lock" style={{color:"#f59e0b",fontSize:"12px"}}/>
                        <span style={{color:colors.text3,fontSize:"12px"}}>{t("Захиалга шаардана","Subscription required","サブスクが必要","구독 필요","Abonnement requis","Abo erforderlich","需要订阅")}</span>
                      </div>
                      <span style={{color:colors.text,fontSize:"11px",fontWeight:700,background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)",padding:"2px 8px",borderRadius:"5px"}}>
                        {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}
                      </span>
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
