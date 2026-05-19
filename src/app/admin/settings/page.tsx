"use client";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminSettingsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [saved, setSaved] = useState(false);

  const t = (mn:string,en:string) => lang==="mn"?mn:en;

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const INP={width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"14px",fontWeight:300,padding:"10px 0",fontFamily:"inherit"} as React.CSSProperties;

  const SECTIONS=[
    {title:t("Платформын мэдээлэл","Platform info"),fields:[
      {label:t("Платформын нэр","Platform name"),val:"AuraLearn",key:"name"},
      {label:t("Вэбсайт","Website"),val:"https://auralearn-lms.vercel.app",key:"url"},
      {label:t("Холбоо барих имэйл","Contact email"),val:"admin@auralearn.com",key:"email"},
    ]},
    {title:t("Тохиргоо","Configuration"),fields:[
      {label:t("Сарын захиалгын үнэ (₮)","Monthly subscription price (₮)"),val:"29900",key:"price"},
      {label:t("Gemini API key","Gemini API key"),val:"AIza••••••••",key:"gemini"},
    ]},
  ];

  return (
    <AdminLayout>
      <div style={{padding:"40px 48px",background:BG,minHeight:"100vh",maxWidth:"680px"}}>
        <div style={{marginBottom:"40px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <h1 style={{fontSize:"28px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>{t("Тохиргоо","Settings")}</h1>
        </div>

        {SECTIONS.map((sec,si)=>(
          <div key={si} style={{marginBottom:"40px",paddingBottom:"32px",borderBottom:`1px solid ${RULE}`}}>
            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"24px"}}>{sec.title}</div>
            <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
              {sec.fields.map((f,fi)=>(
                <div key={fi}>
                  <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>{f.label}</label>
                  <input defaultValue={f.val} style={INP}/>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,border:"none",cursor:"pointer",borderRadius:"100px",fontFamily:"inherit"}}>
            {t("Хадгалах","Save changes")}
          </button>
          {saved&&<span style={{fontSize:"12px",color:"#22c55e",letterSpacing:"0.04em"}}>✓ {t("Хадгалагдлаа","Saved")}</span>}
        </div>
      </div>
    </AdminLayout>
  );
}
