"use client";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/ai/admin/AdminLayout";

export default function AdminSettingsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [saved, setSaved] = useState(false);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const INP={width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"14px",fontWeight:300,padding:"10px 0",fontFamily:"inherit"} as React.CSSProperties;

  const SECTIONS=[
    {
      title:t("Платформын мэдээлэл","Platform info","プラットフォーム情報","플랫폼 정보","Infos plateforme","Plattform-Info","平台信息"),
      fields:[
        {label:t("Платформын нэр","Platform name","プラットフォーム名","플랫폼 이름","Nom","Name","平台名称"),val:"AuraLearn"},
        {label:t("Вэбсайт","Website","ウェブサイト","웹사이트","Site web","Webseite","网站"),val:"https://auralearn-lms.vercel.app"},
        {label:t("Холбоо барих имэйл","Contact email","連絡先メール","연락처 이메일","Email de contact","Kontakt-E-Mail","联系邮箱"),val:"admin@auralearn.com"},
      ]
    },
    {
      title:t("Тохиргоо","Configuration","設定","구성","Configuration","Konfiguration","配置"),
      fields:[
        {label:t("Сарын захиалгын үнэ (₮)","Monthly subscription price (₮)","月額料金(₮)","월 구독 가격(₮)","Prix mensuel(₮)","Monatspreis(₮)","月费(₮)"),val:"29900"},
        {label:t("Gemini API key","Gemini API key","Gemini APIキー","Gemini API 키","Clé API Gemini","Gemini API-Schlüssel","Gemini API密钥"),val:"AIza••••••••"},
      ]
    },
  ];

  return (
    <AdminLayout>
      <div style={{padding:"clamp(24px,4vw,40px) clamp(20px,4vw,48px)",background:BG,minHeight:"100vh"}}>
        <div style={{maxWidth:"560px"}}>
          <div style={{marginBottom:"40px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
            <h1 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
              {t("Тохиргоо","Settings","設定","설정","Paramètres","Einstellungen","设置")}
            </h1>
          </div>

          {SECTIONS.map((sec,si)=>(
            <div key={si} style={{marginBottom:"36px",paddingBottom:"28px",borderBottom:`1px solid ${RULE}`}}>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>{sec.title}</div>
              <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
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
            <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}
              style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,border:"none",cursor:"pointer",borderRadius:"100px",fontFamily:"inherit"}}>
              {t("Хадгалах","Save changes","保存する","저장하기","Enregistrer","Speichern","保存")}
            </button>
            {saved&&<span style={{fontSize:"12px",color:"#22c55e",letterSpacing:"0.04em"}}>
              ✓ {t("Хадгалагдлаа","Saved","保存済み","저장됨","Enregistré","Gespeichert","已保存")}
            </span>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
