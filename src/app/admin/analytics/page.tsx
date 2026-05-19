"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminAnalyticsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [data, setData] = useState<any>({});

  const t = (mn:string,en:string) => lang==="mn"?mn:en;

  useEffect(()=>{
    fetch("/api/admin/analytics").then(r=>r.json()).then(d=>setData(d)).catch(()=>{});
  },[]);

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
        HOVER=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  const STATS=[
    {label:t("Нийт хэрэглэгч","Total users"),val:data.totalUsers||0},
    {label:t("Premium","Premium users"),val:data.premiumUsers||0},
    {label:t("Нийт сургалт","Total courses"),val:data.totalCourses||0},
    {label:t("Нийтлэгдсэн","Published courses"),val:data.publishedCourses||0},
    {label:t("Нийт хичээл","Total lessons"),val:data.totalLessons||0},
    {label:t("Идэвхтэй хэрэглэгч","Active users"),val:data.activeUsers||0},
  ];

  return (
    <AdminLayout>
      <div style={{padding:"40px 48px",background:BG,minHeight:"100vh"}}>
        <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <h1 style={{fontSize:"28px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>{t("Аналитик","Analytics")}</h1>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${RULE}`,marginBottom:"40px"}}>
          {STATS.map((s,i)=>(
            <div key={i} style={{padding:"24px 0",borderRight:i%3<2?`1px solid ${RULE}`:"none",paddingRight:i%3<2?"24px":"0",paddingLeft:i%3>0?"24px":"0",borderBottom:i<3?`1px solid ${RULE}`:"none"}}>
              <div style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,marginBottom:"8px"}}>{s.label}</div>
              <div style={{fontSize:"36px",fontWeight:300,color:TEXT,letterSpacing:"-1.5px"}}>{s.val.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:"13px",color:MUTED,fontWeight:300}}>{t("Дэлгэрэнгүй аналитик удахгүй нэмэгдэнэ.","Detailed analytics coming soon.")}</div>
      </div>
    </AdminLayout>
  );
}
