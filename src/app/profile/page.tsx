"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

const ROLES = [
  { value: "student", labelKey: "student", icon: "fa-graduation-cap" },
  { value: "premium", labelKey: "premium", icon: "fa-crown"          },
  { value: "admin",   labelKey: "admin",   icon: "fa-shield-halved"  },
];

const ROLE_COLOR: any = {
  admin:   "#f59e0b",
  premium: "#34d399",
  student: "#888",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLang();
  const { isDark, colors, mounted } = useTheme();
  const p = t.profile;
  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [role, setRole]             = useState("student");
  const [image, setImage]           = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading]       = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState("");

  async function fetchProfile() {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      setName(data.name || "");
      setEmail(data.email || "");
      setRole(data.role || "student");
      setImage(data.image || "");
      setCoverImage(data.coverImage || "");
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated") fetchProfile();
  }, [status]);

  function toBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (result.length > 1_000_000) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX = 400;
            let w = img.width, h = img.height;
            if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
            else { if (h > MAX) { w = w * MAX / h; h = MAX; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
            res(canvas.toDataURL("image/jpeg", 0.8));
          };
          img.src = result;
        } else { res(result); }
      };
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  async function handleSave() {
    setLoading(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image, coverImage }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else { setError(data.error || "Алдаа гарлаа"); }
    } catch { setError("Сүлжээний алдаа"); }
    setLoading(false);
  }

  if (status === "loading") return (
    <div style={{ minHeight:"100vh", background:colors.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:"24px", color:colors.text3 }}/>
    </div>
  );

  if (!mounted) return <div style={{ minHeight:"100vh", background:"#000" }}/>;

  const inputStyle: React.CSSProperties = {
    width:"100%", height:"40px",
    background:colors.inputBg, border:`1px solid ${colors.border}`,
    borderRadius:"8px", padding:"0 14px", color:colors.text,
    fontSize:"14px", outline:"none", boxSizing:"border-box",
    transition:"border-color 0.15s", fontFamily:"inherit",
  };

  const currentRole = ROLES.find(r => r.value === role) || ROLES[0];
  const roleColor = ROLE_COLOR[role] || "#888";

  return (
    <div style={{ minHeight:"100vh", background:colors.bg, fontFamily:"'Inter',-apple-system,sans-serif" }}>

      {/* Cover */}
      <div style={{ position:"relative", height:"180px" }}>
        <div style={{
          height:"180px",
          backgroundImage: coverImage ? `url(${coverImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: coverImage ? "transparent" : colors.bg2,
          borderBottom:`1px solid ${colors.border}`,
        }}/>
        <button onClick={() => coverRef.current?.click()} style={{
          position:"absolute", bottom:"12px", right:"16px",
          background: isDark?"rgba(0,0,0,0.7)":"rgba(255,255,255,0.9)",
          border:`1px solid ${colors.border}`, borderRadius:"6px",
          padding:"6px 12px", color:colors.text2, fontSize:"12px",
          cursor:"pointer", display:"flex", alignItems:"center", gap:"6px",
        }}>
          <i className="fa-solid fa-upload" style={{fontSize:"11px"}}/>
          {p.cover}
        </button>
        <input ref={coverRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={async e => { const f=e.target.files?.[0]; if(f) setCoverImage(await toBase64(f)); }}/>
      </div>

      <div style={{ maxWidth:"600px", margin:"0 auto", padding:"0 24px 60px" }}>

        {/* Avatar + Role badge */}
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:"-40px", marginBottom:"24px" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div onClick={() => avatarRef.current?.click()}
              style={{ width:"80px", height:"80px", borderRadius:"50%", cursor:"pointer", boxShadow:`0 0 0 3px ${colors.bg}` }}>
              {image
                ? <img src={image} alt="avatar" style={{ width:"80px", height:"80px", objectFit:"cover", display:"block", borderRadius:"50%" }}/>
                : <div style={{ width:"80px", height:"80px", borderRadius:"50%", background:colors.bg2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:"28px", fontWeight:700, color:colors.text }}>{name?name[0].toUpperCase():"?"}</span>
                  </div>
              }
            </div>
            <button onClick={() => avatarRef.current?.click()} style={{
              position:"absolute", bottom:0, right:0,
              width:"22px", height:"22px", borderRadius:"50%",
              background:colors.text, border:`2px solid ${colors.bg}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", padding:0,
            }}>
              <i className="fa-solid fa-plus" style={{ fontSize:"9px", color:colors.bg }}/>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}}
              onChange={async e => { const f=e.target.files?.[0]; if(f) setImage(await toBase64(f)); }}/>
          </div>

          {/* Role badge - display only, not editable */}
          <span style={{
            background:`${roleColor}18`, border:`1px solid ${roleColor}44`,
            borderRadius:"20px", padding:"5px 14px",
            color:roleColor, fontSize:"12px", fontWeight:600,
            display:"flex", alignItems:"center", gap:"6px",
          }}>
            <i className={`fa-solid ${currentRole.icon}`} style={{fontSize:"11px"}}/>
            {role === "admin" ? "Admin" : role === "premium" ? "Premium" : "Student"}
          </span>
        </div>

        {/* Name preview */}
        <div style={{ marginBottom:"28px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
            <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21" stroke={isDark?"rgba(255,255,255,0.3)":"rgba(0,0,0,0.2)"} strokeWidth="0.8"/>
              <circle cx="22" cy="22" r="11" fill={isDark?"#fff":"#000"}/>
              <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill={isDark?"#000":"#fff"}/>
            </svg>
            <span style={{ fontSize:"14px", fontWeight:700, color:colors.text3, letterSpacing:"0.05em", textTransform:"uppercase" }}>AuraLearn</span>
          </div>
          <h1 style={{ color:colors.text, fontSize:"20px", fontWeight:700, margin:"0 0 4px" }}>{name||"—"}</h1>
          <p style={{ color:colors.text3, fontSize:"14px", margin:0 }}>{email}</p>
        </div>

        <div style={{ height:"1px", background:colors.border, marginBottom:"24px" }}/>

        {error && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:"8px", padding:"10px 14px", marginBottom:"16px", color:"#f87171", fontSize:"13px" }}>{error}</div>}
        {saved && <div style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:"8px", padding:"10px 14px", marginBottom:"16px", color:"#34d399", fontSize:"13px" }}>{p.saved}</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label style={{ display:"block", fontSize:"13px", color:colors.text2, marginBottom:"6px" }}>
              <i className="fa-solid fa-user" style={{marginRight:"6px"}}/>{p.name}
            </label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} style={inputStyle}
              onFocus={e=>e.target.style.borderColor="#555"} onBlur={e=>e.target.style.borderColor=colors.border}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:"13px", color:colors.text2, marginBottom:"6px" }}>
              <i className="fa-solid fa-envelope" style={{marginRight:"6px"}}/>{p.email}
            </label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}
              onFocus={e=>e.target.style.borderColor="#555"} onBlur={e=>e.target.style.borderColor=colors.border}/>
          </div>

          {/* Role - read only display */}
          <div>
            <label style={{ display:"block", fontSize:"13px", color:colors.text2, marginBottom:"10px" }}>
              <i className="fa-solid fa-id-badge" style={{marginRight:"6px"}}/>{p.role}
            </label>
            <div style={{ height:"40px", background:colors.bg2, border:`1px solid ${colors.border}`, borderRadius:"8px", padding:"0 14px", display:"flex", alignItems:"center", gap:"8px" }}>
              <i className={`fa-solid ${currentRole.icon}`} style={{fontSize:"13px", color:roleColor}}/>
              <span style={{ color:roleColor, fontSize:"14px", fontWeight:600 }}>
                {role==="admin"?"Admin":role==="premium"?"Premium":"Student"}
              </span>
              <span style={{ color:colors.text3, fontSize:"12px", marginLeft:"4px" }}>
                {role==="admin"
  ? (lang==="mn"?"— Бүх эрхтэй":lang==="ja"?"— 全権限":lang==="ko"?"— 모든 권한":lang==="fr"?"— Accès total":lang==="de"?"— Vollzugriff":lang==="zh"?"— 完全访问":"— Full access")
  : role==="premium"
  ? (lang==="mn"?"— Сургалт үнэгүй":lang==="ja"?"— 無料アクセス":lang==="ko"?"— 무료 수강":lang==="fr"?"— Accès gratuit":lang==="de"?"— Kostenlos":lang==="zh"?"— 免费学习":"— Free access")
  : (lang==="mn"?"— Захиалга шаардана":lang==="ja"?"— 要サブスク":lang==="ko"?"— 구독 필요":lang==="fr"?"— Abonnement requis":lang==="de"?"— Abo erforderlich":lang==="zh"?"— 需要订阅":"— Subscription required")}
              </span>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} style={{
            width:"100%", height:"40px",
            background: loading?colors.bg3:colors.btnPrimary,
            color: loading?colors.text3:colors.btnPrimaryText,
            border:"none", borderRadius:"8px",
            fontSize:"14px", fontWeight:600,
            cursor: loading?"not-allowed":"pointer", marginTop:"8px",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
          }}
          onMouseEnter={e=>{if(!loading)e.currentTarget.style.background=colors.btnPrimaryHover;}}
          onMouseLeave={e=>{if(!loading)e.currentTarget.style.background=colors.btnPrimary;}}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"/>{p.saving}</>
              : <><i className="fa-solid fa-floppy-disk"/>{p.save}</>
            }
          </button>
        </div>

        <div style={{ height:"1px", background:colors.border, margin:"28px 0" }}/>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ color:colors.text, fontSize:"14px", fontWeight:500, margin:"0 0 4px" }}>
              <i className="fa-solid fa-key" style={{marginRight:"8px", color:colors.text3}}/>{p.change_pass}
            </p>
            <p style={{ color:colors.text3, fontSize:"13px", margin:0 }}>{p.change_pass_desc}</p>
          </div>
          <a href="/auth/forgot-password" style={{
            height:"40px", padding:"0 16px",
            background:colors.bg2, border:`1px solid ${colors.border}`,
            borderRadius:"8px", color:colors.text2, fontSize:"13px",
            textDecoration:"none", display:"flex", alignItems:"center", gap:"6px",
          }}>
            <i className="fa-solid fa-lock" style={{fontSize:"11px"}}/>
            {p.change_pass}
          </a>
        </div>
      </div>
    </div>
  );
}