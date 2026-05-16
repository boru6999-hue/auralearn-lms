"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];

export default function AdminDashboard() {
  const { data:session, status } = useSession();
  const router = useRouter();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [pendingPayments, setPending] = useState(0);
  const [loading, setLoad] = useState(true);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{ if(status==="unauthenticated") router.push("/auth/login"); },[status]);

  useEffect(()=>{
    Promise.all([
      fetch("/api/admin/analytics").then(r=>r.json()),
      fetch("/api/admin/payments?status=completed").then(r=>r.json()),
      fetch("/api/admin/courses").then(r=>r.json()),
      fetch("/api/admin/payments?status=pending").then(r=>r.json()),
    ]).then(([a, p, c, pend])=>{
      setAnalytics(a);
      setRecentPayments(p.payments?.slice(0,5)||[]);
      // Sort courses by studentsCount
      if(Array.isArray(c)){
        const sorted=[...c].sort((a,b)=>(b.studentsCount||0)-(a.studentsCount||0)).slice(0,4);
        setTopCourses(sorted);
      }
      setPending(pend.stats?.pending||0);
    }).catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  if(!mounted||status==="loading") return <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}><i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",color:"#555"}}/></div>;

  const BG    =isDark?"#0a0a0a":"#f5f5f5";
  const CARD  =isDark?"rgba(255,255,255,0.04)":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e5e5e5";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#888";

  const revenueData = MONTHS.map((_,mi)=>{
    const found=analytics?.monthlyRevenue?.find((r:any)=>r._id?.month===mi+1);
    return found?.total||0;
  });
  const maxRev = Math.max(...revenueData,1);

  const STATS=[
    {icon:"fa-users",         label:t("Нийт хэрэглэгч","Total Users","総ユーザー","전체 사용자","Utilisateurs","Benutzer","总用户"),      value:analytics?.totalUsers??0,   change:12},
    {icon:"fa-graduation-cap",label:t("Нийт сургалт","Total Courses","総コース","전체 강의","Total Cours","Kurse","总课程"),              value:analytics?.totalCourses??0,  change:3},
    {icon:"fa-money-bill",    label:t("Нийт орлого","Total Revenue","総収益","총 수익","Revenu total","Gesamtumsatz","总收入"),            value:analytics?.totalRevenue!=null?`₮${Number(analytics.totalRevenue).toLocaleString()}`:"₮0", change:15},
    {icon:"fa-clock",         label:t("Хүлээгдэж буй төлбөр","Pending Payments","保留中の支払い","대기 중 결제","Paiements en attente","Ausstehende Zahlungen","待处理付款"), value:pendingPayments},
  ];

  // Pending actions with real data
  const PENDING_ACTIONS=[
    {icon:"fa-clock",         label:t("Хүлээгдэж буй төлбөр","Pending payments","保留中の支払い","대기 결제","Paiements en attente","Ausstehende Zahlungen","待处理付款"), count:pendingPayments, color:"#f59e0b"},
    {icon:"fa-graduation-cap",label:t("Нийтлэгдэх сургалт","Unpublished courses","未公開コース","미발행 강의","Cours non publiés","Unveröffentlichte Kurse","未发布课程"), count:analytics?.totalCourses?Math.max(0,analytics.totalCourses-topCourses.filter(c=>c.status==="published").length):0, color:MUTED},
    {icon:"fa-users",         label:t("Нийт хэрэглэгч","Total users","総ユーザー","전체 사용자","Total utilisateurs","Gesamt Benutzer","总用户"), count:analytics?.totalUsers||0, color:MUTED},
  ];

  return (
    <AdminLayout>
      <div style={{padding:"28px 32px",background:BG,minHeight:"100vh"}}>
        <div style={{marginBottom:"24px"}}>
          <h1 style={{fontSize:"20px",fontWeight:800,color:TEXT,marginBottom:"3px"}}>
            {t("Хяналтын самбар","Dashboard","ダッシュボード","대시보드","Tableau de bord","Dashboard","仪表盘")}
          </h1>
          <p style={{color:MUTED,fontSize:"13px"}}>
            {t("Тавтай морилно уу","Welcome back","おかえりなさい","환영합니다","Bienvenue","Willkommen","欢迎回来")}, {session?.user?.name}
          </p>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px",marginBottom:"24px"}}>
          {STATS.map((s,i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                <i className={`fa-solid ${s.icon}`} style={{fontSize:"15px",color:MUTED}}/>
                {s.change!=null&&<span style={{fontSize:"11px",color:s.change>0?"#34d399":"#f87171",fontWeight:600}}>{s.change>0?"↑":"↓"} {Math.abs(s.change)}%</span>}
              </div>
              <div style={{color:TEXT,fontSize:"22px",fontWeight:800,marginBottom:"3px"}}>
                {loading?<i className="fa-solid fa-spinner fa-spin" style={{fontSize:"16px",color:MUTED}}/>:s.value}
              </div>
              <div style={{color:MUTED,fontSize:"11px"}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:"14px",marginBottom:"14px"}}>
          {/* Revenue chart */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"20px"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"4px"}}>
              {t("Сарын орлого","Monthly Revenue","月次収益","월별 수익","Revenu mensuel","Monatlicher Umsatz","月度收入")}
            </h3>
            <p style={{color:MUTED,fontSize:"11px",marginBottom:"16px"}}>{new Date().getFullYear()} · {t("Бодит DB мэдээлэл","Real DB data","実DBデータ","실제 DB 데이터","Données DB réelles","Echte DB-Daten","真实DB数据")}</p>
            <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"120px"}}>
              {revenueData.map((v,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                  <div style={{width:"100%",background:v>0?(isDark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)"):(isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"),borderRadius:"3px 3px 0 0",height:`${(v/maxRev)*100}px`,minHeight:"2px",transition:"all 0.3s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.35)"}
                    onMouseLeave={e=>e.currentTarget.style.background=v>0?(isDark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)"):(isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)")}/>
                  <span style={{fontSize:"8px",color:MUTED}}>{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent payments from DB */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"18px"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"14px"}}>
              {t("Сүүлийн борлуулалт","Recent Sales","最近の売上","최근 판매","Ventes récentes","Letzte Verkäufe","最近销售")}
            </h3>
            {loading?(
              <div style={{textAlign:"center",padding:"20px",color:MUTED}}><i className="fa-solid fa-spinner fa-spin"/></div>
            ):recentPayments.length===0?(
              <div style={{textAlign:"center",padding:"20px",color:MUTED,fontSize:"12px"}}>
                {t("Гүйлгээ байхгүй","No transactions yet")}
              </div>
            ):recentPayments.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:isDark?`hsl(${i*60},25%,25%)`:`hsl(${i*60},30%,85%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:TEXT,flexShrink:0}}>
                  {(p.user?.name||"?")[0].toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:TEXT,fontSize:"12px",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.user?.name||"—"}</div>
                  <div style={{color:MUTED,fontSize:"10px"}}>{p.method||"—"} · {p.createdAt?new Date(p.createdAt).toLocaleDateString():"—"}</div>
                </div>
                <div style={{color:"#34d399",fontSize:"12px",fontWeight:700,flexShrink:0}}>
                  {p.currency==="MNT"?"₮":"$"}{(p.amount||0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
          {/* Most viewed courses - from DB sorted by studentsCount */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"18px"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"12px"}}>
              {t("Хамгийн их үзсэн сургалт","Most Viewed Courses","最も視聴されたコース","가장 많이 본 강의","Cours les plus regardés","Meistgesehene Kurse","最多查看的课程")}
            </h3>
            {loading?(
              <div style={{textAlign:"center",padding:"20px",color:MUTED}}><i className="fa-solid fa-spinner fa-spin"/></div>
            ):topCourses.length===0?(
              <div style={{textAlign:"center",padding:"20px",color:MUTED,fontSize:"12px"}}>
                {t("Сургалт байхгүй","No courses yet")}
              </div>
            ):topCourses.map((c,i)=>(
              <div key={c._id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"7px 0",borderBottom:i<topCourses.length-1?`1px solid ${BORDER}`:"none"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"6px",background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0}}>
                  {c.thumbnail&&c.thumbnail.length<=4?c.thumbnail:<i className="fa-solid fa-graduation-cap" style={{fontSize:"11px",color:MUTED}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:TEXT,fontSize:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                  <div style={{color:MUTED,fontSize:"10px"}}>{(c.studentsCount||0).toLocaleString()} {t("оюутан","students","生徒","수강생","étudiants","Studenten","学生")}</div>
                </div>
                <div style={{width:"50px",height:"3px",background:isDark?"#1a1a1a":"#eee",borderRadius:"2px",flexShrink:0}}>
                  <div style={{height:"100%",background:isDark?"#888":"#333",borderRadius:"2px",width:topCourses[0]?.studentsCount>0?`${((c.studentsCount||0)/(topCourses[0]?.studentsCount||1))*100}%`:"0%"}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Pending actions - real data */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"18px"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"12px"}}>
              {t("Хяналтын мэдээлэл","Overview","概要","개요","Aperçu","Überblick","概览")}
            </h3>
            {PENDING_ACTIONS.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:i<PENDING_ACTIONS.length-1?`1px solid ${BORDER}`:"none"}}>
                <i className={`fa-solid ${item.icon}`} style={{fontSize:"12px",color:item.color,width:"14px"}}/>
                <span style={{flex:1,color:TEXT,fontSize:"12px"}}>{item.label}</span>
                <span style={{background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",color:MUTED,fontSize:"11px",fontWeight:700,padding:"2px 8px",borderRadius:"10px"}}>
                  {loading?<i className="fa-solid fa-spinner fa-spin" style={{fontSize:"10px"}}/>:item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
