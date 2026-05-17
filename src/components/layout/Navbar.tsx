"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenu] = useState(false);
  const [coursesOpen, setCourses] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const coursesRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  const LANGS = [
    {code:"mn",label:"🇲🇳 Монгол"},
    {code:"en",label:"🇺🇸 English"},
    {code:"ja",label:"🇯🇵 日本語"},
    {code:"ko",label:"🇰🇷 한국어"},
    {code:"fr",label:"🇫🇷 Français"},
    {code:"de",label:"🇩🇪 Deutsch"},
    {code:"zh",label:"🇨🇳 中文"},
  ];

  useEffect(()=>{
    function handleClick(e: MouseEvent) {
      if(coursesRef.current && !coursesRef.current.contains(e.target as Node)) setCourses(false);
      if(langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if(userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return ()=>document.removeEventListener("mousedown", handleClick);
  },[]);

  useEffect(()=>{ setMenu(false); setCourses(false); },[pathname]);

  if(!mounted) return <nav style={{height:"56px",background:isDark?"#000":"#fff",borderBottom:"1px solid #1e1e1e"}}/>;

  const BG     = isDark?"rgba(0,0,0,0.95)":"rgba(255,255,255,0.97)";
  const BORDER = isDark?"#1e1e1e":"#e5e5e5";
  const TEXT   = isDark?"#fff":"#000";
  const MUTED  = isDark?"#666":"#999";
  const HOVER  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)";
  const DROP   = isDark?"#111":"#fff";

  const isAdmin = (session?.user as any)?.role === "admin";

  const COURSES_MENU = [
    {href:"/courses",          icon:"fa-graduation-cap", label:t("Бүх сургалт","All Courses","すべてのコース","전체 강의","Tous les cours","Alle Kurse","所有课程")},
    {href:"/courses/language", icon:"fa-language",       label:t("Хэл сургалт","Language","語学","언어","Langues","Sprachen","语言")},
    {href:"/courses/development",icon:"fa-code",         label:t("Хөгжүүлэлт","Development","開発","개발","Développement","Entwicklung","开发")},
    {href:"/courses/live",     icon:"fa-circle-dot",     label:t("Шууд хичээл","Live Classes","ライブ","라이브","En direct","Live","直播"), live:true},
    {href:"/courses/certificate",icon:"fa-certificate",  label:t("Гэрчилгээ","Certificate","証明書","수료증","Certificat","Zertifikat","证书")},
  ];

  const NAV_LINKS = [
    {href:"/dashboard", label:t("Хяналтын самбар","Dashboard","ダッシュボード","대시보드","Tableau de bord","Dashboard","仪表盘")},
    {href:"/payment",   label:t("Захиалга","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")},
    {href:"/profile",   label:t("Профайл","Profile","プロフィール","프로필","Profil","Profil","个人资料")},
  ];

  const linkStyle = (active?: boolean):React.CSSProperties => ({
    color: active ? TEXT : MUTED,
    textDecoration:"none", fontSize:"13px", fontWeight: active ? 600 : 400,
    padding:"6px 10px", borderRadius:"7px",
    background: active ? HOVER : "transparent",
    display:"flex", alignItems:"center", gap:"5px",
    whiteSpace:"nowrap",
  });

  return (
    <>
      <nav style={{ position:"sticky", top:0, zIndex:200, height:"56px", background:BG, borderBottom:`1px solid ${BORDER}`, backdropFilter:"blur(12px)", display:"flex", alignItems:"center", padding:"0 16px", gap:"8px", fontFamily:"'Inter',-apple-system,sans-serif" }}>

        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:"7px", textDecoration:"none", marginRight:"8px", flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="21" stroke={isDark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)"} strokeWidth="0.8"/>
            <circle cx="22" cy="22" r="11" fill={TEXT}/>
            <path d="M22 13L28 30L25.5 30L24.3 26.5L19.7 26.5L18.5 30L16 30ZM20.5 24L23.5 24L22 15Z" fill={isDark?"#000":"#fff"}/>
          </svg>
          <span style={{ fontSize:"14px", fontWeight:800, color:TEXT, letterSpacing:"0.02em" }}>AuraLearn</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display:"flex", alignItems:"center", gap:"2px", flex:1 }} className="desktop-nav">

          {/* Courses dropdown */}
          <div ref={coursesRef} style={{ position:"relative" }}>
            <button onClick={()=>setCourses(!coursesOpen)} style={{ ...linkStyle(), background:"none", border:"none", cursor:"pointer", color:MUTED }}>
              <i className="fa-solid fa-graduation-cap" style={{fontSize:"12px"}}/>
              {t("Сургалт","Courses","コース","강의","Cours","Kurse","课程")}
              <i className={`fa-solid fa-chevron-${coursesOpen?"up":"down"}`} style={{fontSize:"9px"}}/>
            </button>
            {coursesOpen&&(
              <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:DROP, border:`1px solid ${BORDER}`, borderRadius:"10px", padding:"6px", minWidth:"200px", boxShadow:"0 8px 30px rgba(0,0,0,0.15)", zIndex:300 }}>
                {COURSES_MENU.map(item=>(
                  <Link key={item.href} href={item.href} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 12px", borderRadius:"7px", textDecoration:"none", color:TEXT, fontSize:"13px" }}
                    onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <i className={`fa-solid ${item.icon}`} style={{ width:"14px", fontSize:"12px", color:(item as any).live?"#ef4444":MUTED }}/>
                    {item.label}
                    {(item as any).live&&<span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#ef4444", display:"inline-block", animation:"pulse 1.5s infinite", marginLeft:"auto" }}/>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {session && <Link href="/dashboard" style={linkStyle(pathname==="/dashboard")}>{t("Dashboard","Dashboard")}</Link>}
          {isAdmin && <Link href="/admin" style={linkStyle(pathname.startsWith("/admin"))}><i className="fa-solid fa-shield-halved" style={{fontSize:"11px",color:"#f59e0b"}}/> Admin</Link>}
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:"6px", flexShrink:0 }}>

          {/* Theme */}
          <button onClick={()=>{
            const newTheme = isDark ? "light" : "dark";
            localStorage.setItem("aura_theme", newTheme);
            document.cookie = `aura_theme=${newTheme};path=/;max-age=31536000`;
            document.documentElement.setAttribute("data-theme", newTheme);
            window.dispatchEvent(new CustomEvent("themeChange", { detail: newTheme }));
          }} style={{ background:"none", border:`1px solid ${BORDER}`, color:MUTED, width:"32px", height:"32px", borderRadius:"8px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>
            <i className={`fa-solid ${isDark?"fa-sun":"fa-moon"}`}/>
          </button>

          {/* Language */}
          <div ref={langRef} style={{ position:"relative" }}>
            <button onClick={()=>setLangOpen(!langOpen)} style={{ background:"none", border:`1px solid ${BORDER}`, color:MUTED, height:"32px", padding:"0 8px", borderRadius:"8px", cursor:"pointer", fontSize:"12px", display:"flex", alignItems:"center", gap:"4px" }}>
              {LANGS.find(l=>l.code===lang)?.label.split(" ")[0]}
              <i className="fa-solid fa-chevron-down" style={{fontSize:"8px"}}/>
            </button>
            {langOpen&&(
              <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, background:DROP, border:`1px solid ${BORDER}`, borderRadius:"10px", padding:"6px", minWidth:"140px", boxShadow:"0 8px 30px rgba(0,0,0,0.15)", zIndex:300 }}>
                {LANGS.map(l=>(
                  <button key={l.code} onClick={()=>{
                    const newLang = l.code;
                    localStorage.setItem("aura_lang", newLang);
                    document.cookie = `aura_lang=${newLang};path=/;max-age=31536000`;
                    window.dispatchEvent(new CustomEvent("langChange", { detail: newLang }));
                    setLangOpen(false);
                  }} style={{ width:"100%", background:lang===l.code?HOVER:"transparent", border:"none", color:TEXT, padding:"7px 12px", borderRadius:"6px", cursor:"pointer", fontSize:"12px", textAlign:"left", display:"flex", alignItems:"center", gap:"6px" }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          {session ? (
            <div ref={userRef} style={{ position:"relative" }}>
              <button onClick={()=>setUserOpen(!userOpen)} style={{ background:"none", border:`1px solid ${BORDER}`, borderRadius:"8px", cursor:"pointer", padding:"3px", display:"flex", alignItems:"center", gap:"6px", height:"32px" }}>
                {session.user?.image&&session.user.image.length<500 ? (
                  <img src={session.user.image} style={{ width:"24px", height:"24px", borderRadius:"50%", objectFit:"cover" }} alt=""/>
                ) : (
                  <div style={{ width:"24px", height:"24px", borderRadius:"50%", background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, color:TEXT }}>
                    {(session.user?.name||"?")[0].toUpperCase()}
                  </div>
                )}
                <i className="fa-solid fa-chevron-down" style={{ fontSize:"8px", color:MUTED, marginRight:"4px" }}/>
              </button>
              {userOpen&&(
                <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, background:DROP, border:`1px solid ${BORDER}`, borderRadius:"10px", padding:"6px", minWidth:"180px", boxShadow:"0 8px 30px rgba(0,0,0,0.15)", zIndex:300 }}>
                  <div style={{ padding:"8px 12px", borderBottom:`1px solid ${BORDER}`, marginBottom:"4px" }}>
                    <div style={{ color:TEXT, fontSize:"13px", fontWeight:600 }}>{session.user?.name}</div>
                    <div style={{ color:MUTED, fontSize:"11px" }}>{session.user?.email}</div>
                  </div>
                  {NAV_LINKS.map(l=>(
                    <Link key={l.href} href={l.href} style={{ display:"block", padding:"8px 12px", borderRadius:"7px", textDecoration:"none", color:TEXT, fontSize:"13px" }}
                      onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {l.label}
                    </Link>
                  ))}
                  <button onClick={()=>signOut({callbackUrl:"/"})} style={{ width:"100%", background:"none", border:"none", color:"#f87171", padding:"8px 12px", borderRadius:"7px", cursor:"pointer", fontSize:"13px", textAlign:"left", marginTop:"4px", borderTop:`1px solid ${BORDER}` }}>
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{marginRight:"6px"}}/>
                    {t("Гарах","Sign out","サインアウト","로그아웃","Se déconnecter","Abmelden","退出")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" style={{ background:isDark?"#fff":"#000", color:isDark?"#000":"#fff", padding:"6px 14px", borderRadius:"8px", textDecoration:"none", fontSize:"13px", fontWeight:600 }}>
              {t("Нэвтрэх","Sign in","ログイン","로그인","Se connecter","Anmelden","登录")}
            </Link>
          )}

          {/* Mobile menu button */}
          <button onClick={()=>setMenu(!menuOpen)} className="mobile-menu-btn" style={{ background:"none", border:`1px solid ${BORDER}`, color:MUTED, width:"32px", height:"32px", borderRadius:"8px", cursor:"pointer", display:"none", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>
            <i className={`fa-solid ${menuOpen?"fa-xmark":"fa-bars"}`}/>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen&&(
        <div style={{ position:"fixed", top:"56px", left:0, right:0, bottom:0, background:BG, zIndex:199, overflowY:"auto", padding:"16px" }}>
          {COURSES_MENU.map(item=>(
            <Link key={item.href} href={item.href} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", borderRadius:"10px", textDecoration:"none", color:TEXT, fontSize:"14px", marginBottom:"4px", background:HOVER }}>
              <i className={`fa-solid ${item.icon}`} style={{ width:"16px", color:(item as any).live?"#ef4444":MUTED }}/>
              {item.label}
            </Link>
          ))}
          {session&&<Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", borderRadius:"10px", textDecoration:"none", color:TEXT, fontSize:"14px", marginBottom:"4px", background:HOVER }}>{t("Dashboard","Dashboard")}</Link>}
          {isAdmin&&<Link href="/admin" style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", borderRadius:"10px", textDecoration:"none", color:"#f59e0b", fontSize:"14px", marginBottom:"4px", background:HOVER }}><i className="fa-solid fa-shield-halved"/>Admin</Link>}
          {!session&&<Link href="/auth/login" style={{ display:"block", background:isDark?"#fff":"#000", color:isDark?"#000":"#fff", padding:"14px 16px", borderRadius:"10px", textDecoration:"none", fontSize:"14px", fontWeight:600, textAlign:"center", marginTop:"8px" }}>{t("Нэвтрэх","Sign in")}</Link>}
        </div>
      )}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .mobile-menu-btn{display:flex!important;}
        }
      `}</style>
    </>
  );
}
