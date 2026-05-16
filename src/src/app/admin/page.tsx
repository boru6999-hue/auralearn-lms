"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";

const CARD = "rgba(255,255,255,0.04)";
const BORDER = "#1e1e1e";
const MUTED = "#555";

const T: Record<string, Record<string, string>> = {
  title:           { mn:"Хяналтын самбар", en:"Dashboard",       ja:"ダッシュボード", ko:"대시보드",     fr:"Tableau de bord", de:"Dashboard",     zh:"仪表盘"      },
  welcome:         { mn:"Тавтай морилно уу", en:"Welcome back",   ja:"おかえりなさい", ko:"환영합니다",   fr:"Bienvenue",       de:"Willkommen",    zh:"欢迎回来"    },
  total_users:     { mn:"Нийт хэрэглэгч",   en:"Total Users",    ja:"総ユーザー",     ko:"전체 사용자", fr:"Utilisateurs",    de:"Benutzer",      zh:"总用户"      },
  total_courses:   { mn:"Нийт сургалт",      en:"Total Courses",  ja:"総コース",       ko:"전체 강의",   fr:"Total Cours",     de:"Kurse",         zh:"总课程"      },
  active_subs:     { mn:"Идэвхтэй захиалга", en:"Active Subs",   ja:"有効サブスク",   ko:"활성 구독",   fr:"Abonnements",     de:"Abonnements",   zh:"活跃订阅"    },
  today_revenue:   { mn:"Өнөөдрийн орлого",  en:"Today's Revenue",ja:"本日の収益",    ko:"오늘 수익",   fr:"Revenu du jour",  de:"Heutiger Umsatz",zh:"今日收入"   },
  visits:          { mn:"Өнөөдрийн visit",   en:"Today's Visits", ja:"本日の訪問",    ko:"오늘 방문",   fr:"Visites",         de:"Besuche",       zh:"今日访问"    },
  pending:         { mn:"Хүлээгдэж буй",     en:"Pending",        ja:"保留中",        ko:"대기 중",     fr:"En attente",      de:"Ausstehend",    zh:"待处理"      },
  revenue_chart:   { mn:"Орлогын тэмдэглэл", en:"Revenue Analytics",ja:"収益分析",   ko:"수익 분석",   fr:"Analytique",      de:"Umsatz",        zh:"收益分析"    },
  recent_sales:    { mn:"Сүүлийн борлуулалт",en:"Recent Sales",  ja:"最近の売上",     ko:"최근 판매",   fr:"Ventes récentes", de:"Letzte Verkäufe",zh:"最近销售"   },
  most_viewed:     { mn:"Хамгийн их үзсэн",  en:"Most Viewed",   ja:"最も視聴",       ko:"최다 조회",   fr:"Plus regardés",   de:"Meistgesehen",  zh:"最多查看"    },
  pending_actions: { mn:"Хүлээгдэж буй",     en:"Pending Actions",ja:"保留中のアクション",ko:"대기 작업",fr:"Actions en attente",de:"Ausstehende",  zh:"待处理操作"  },
};

function tr(key: string, lang: string) { return T[key]?.[lang] || T[key]?.en || key; }

function StatCard({ icon, label, value, change }: any) {
  return (
    <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:"12px", padding:"18px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize:"16px", color:"#aaa" }} />
        {change !== undefined && <span style={{ fontSize:"11px", color:change>0?"#34d399":"#f87171", fontWeight:600 }}>{change>0?"↑":"↓"} {Math.abs(change)}%</span>}
      </div>
      <div style={{ color:"#fff", fontSize:"22px", fontWeight:800, marginBottom:"4px" }}>{value}</div>
      <div style={{ color:MUTED, fontSize:"12px" }}>{label}</div>
    </div>
  );
}

const RECENT_SALES = [
  { name:"Буянбат Т.", plan:"Pro", amount:"₮99,000", time:"2 мин" },
  { name:"Tanaka R.",  plan:"Basic", amount:"$9",    time:"15 мин" },
  { name:"Kim J.",     plan:"Enterprise", amount:"₩135,000", time:"1 цаг" },
  { name:"Sarah K.",   plan:"Pro", amount:"$29",     time:"2 цаг" },
];

const MONTHLY = [40,65,45,80,55,90,70,85,60,95,75,100];
const MONTHS  = ["J","F","M","A","M","J","J","A","S","O","N","D"];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLang();

  useEffect(() => { if (status==="unauthenticated") router.push("/auth/login"); }, [status]);
  if (status==="loading") return <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", color:"#555" }}>
    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:"24px" }} />
  </div>;

  const max = Math.max(...MONTHLY);

  return (
    <AdminLayout>
      <div style={{ padding:"28px 32px" }}>
        <div style={{ marginBottom:"24px" }}>
          <h1 style={{ fontSize:"20px", fontWeight:800, color:"#fff", marginBottom:"3px" }}>{tr("title", lang)}</h1>
          <p style={{ color:MUTED, fontSize:"13px" }}>{tr("welcome", lang)}, {session?.user?.name}</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:"12px", marginBottom:"24px" }}>
          <StatCard icon="fa-users"          label={tr("total_users",lang)}   value="5,284"  change={12} />
          <StatCard icon="fa-graduation-cap" label={tr("total_courses",lang)} value="147"    change={3}  />
          <StatCard icon="fa-crown"          label={tr("active_subs",lang)}   value="1,832"  change={8}  />
          <StatCard icon="fa-money-bill"     label={tr("today_revenue",lang)} value="₮2.4M"  change={15} />
          <StatCard icon="fa-eye"            label={tr("visits",lang)}        value="3,921"  change={-2} />
          <StatCard icon="fa-clock"          label={tr("pending",lang)}       value="24" />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"14px", marginBottom:"14px" }}>

          {/* Chart */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:"12px", padding:"20px" }}>
            <h3 style={{ color:"#fff", fontSize:"13px", fontWeight:700, marginBottom:"16px" }}>{tr("revenue_chart",lang)}</h3>
            <div style={{ display:"flex", alignItems:"flex-end", gap:"5px", height:"120px" }}>
              {MONTHLY.map((v,i) => (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                  <div style={{ width:"100%", background:"rgba(255,255,255,0.15)", borderRadius:"3px 3px 0 0", height:`${(v/max)*100}px`, transition:"all 0.3s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"} />
                  <span style={{ fontSize:"8px", color:MUTED }}>{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sales */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:"12px", padding:"18px" }}>
            <h3 style={{ color:"#fff", fontSize:"13px", fontWeight:700, marginBottom:"14px" }}>{tr("recent_sales",lang)}</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {RECENT_SALES.map((s,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:`hsl(${i*60+30},0%,${25+i*10}%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, flexShrink:0 }}>
                    {s.name[0]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:"#ddd", fontSize:"12px", fontWeight:600 }}>{s.name}</div>
                    <div style={{ color:MUTED, fontSize:"10px" }}>{s.plan} · {s.time}</div>
                  </div>
                  <div style={{ color:"#34d399", fontSize:"12px", fontWeight:700, flexShrink:0 }}>{s.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:"12px", padding:"18px" }}>
            <h3 style={{ color:"#fff", fontSize:"13px", fontWeight:700, marginBottom:"12px" }}>{tr("most_viewed",lang)}</h3>
            {[{title:"Full Stack Web Dev",views:12400,img:"🚀"},{title:"English Beginners",views:9800,img:"🇺🇸"},{title:"React & Next.js",views:7200,img:"⚛️"},{title:"Python Basics",views:6500,img:"🐍"}].map((c,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"7px 0", borderBottom:i<3?`1px solid ${BORDER}`:"none" }}>
                <span style={{ fontSize:"16px" }}>{c.img}</span>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#ddd", fontSize:"12px" }}>{c.title}</div>
                  <div style={{ color:MUTED, fontSize:"10px" }}>{c.views.toLocaleString()} views</div>
                </div>
                <div style={{ width:"50px", height:"3px", background:"#1a1a1a", borderRadius:"2px" }}>
                  <div style={{ height:"100%", background:"#888", borderRadius:"2px", width:`${(c.views/12400)*100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:"12px", padding:"18px" }}>
            <h3 style={{ color:"#fff", fontSize:"13px", fontWeight:700, marginBottom:"12px" }}>{tr("pending_actions",lang)}</h3>
            {[
              { icon:"fa-money-bill-transfer", label:lang==="mn"?"Withdraw хүсэлт":lang==="ja"?"出金申請":lang==="ko"?"출금 요청":"Withdraw requests", count:8, color:"#f59e0b" },
              { icon:"fa-user-check",          label:lang==="mn"?"Багш зөвшөөрөх":lang==="ja"?"講師承認":lang==="ko"?"강사 승인":"Instructor approvals", count:3, color:"#aaa" },
              { icon:"fa-flag",                label:lang==="mn"?"Мэдээлсэн review":lang==="ja"?"報告されたレビュー":lang==="ko"?"신고된 리뷰":"Reported reviews", count:5, color:"#f87171" },
              { icon:"fa-book",                label:lang==="mn"?"Курс зөвшөөрөх":lang==="ja"?"コース承認":lang==="ko"?"강의 승인":"Course approvals", count:12, color:"#888" },
            ].map((item,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 0", borderBottom:i<3?`1px solid ${BORDER}`:"none" }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize:"12px", color:item.color, width:"14px" }} />
                <span style={{ flex:1, color:"#ddd", fontSize:"12px" }}>{item.label}</span>
                <span style={{ background:"rgba(255,255,255,0.08)", color:"#aaa", fontSize:"11px", fontWeight:700, padding:"2px 8px", borderRadius:"10px" }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
