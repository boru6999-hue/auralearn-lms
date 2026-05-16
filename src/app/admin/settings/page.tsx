"use client";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function SettingsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [s, setS] = useState({siteName:"AuraLearn",siteUrl:"https://auralearn.mn",currency:"MNT",language:"mn",smtpHost:"smtp.resend.com",smtpPort:"587",maintenance:false,regOpen:true});

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  const BG    =isDark?"#0a0a0a":"#f5f5f5";
  const CARD  =isDark?"rgba(255,255,255,0.04)":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e5e5e5";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#888";
  const INP={width:"100%",height:"38px",background:isDark?"#1a1a1a":"#f0f0f0",border:`1px solid ${BORDER}`,borderRadius:"8px",padding:"0 12px",color:TEXT,fontSize:"13px",outline:"none",boxSizing:"border-box"} as React.CSSProperties;

  if(!mounted)return<div style={{minHeight:"100vh",background:"#000"}}/>;

  return(
    <AdminLayout>
      <div style={{padding:"28px 32px",background:BG,minHeight:"100vh"}}>
        <h1 style={{fontSize:"20px",fontWeight:800,color:TEXT,marginBottom:"3px"}}>
          {t("Тохиргоо","Settings","設定","설정","Paramètres","Einstellungen","设定")}
        </h1>
        <p style={{color:MUTED,fontSize:"12px",marginBottom:"24px"}}>
          {t("Системийн тохиргоо","System Configuration","システム設定","시스템 설정","Configuration système","Systemkonfiguration","系统配置")}
        </p>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
          {/* General */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"20px"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"14px"}}>
              <i className="fa-solid fa-globe" style={{marginRight:"8px",color:MUTED}}/>{t("Ерөнхий","General","一般","일반","Général","Allgemein","常规")}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Сайтын нэр","Site Name","サイト名","사이트 이름","Nom du site","Websitename","网站名称")}</label>
                <input value={s.siteName} onChange={e=>setS(x=>({...x,siteName:e.target.value}))} style={INP}/></div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>URL</label>
                <input value={s.siteUrl} onChange={e=>setS(x=>({...x,siteUrl:e.target.value}))} style={INP}/></div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Валют","Currency","通貨","통화","Devise","Währung","货币")}</label>
                <select value={s.currency} onChange={e=>setS(x=>({...x,currency:e.target.value}))} style={INP}>
                  <option value="MNT">MNT — Төгрөг</option>
                  <option value="USD">USD — Dollar</option>
                  <option value="JPY">JPY — Yen</option>
                  <option value="KRW">KRW — Won</option>
                  <option value="EUR">EUR — Euro</option>
                </select></div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{t("Хэл","Language","言語","언어","Langue","Sprache","语言")}</label>
                <select value={s.language} onChange={e=>setS(x=>({...x,language:e.target.value}))} style={INP}>
                  <option value="mn">Монгол</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select></div>
            </div>
          </div>

          {/* Email */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"20px"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"14px"}}>
              <i className="fa-solid fa-envelope" style={{marginRight:"8px",color:MUTED}}/>Email / SMTP
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>SMTP Host</label>
                <input value={s.smtpHost} onChange={e=>setS(x=>({...x,smtpHost:e.target.value}))} style={INP}/></div>
              <div><label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>SMTP Port</label>
                <input value={s.smtpPort} onChange={e=>setS(x=>({...x,smtpPort:e.target.value}))} style={INP}/></div>
            </div>
          </div>

          {/* System */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"20px"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"14px"}}>
              <i className="fa-solid fa-shield" style={{marginRight:"8px",color:MUTED}}/>{t("Систем","System","システム","시스템","Système","System","系统")}
            </h3>
            {[
              {key:"maintenance",label:t("Засвар горим","Maintenance Mode","メンテナンス","유지보수","Maintenance","Wartungsmodus","维护模式"),desc:t("Сайтыг засвар горимд оруул","Put site in maintenance","","","","","")},
              {key:"regOpen",label:t("Бүртгэл нээлттэй","Registration Open","登録受付中","회원가입 허용","Inscription ouverte","Registrierung offen","注册开放"),desc:t("Шинэ бүртгэл зөвшөөрөх","Allow new registrations","","","","","")},
            ].map(item=>(
              <div key={item.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
                <div>
                  <div style={{color:TEXT,fontSize:"13px"}}>{item.label}</div>
                  <div style={{color:MUTED,fontSize:"11px"}}>{item.desc}</div>
                </div>
                <div onClick={()=>setS(x=>({...x,[item.key]:!(x as any)[item.key]}))}
                  style={{width:"38px",height:"20px",borderRadius:"10px",background:(s as any)[item.key]?(isDark?"#888":"#333"):"#ccc",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
                  <div style={{width:"14px",height:"14px",borderRadius:"50%",background:"#fff",position:"absolute",top:"3px",left:(s as any)[item.key]?"21px":"3px",transition:"all 0.2s"}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"20px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
            <h3 style={{color:TEXT,fontSize:"13px",fontWeight:700,marginBottom:"8px"}}>
              <i className="fa-solid fa-floppy-disk" style={{marginRight:"8px",color:MUTED}}/>{t("Хадгалах","Save Changes","変更を保存","변경 저장","Enregistrer","Speichern","保存更改")}
            </h3>
            <p style={{color:MUTED,fontSize:"11px",marginBottom:"14px"}}>
              {t("Тохиргоог хадгалахын өмнө шалгана уу","Please verify before saving","保存前に確認してください","저장 전 확인하세요","Vérifiez avant d'enregistrer","Vor dem Speichern überprüfen","保存前请验证")}
            </p>
            <button style={{width:"100%",background:isDark?"#333":"#000",color:"#fff",border:"none",padding:"11px",borderRadius:"8px",fontWeight:700,cursor:"pointer",fontSize:"13px"}}>
              <i className="fa-solid fa-check" style={{marginRight:"8px"}}/>{t("Хадгалах","Save","保存","저장","Enregistrer","Speichern","保存")}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
