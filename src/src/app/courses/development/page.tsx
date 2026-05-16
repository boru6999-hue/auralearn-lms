"use client";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";
import Link from "next/link";

const COURSES = [
  { id: 5, title: "Full Stack Web Dev", students: 2100, rating: 4.9, img: "🚀", price: 89 },
  { id: 6, title: "React & Next.js", students: 1560, rating: 4.8, img: "⚛️", price: 59 },
  { id: 7, title: "Node.js & MongoDB", students: 980, rating: 4.7, img: "🟢", price: 49 },
  { id: 8, title: "Python Basics", students: 1890, rating: 4.8, img: "🐍", price: 39 },
  { id: 9, title: "UI/UX Design", students: 720, rating: 4.7, img: "🎨", price: 44 },
  { id: 10, title: "TypeScript Pro", students: 650, rating: 4.8, img: "🔷", price: 54 },
];

export default function Page() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const { formatPrice: fmt } = useCurrency();
  const [search, setSearch] = useState("");
  if (!mounted) return <div style={{ minHeight:"100vh", background:"#000" }} />;
  const filtered = COURSES.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ minHeight:"100vh", background:colors.bg, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 24px" }}>
        <Link href="/courses" style={{ color:colors.text3, fontSize:"13px", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"4px", marginBottom:"16px" }}>
          ← {lang==="mn"?"Бүх сургалт":"All Courses"}
        </Link>
        <h1 style={{ color:colors.text, fontSize:"26px", fontWeight:800, marginBottom:"6px" }}>
          💻 {lang==="mn"?"Хөгжүүлэлт":lang==="ja"?"開発":lang==="ko"?"개발":lang==="fr"?"Développement":lang==="de"?"Entwicklung":lang==="zh"?"开发":"Development"}
        </h1>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==="mn"?"Хайх...":"Search..."} style={{ width:"100%", maxWidth:"340px", height:"40px", background:isDark?"rgba(255,255,255,0.06)":"#fff", border:`1px solid ${colors.border}`, borderRadius:"10px", padding:"0 14px", color:colors.text, fontSize:"14px", outline:"none", margin:"20px 0", boxSizing:"border-box" as const }} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"14px" }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background:isDark?"rgba(255,255,255,0.03)":"#fff", border:`1px solid ${colors.border}`, borderRadius:"14px", overflow:"hidden", transition:"all 0.2s", cursor:"pointer" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor="#06b6d4";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=colors.border;}}>
              <div style={{ height:"90px", background:isDark?"rgba(6,182,212,0.1)":"rgba(6,182,212,0.05)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px" }}>{c.img}</div>
              <div style={{ padding:"12px" }}>
                <div style={{ color:colors.text, fontWeight:700, fontSize:"13px", marginBottom:"8px" }}>{c.title}</div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"#f59e0b", fontSize:"12px" }}>★ {c.rating}</span>
                  <span style={{ color:colors.text, fontWeight:700 }}>{fmt(c.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
