"use client";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

const LIVE = [
  { id: 1, title: "English Conversation", time: "Өнөөдөр 18:00", seats: 8, teacher: "Sarah K." },
  { id: 2, title: "Japanese Speaking", time: "Маргааш 10:00", seats: 12, teacher: "Tanaka R." },
  { id: 3, title: "React Live Coding", time: "Маргааш 15:00", seats: 5, teacher: "Alex M." },
  { id: 4, title: "Korean Grammar", time: "Нөгөөдөр 14:00", seats: 15, teacher: "Kim J." },
  { id: 5, title: "Python Workshop", time: "Нөгөөдөр 16:00", seats: 10, teacher: "David L." },
];

export default function Page() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  if (!mounted) return <div style={{ minHeight:"100vh", background:"#000" }} />;
  return (
    <div style={{ minHeight:"100vh", background:colors.bg, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px" }}>
        <Link href="/courses" style={{ color:colors.text3, fontSize:"13px", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"4px", marginBottom:"16px" }}>
          ← {lang==="mn"?"Бүх сургалт":"All Courses"}
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
          <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#ef4444", display:"inline-block", animation:"pulse 1.5s infinite" }} />
          <h1 style={{ color:colors.text, fontSize:"26px", fontWeight:800 }}>
            {lang==="mn"?"🎙️ Шууд хичээл":lang==="ja"?"🎙️ ライブ授業":lang==="ko"?"🎙️ 라이브 클래스":"🎙️ Live Classes"}
          </h1>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginTop:"24px" }}>
          {LIVE.map(l => (
            <div key={l.id} style={{ background:isDark?"rgba(255,255,255,0.03)":"#fff", border:`1px solid ${colors.border}`, borderRadius:"12px", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.2s", cursor:"pointer" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#ef4444";e.currentTarget.style.transform="translateX(4px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=colors.border;e.currentTarget.style.transform="none";}}>
              <div>
                <div style={{ color:colors.text, fontWeight:700, fontSize:"15px", marginBottom:"4px" }}>{l.title}</div>
                <div style={{ color:colors.text3, fontSize:"12px" }}>{l.teacher} · {l.time}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:"#ef4444", fontSize:"12px", fontWeight:600 }}>{lang==="mn"?`${l.seats} суудал`:`${l.seats} seats`}</div>
                <button style={{ marginTop:"6px", background:"#ef4444", color:"#fff", border:"none", padding:"5px 14px", borderRadius:"6px", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                  {lang==="mn"?"Бүртгүүлэх":"Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
