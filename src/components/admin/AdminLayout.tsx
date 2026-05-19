"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebar] = useState(false);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    if(status==="unauthenticated") router.push("/auth/login");
    if(status==="authenticated"&&(session?.user as any)?.role!=="admin") router.push("/");
  },[status,session]);

  useEffect(()=>{ setSidebar(false); },[pathname]);

  if(!mounted) return null;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const ACTIVE = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)";
  const HOVER  = isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)";

  const NAV = [
    { href:"/admin",           icon:"fa-chart-line",      label:t("Хяналт","Overview","概要","개요","Aperçu","Übersicht","概览") },
    { href:"/admin/users",     icon:"fa-users",           label:t("Хэрэглэгч","Users","ユーザー","사용자","Utilisateurs","Benutzer","用户") },
    { href:"/admin/courses",   icon:"fa-graduation-cap",  label:t("Сургалт","Courses","コース","강의","Cours","Kurse","课程") },
    { href:"/admin/payments",  icon:"fa-credit-card",     label:t("Төлбөр","Payments","支払い","결제","Paiements","Zahlungen","支付") },
    { href:"/admin/live",      icon:"fa-tower-broadcast", label:t("Шууд","Live Studio","ライブ","라이브","Direct","Live","直播") },
    { href:"/admin/analytics", icon:"fa-chart-bar",       label:t("Аналитик","Analytics","分析","분석","Analytique","Analytik","分析") },
    { href:"/admin/settings",  icon:"fa-gear",            label:t("Тохиргоо","Settings","設定","설정","Paramètres","Einstellungen","设置") },
  ];

  const Sidebar = (
    <div style={{width:"200px",flexShrink:0,borderRight:`1px solid ${RULE}`,height:"100vh",display:"flex",flexDirection:"column",background:BG,position:"sticky",top:0}}>
      <div style={{padding:"28px 20px 24px",borderBottom:`1px solid ${RULE}`}}>
        <div style={{fontSize:"9px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"3px"}}>AuraLearn</div>
        <div style={{fontSize:"13px",fontWeight:300,color:TEXT,letterSpacing:"-0.2px"}}>
          {t("Удирдлага","Admin","管理","관리","Admin","Admin","管理")}
        </div>
      </div>

      <nav style={{flex:1,padding:"12px 10px",overflowY:"auto"}}>
        {NAV.map(item=>{
          const active = item.href==="/admin"?pathname==="/admin":pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:"9px",padding:"8px 10px",borderRadius:"6px",textDecoration:"none",marginBottom:"1px",background:active?ACTIVE:"transparent",transition:"background 0.15s"}}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.background=HOVER;}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
              <i className={`fa-solid ${item.icon}`} style={{fontSize:"11px",color:active?TEXT:MUTED,width:"13px",flexShrink:0}}/>
              <span style={{fontSize:"12px",color:active?TEXT:MUTED,fontWeight:active?400:300,whiteSpace:"nowrap"}}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{padding:"16px 20px",borderTop:`1px solid ${RULE}`}}>
        <Link href="/" style={{fontSize:"11px",color:MUTED,textDecoration:"none",display:"flex",alignItems:"center",gap:"5px",fontWeight:300}}>
          <i className="fa-solid fa-arrow-left" style={{fontSize:"9px"}}/>
          {t("Сайт руу буцах","Back to site","サイトへ戻る","사이트로 돌아가기","Retour au site","Zurück","返回网站")}
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>

      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">{Sidebar}</div>

      {/* Mobile top bar */}
      <div className="admin-topbar" style={{display:"none",position:"fixed",top:0,left:0,right:0,height:"52px",background:BG,borderBottom:`1px solid ${RULE}`,zIndex:200,alignItems:"center",padding:"0 16px",justifyContent:"space-between"}}>
        <div style={{fontSize:"13px",fontWeight:300,color:TEXT}}>Admin</div>
        <button onClick={()=>setSidebar(!sidebarOpen)} style={{background:"none",border:`1px solid ${RULE}`,color:MUTED,width:"32px",height:"32px",borderRadius:"6px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <i className={`fa-solid ${sidebarOpen?"fa-xmark":"fa-bars"}`} style={{fontSize:"12px"}}/>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setSidebar(false)}>
          <div style={{position:"absolute",top:0,left:0,bottom:0,width:"220px",background:BG,borderRight:`1px solid ${RULE}`,display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${RULE}`,marginTop:"52px"}}>
              <div style={{fontSize:"9px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED}}>Admin panel</div>
            </div>
            <nav style={{flex:1,padding:"12px 10px"}}>
              {NAV.map(item=>{
                const active=item.href==="/admin"?pathname==="/admin":pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:"9px",padding:"10px 10px",borderRadius:"6px",textDecoration:"none",marginBottom:"2px",background:active?ACTIVE:"transparent"}}>
                    <i className={`fa-solid ${item.icon}`} style={{fontSize:"12px",color:active?TEXT:MUTED,width:"14px"}}/>
                    <span style={{fontSize:"13px",color:active?TEXT:MUTED,fontWeight:active?400:300}}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div style={{padding:"16px 20px",borderTop:`1px solid ${RULE}`}}>
              <Link href="/" style={{fontSize:"11px",color:MUTED,textDecoration:"none",display:"flex",alignItems:"center",gap:"5px"}}>
                <i className="fa-solid fa-arrow-left" style={{fontSize:"9px"}}/>
                {t("Буцах","Back","戻る","돌아가기","Retour","Zurück","返回")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{flex:1,overflow:"auto",paddingTop:"0"}} className="admin-content">
        {children}
      </div>

      <style>{`
        @media(max-width:768px){
          .admin-sidebar-desktop{display:none!important;}
          .admin-topbar{display:flex!important;}
          .admin-content{padding-top:52px!important;}
        }
      `}</style>
    </div>
  );
}
