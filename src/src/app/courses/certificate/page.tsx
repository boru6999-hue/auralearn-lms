"use client";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";
import Link from "next/link";

const CERTS = [
  { id: 1, title: "Full Stack Web Developer", courses: 6, duration: "6 сар", img: "🏆", price: 199 },
  { id: 2, title: "English Proficiency B2", courses: 4, duration: "4 сар", img: "🎓", price: 149 },
  { id: 3, title: "Data Science Fundamentals", courses: 5, duration: "5 сар", img: "📊", price: 179 },
  { id: 4, title: "UI/UX Design Professional", courses: 4, duration: "3 сар", img: "🎨", price: 159 },
];

export default function Page() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const { formatPrice: fmt } = useCurrency();
  if (!mounted) return <div style={{ minHeight:"100vh", background:"#000" }} />;
  return (
    <div style={{ minHeight:"100vh", background:colors.bg, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px" }}>
        <Link href="/courses" style={{ color:colors.text3, fontSize:"13px", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"4px", marginBottom:"16px" }}>
          ← {lang==="mn"?"Бүх сургалт":"All Courses"}
        </Link>
        <h1 style={{ color:colors.text, fontSize:"26px", fontWeight:800, marginBottom:"6px" }}>
          🏆 {lang==="mn"?"Гэрчилгээний хөтөлбөр":lang==="ja"?"修了証プログラム":lang==="ko"?"수료증 프로그램":"Certificate Programs"}
        </h1>
        <p style={{ color:colors.text3, fontSize:"14px", marginBottom:"28px" }}>
          {lang==="mn"?"Мэргэжлийн гэрчилгээ аваарай":"Earn professional certificates"}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"16px" }}>
          {CERTS.map(cert => (
            <div key={cert.id} style={{ background:isDark?"rgba(255,255,255,0.03)":"#fff", border:`1px solid ${colors.border}`, borderRadius:"14px", padding:"20px", transition:"all 0.2s", cursor:"pointer" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#f59e0b";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=colors.border;e.currentTarget.style.transform="none";}}>
              <div style={{ fontSize:"36px", marginBottom:"12px" }}>{cert.img}</div>
              <div style={{ color:colors.text, fontWeight:800, fontSize:"15px", marginBottom:"8px" }}>{cert.title}</div>
              <div style={{ color:colors.text3, fontSize:"12px", marginBottom:"12px" }}>{cert.courses} {lang==="mn"?"сургалт":"courses"} · {cert.duration}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:colors.text, fontWeight:700, fontSize:"18px" }}>{fmt(cert.price)}</span>
                <button style={{ background:"linear-gradient(135deg,#7c3aed,#06b6d4)", color:"#fff", border:"none", padding:"7px 16px", borderRadius:"8px", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                  {lang==="mn"?"Эхлэх":"Enroll"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
