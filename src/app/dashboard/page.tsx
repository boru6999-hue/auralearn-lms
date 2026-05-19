"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [courses, setCourses]     = useState<any[]>([]);
  const [progressData, setProgress]= useState<any[]>([]);
  const [dbUser, setUser]         = useState<any>(null);
  const [loading, setLoad]        = useState(true);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    if(status==="unauthenticated") router.push("/auth/login");
    if(status==="authenticated"){
      fetch("/api/dashboard").then(r=>r.json()).then(d=>{
        setCourses(d.courses||[]);
        setProgress(d.progressData||[]);
        setUser(d.user||null);
        setLoad(false);
      }).catch(()=>setLoad(false));
    }
  },[status]);

  if(!mounted||status==="loading"||loading) return <div style={{minHeight:"100vh",background:isDark?"#0a0a0f":"#F2F0EB"}}/>;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const HOVER = isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  const totalCompleted = progressData.reduce((a:number,p:any)=>a+(p.completedLessons||0),0);
  const avgProgress    = progressData.length>0?Math.round(progressData.reduce((a:number,p:any)=>a+p.percent,0)/progressData.length):0;
  const displayName    = dbUser?.name||session?.user?.name||"";
  const displayImage   = (dbUser?.image&&dbUser.image.length<500)?dbUser.image:(session?.user?.image||"");

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1080px",margin:"0 auto",padding:"0 48px"}}>

        {/* Header */}
        <div style={{padding:"48px 0 32px",borderBottom:`1px solid ${RULE}`,display:"grid",gridTemplateColumns:"1fr auto",alignItems:"end",gap:"24px"}}>
          <div>
            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"8px"}}>
              {t("Хяналтын самбар","Dashboard","ダッシュボード","대시보드","Tableau de bord","Dashboard","仪表盘")}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              {displayImage?(
                <img src={displayImage} style={{width:"40px",height:"40px",borderRadius:"50%",objectFit:"cover"}} alt=""/>
              ):(
                <div style={{width:"40px",height:"40px",borderRadius:"50%",background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:300,color:TEXT}}>
                  {displayName?.[0]?.toUpperCase()||"?"}
                </div>
              )}
              <div>
                <div style={{fontSize:"10px",letterSpacing:"0.06em",color:MUTED,marginBottom:"2px"}}>
                  {t("Сайн байна уу","Welcome back","おかえり","환영합니다","Bon retour","Willkommen zurück","欢迎回来")}
                </div>
                <div style={{fontSize:"20px",fontWeight:300,color:TEXT,letterSpacing:"-0.5px"}}>{displayName}</div>
              </div>
            </div>
          </div>
          <Link href="/courses" style={{padding:"8px 20px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",borderRadius:"100px",textDecoration:"none"}}>
            {t("+ Сургалт нэмэх","+ Add course","+ コース追加","+ 강의 추가","+ Ajouter","+ Hinzufügen","+ 添加课程")}
          </Link>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${RULE}`}}>
          {[
            {label:t("Нийт сургалт","Total courses","コース数","총 강의","Total cours","Kurse gesamt","总课程"),val:courses.length},
            {label:t("Дүүргэсэн хичээл","Lessons completed","完了レッスン","완료 레슨","Leçons complétées","Abgeschlossene Lektionen","完成课程"),val:totalCompleted},
            {label:t("Дундаж явц","Avg progress","平均進捗","평균 진도","Progression moy.","Durchschn. Fortschritt","平均进度"),val:`${avgProgress}%`},
          ].map((s,i,arr)=>(
            <div key={i} style={{padding:"28px 0",borderRight:i<arr.length-1?`1px solid ${RULE}`:"none",paddingRight:i<arr.length-1?"28px":"0",paddingLeft:i>0?"28px":"0"}}>
              <div style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,marginBottom:"8px"}}>{s.label}</div>
              <div style={{fontSize:"32px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Course list */}
        <div style={{padding:"32px 0 0"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
            {t("Миний сургалтууд","My courses","マイコース","내 강의","Mes cours","Meine Kurse","我的课程")}
          </div>

          {courses.length===0?(
            <div style={{padding:"60px 0",textAlign:"center"}}>
              <div style={{fontSize:"13px",color:MUTED,fontWeight:300,marginBottom:"20px"}}>
                {t("Та одоогоор ямар ч сургалтанд бүртгүүлээгүй байна","You haven't enrolled in any courses yet","まだコースに登録していません","아직 강의에 등록하지 않았습니다","Vous n'êtes inscrit à aucun cours","Sie haben sich noch für keinen Kurs angemeldet","您尚未报名任何课程")}
              </div>
              <Link href="/courses" style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",textDecoration:"none"}}>
                {t("Сургалт хайх →","Browse courses →","コースを探す →","강의 찾기 →","Chercher des cours →","Kurse suchen →","浏览课程 →")}
              </Link>
            </div>
          ):(
            courses.map((c:any,i:number)=>{
              const prog = progressData.find((p:any)=>p.courseId===c._id);
              const pct  = prog?.percent||0;
              return (
                <Link key={c._id} href={`/courses/${c.slug}`} style={{display:"grid",gridTemplateColumns:"40px 1fr 120px auto",gap:"16px",alignItems:"center",padding:"18px 0",borderBottom:`1px solid ${RULE}`,textDecoration:"none",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:"11px",color:MUTED,letterSpacing:"0.04em",fontWeight:300}}>{String(i+1).padStart(2,"0")}</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:"15px",fontWeight:300,color:TEXT,letterSpacing:"-0.3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                    {prog?.lastLessonId&&<div style={{fontSize:"11px",color:MUTED,marginTop:"2px"}}>{t("Үргэлжлүүлэх","Continue","続ける","계속","Continuer","Weiter","继续")} →</div>}
                  </div>
                  <div>
                    <div style={{height:"1px",background:RULE,marginBottom:"4px",position:"relative"}}>
                      <div style={{position:"absolute",top:0,left:0,height:"100%",width:`${pct}%`,background:pct===100?"#22c55e":TEXT,transition:"width 0.3s"}}/>
                    </div>
                    <span style={{fontSize:"10px",color:MUTED,letterSpacing:"0.04em"}}>{pct}% {t("дүүргэсэн","complete","完了","완료","complété","abgeschlossen","已完成")}</span>
                  </div>
                  <i className="fa-solid fa-arrow-right" style={{fontSize:"11px",color:MUTED}}/>
                </Link>
              );
            })
          )}
        </div>

        {/* Certificate section */}
        {courses.length>0&&(
          <div style={{borderTop:`1px solid ${RULE}`,padding:"32px 0 48px",display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px"}}>
            <div>
              <div style={{fontSize:"13px",fontWeight:300,color:TEXT,letterSpacing:"-0.2px",marginBottom:"4px"}}>
                {t("Таны гэрчилгээнүүд","Your certificates","あなたの証明書","내 수료증","Vos certificats","Ihre Zertifikate","您的证书")}
              </div>
              <div style={{fontSize:"11px",color:MUTED,fontWeight:300}}>
                {t("Бүх хичээл дүүргэж, тестэнд тэнцсэн сургалтын гэрчилгээ.","Certificates for courses where you completed all lessons and passed the quiz.","全レッスン完了・クイズ合格で証明書取得。","모든 레슨 완료 및 퀴즈 통과 시 수료증.","Certificats pour cours entièrement complétés.","Zertifikate für abgeschlossene Kurse.","完成所有课程并通过测验即可获得证书。")}
              </div>
            </div>
            <Link href="/courses/certificate" style={{padding:"8px 20px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",borderRadius:"100px",textDecoration:"none",whiteSpace:"nowrap" as const}}>
              {t("Гэрчилгээ харах","View certificates","証明書を見る","수료증 보기","Voir certificats","Zertifikate anzeigen","查看证书")} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
