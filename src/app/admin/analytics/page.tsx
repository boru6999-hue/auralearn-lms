"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/ai/admin/AdminLayout";

export default function AdminAnalyticsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [data, setData] = useState<any>({});
  const [loading, setLoad] = useState(true);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    fetch("/api/admin/analytics").then(r=>r.json()).then(d=>{setData(d);setLoad(false);}).catch(()=>setLoad(false));
  },[]);

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";

  const STATS=[
    {label:t("Нийт хэрэглэгч","Total users","総ユーザー","총 사용자","Utilisateurs totaux","Nutzer gesamt","总用户"),val:data.totalUsers||0},
    {label:t("Premium хэрэглэгч","Premium users","プレミアム","프리미엄 사용자","Utilisateurs premium","Premium-Nutzer","高级用户"),val:data.premiumUsers||0},
    {label:t("Нийт сургалт","Total courses","総コース","총 강의","Cours totaux","Kurse gesamt","总课程"),val:data.totalCourses||0},
    {label:t("Нийтлэгдсэн","Published","公開済み","게시됨","Publiés","Veröffentlicht","已发布"),val:data.publishedCourses||0},
    {label:t("Нийт хичээл","Total lessons","総レッスン","총 레슨","Leçons totales","Lektionen gesamt","总课程数"),val:data.totalLessons||0},
    {label:t("Идэвхтэй","Active users","アクティブ","활성 사용자","Utilisateurs actifs","Aktive Nutzer","活跃用户"),val:data.activeUsers||0},
  ];

  return (
    <AdminLayout>
      <div style={{padding:"clamp(24px,4vw,40px) clamp(20px,4vw,48px)",background:BG,minHeight:"100vh"}}>
        <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <h1 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
            {t("Аналитик","Analytics","アナリティクス","분석","Analytique","Analytik","分析")}
          </h1>
        </div>

        {loading?(
          <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}</div>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${RULE}`,marginBottom:"40px"}} className="stats-grid-admin">
              {STATS.map((s,i)=>(
                <div key={i} style={{padding:"clamp(16px,3vw,24px) 0",borderRight:i%3<2?`1px solid ${RULE}`:"none",paddingRight:i%3<2?"clamp(16px,3vw,24px)":"0",paddingLeft:i%3>0?"clamp(16px,3vw,24px)":"0",borderBottom:i<3?`1px solid ${RULE}`:"none"}}>
                  <div style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,marginBottom:"8px"}}>{s.label}</div>
                  <div style={{fontSize:"clamp(28px,4vw,36px)",fontWeight:300,color:TEXT,letterSpacing:"-1.5px"}}>{s.val.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:"13px",color:MUTED,fontWeight:300}}>
              {t("Дэлгэрэнгүй аналитик удахгүй нэмэгдэнэ.","Detailed analytics charts coming soon.","詳細分析は近日公開予定。","상세 분석 곧 출시.","Graphiques analytiques bientôt disponibles.","Detaillierte Analysen demnächst verfügbar.","详细分析图表即将推出。")}
            </div>
          </>
        )}
      </div>
      <style>{`@media(max-width:600px){.stats-grid-admin{grid-template-columns:1fr 1fr!important;}}`}</style>
    </AdminLayout>
  );
}
