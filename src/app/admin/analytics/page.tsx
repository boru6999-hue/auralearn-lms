"use client";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AnalyticsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [data, setData]    = useState<any>(null);
  const [loading, setLoad] = useState(true);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  const BG    =isDark?"#0a0a0a":"#f5f5f5";
  const CARD  =isDark?"rgba(255,255,255,0.04)":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e5e5e5";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#888";

  useEffect(()=>{
    fetch("/api/admin/analytics").then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  const revenueData = MONTHS.map((_,mi)=>{
    const found = data?.monthlyRevenue?.find((r:any)=>r._id?.month===mi+1);
    return found?.total||0;
  });
  const usersData = MONTHS.map((_,mi)=>{
    const found = data?.monthlyUsers?.find((r:any)=>r._id?.month===mi+1);
    return found?.count||0;
  });
  const maxR = Math.max(...revenueData,1);
  const maxU = Math.max(...usersData,1);

  if(!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;

  return (
    <AdminLayout>
      <div style={{padding:"28px 32px",background:BG,minHeight:"100vh"}}>
        <h1 style={{fontSize:"20px",fontWeight:800,color:TEXT,marginBottom:"3px"}}>
          {t("Аналитик","Analytics","分析","분석","Analytique","Analytik","分析")}
        </h1>
        <p style={{color:MUTED,fontSize:"12px",marginBottom:"24px"}}>
          {t("Бодит мэдээлэл","Real-time data","リアルタイムデータ","실시간 데이터","Données en temps réel","Echtzeit-Daten","实时数据")}
        </p>

        {loading?(
          <div style={{textAlign:"center",padding:"80px",color:MUTED}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"28px",display:"block",marginBottom:"12px"}}/>
            {t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}
          </div>
        ):(
          <>
            {/* KPI Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"20px"}}>
              {[
                {label:t("Нийт хэрэглэгч","Total Users","総ユーザー","전체 사용자","Utilisateurs","Benutzer","总用户"), value:data?.totalUsers||0, icon:"fa-users"},
                {label:t("Нийт сургалт","Total Courses","総コース","전체 강의","Total Cours","Kurse","总课程"),          value:data?.totalCourses||0, icon:"fa-graduation-cap"},
                {label:t("Нийт орлого","Total Revenue","総収益","총 수익","Revenu total","Gesamtumsatz","总收入"),        value:`₮${(data?.totalRevenue||0).toLocaleString()}`, icon:"fa-money-bill"},
              ].map((k,i)=>(
                <div key={i} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"10px",padding:"18px"}}>
                  <i className={`fa-solid ${k.icon}`} style={{color:MUTED,fontSize:"16px",marginBottom:"8px",display:"block"}}/>
                  <div style={{color:TEXT,fontSize:"24px",fontWeight:800,marginBottom:"4px"}}>{k.value}</div>
                  <div style={{color:MUTED,fontSize:"12px"}}>{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              {/* Revenue */}
              <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"20px"}}>
                <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"4px"}}>
                  {t("Сарын орлого","Monthly Revenue","月次収益","월별 수익","Revenu mensuel","Monatlicher Umsatz","月度收入")}
                </h3>
                <p style={{color:MUTED,fontSize:"11px",marginBottom:"16px"}}>{new Date().getFullYear()}</p>
                <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"100px"}}>
                  {revenueData.map((v,i)=>(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
                      <div style={{width:"100%",background:v>0?(isDark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)"):(isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"),borderRadius:"3px 3px 0 0",height:`${(v/maxR)*86}px`,minHeight:"2px",transition:"all 0.3s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.35)"}
                        onMouseLeave={e=>e.currentTarget.style.background=v>0?(isDark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)"):(isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)")}/>
                      <span style={{fontSize:"7px",color:MUTED}}>{MONTHS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users */}
              <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"20px"}}>
                <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"4px"}}>
                  {t("Сарын бүртгэл","Monthly Signups","月次登録","월별 가입","Inscriptions mensuelles","Monatliche Anmeldungen","月度注册")}
                </h3>
                <p style={{color:MUTED,fontSize:"11px",marginBottom:"16px"}}>{new Date().getFullYear()}</p>
                <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"100px"}}>
                  {usersData.map((v,i)=>(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
                      <div style={{width:"100%",background:v>0?(isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.1)"):(isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"),borderRadius:"3px 3px 0 0",height:`${(v/maxU)*86}px`,minHeight:"2px"}}
                        onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)"}
                        onMouseLeave={e=>e.currentTarget.style.background=v>0?(isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.1)"):(isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)")}/>
                      <span style={{fontSize:"7px",color:MUTED}}>{MONTHS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
