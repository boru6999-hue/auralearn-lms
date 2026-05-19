"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [name, setName]   = useState("");
  const [image, setImage] = useState("");
  const [saving, setSave] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbUser, setUser] = useState<any>(null);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    if(status==="unauthenticated") router.push("/auth/login");
    if(status==="authenticated"){
      fetch("/api/me").then(r=>r.json()).then(d=>{
        setUser(d);
        setName(d.name||session?.user?.name||"");
        setImage(d.image||session?.user?.image||"");
      }).catch(()=>{
        setName(session?.user?.name||"");
        setImage(session?.user?.image||"");
      });
    }
  },[status]);

  async function save() {
    setSave(true);
    await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,image})});
    await update({name,image});
    setSave(false); setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  if(!mounted||status==="loading") return <div style={{minHeight:"100vh",background:"#F2F0EB"}}/>;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const INP   = {width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"15px",fontWeight:300,padding:"8px 0",fontFamily:"inherit",letterSpacing:"-0.2px"} as React.CSSProperties;

  const role = (dbUser?.role||session?.user&&(session.user as any).role)||"student";
  const ROLE_LABEL: any = {
    student: {mn:"Оюутан",en:"Student",ja:"学生",ko:"학생",fr:"Étudiant",de:"Student",zh:"学生"},
    premium: {mn:"Сарын эрхтэй",en:"Premium",ja:"プレミアム",ko:"프리미엄",fr:"Premium",de:"Premium",zh:"高级"},
    admin:   {mn:"Админ",en:"Admin",ja:"管理者",ko:"관리자",fr:"Admin",de:"Admin",zh:"管理员"},
  };

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"680px",margin:"0 auto",padding:"0 48px"}}>

        {/* Header */}
        <div style={{padding:"48px 0 40px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"24px"}}>
            {t("Профайл","Profile","プロフィール","프로필","Profil","Profil","个人资料")}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
            {image&&image.length<500?(
              <img src={image} style={{width:"64px",height:"64px",borderRadius:"50%",objectFit:"cover"}} alt=""/>
            ):(
              <div style={{width:"64px",height:"64px",borderRadius:"50%",background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",fontWeight:300,color:TEXT}}>
                {(name||"?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{fontSize:"22px",fontWeight:300,color:TEXT,letterSpacing:"-0.5px"}}>{name||session?.user?.name}</div>
              <div style={{fontSize:"11px",color:MUTED,marginTop:"3px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span>{session?.user?.email}</span>
                <span>·</span>
                <span style={{color:role==="premium"?"#B5863A":role==="admin"?"#22c55e":MUTED}}>
                  {ROLE_LABEL[role]?.[lang]||ROLE_LABEL[role]?.en||role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{padding:"40px 0",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"28px"}}>
            {t("Мэдээлэл засах","Edit information","情報を編集","정보 수정","Modifier les infos","Infos bearbeiten","编辑信息")}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"28px"}}>
            <div>
              <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"8px"}}>
                {t("Нэр","Name","名前","이름","Nom","Name","姓名")}
              </label>
              <input value={name} onChange={e=>setName(e.target.value)} style={INP} placeholder={t("Таны нэр","Your name","お名前","이름","Votre nom","Ihr Name","您的姓名")}/>
            </div>
            <div>
              <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"8px"}}>
                {t("Зургийн URL","Profile image URL","プロフィール画像URL","프로필 이미지 URL","URL de l'image","Bild-URL","头像URL")}
              </label>
              <input value={image} onChange={e=>setImage(e.target.value)} style={INP} placeholder="https://..."/>
            </div>
            <div>
              <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"8px"}}>
                {t("Имэйл","Email","メール","이메일","Email","E-Mail","邮箱")}
              </label>
              <input value={session?.user?.email||""} disabled style={{...INP,color:MUTED,cursor:"not-allowed"}}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginTop:"32px"}}>
            <button onClick={save} disabled={saving} style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",border:"none",cursor:"pointer",letterSpacing:"0.02em"}}>
              {saving?t("Хадгалж байна...","Saving...","保存中...","저장 중...","Enregistrement...","Speichern...","保存中..."):t("Хадгалах","Save changes","保存する","저장하기","Enregistrer","Speichern","保存")}
            </button>
            {saved&&<span style={{fontSize:"12px",color:"#22c55e",letterSpacing:"0.04em"}}>✓ {t("Хадгалагдлаа","Saved","保存済み","저장됨","Enregistré","Gespeichert","已保存")}</span>}
          </div>
        </div>

        {/* Account info */}
        <div style={{padding:"40px 0 48px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
            {t("Дансны мэдээлэл","Account","アカウント","계정","Compte","Konto","账户")}
          </div>
          {[
            {label:t("Үүрэг","Role","役割","역할","Rôle","Rolle","角色"),val:ROLE_LABEL[role]?.[lang]||ROLE_LABEL[role]?.en||role},
            {label:t("Бүртгэлийн огноо","Member since","登録日","가입일","Membre depuis","Mitglied seit","注册日期"),val:dbUser?.createdAt?new Date(dbUser.createdAt).toLocaleDateString():"-"},
          ].map((row,i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${RULE}`:"none"}}>
              <span style={{fontSize:"12px",color:MUTED}}>{row.label}</span>
              <span style={{fontSize:"13px",color:TEXT,fontWeight:300}}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
