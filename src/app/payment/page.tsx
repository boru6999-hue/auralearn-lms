"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";

const DURATIONS = [
  { id: "1m",  months: 1,  label: "1 сар",  labelEn: "1 Month",  discount: 0,   badge: null },
  { id: "3m",  months: 3,  label: "3 сар",  labelEn: "3 Months", discount: 10,  badge: "ХЭМНЭЛТТЭЙ" },
  { id: "6m",  months: 6,  label: "6 сар",  labelEn: "6 Months", discount: 20,  badge: "ХАМГИЙН ДУРТАЙ" },
  { id: "1y",  months: 12, label: "1 жил",  labelEn: "1 Year",   discount: 35,  badge: "ХАМГИЙН ХЯМД" },
];

const PLAN_PRICE = 29;

const MN_METHODS = [
  { id: "qpay",     name: { mn:"QPay", en:"QPay", ja:"QPay", ko:"QPay", fr:"QPay", de:"QPay", zh:"QPay" }, icon: "fa-qrcode",
    desc: { mn:"QPay QR кодоор төлөх", en:"Pay via QPay QR", ja:"QPay QRで支払う", ko:"QPay QR 결제", fr:"Payer via QPay", de:"Per QPay zahlen", zh:"QPay二维码付款" } },
  { id: "bankapp",  name: { mn:"Банкны Апп", en:"Bank App", ja:"銀行アプリ", ko:"은행 앱", fr:"App Bancaire", de:"Bank App", zh:"银行App" }, icon: "fa-mobile-screen",
    desc: { mn:"Банкны аппаар төлөх", en:"Pay with banking app", ja:"銀行アプリで支払う", ko:"은행 앱으로 결제", fr:"Payer via l'app", de:"Per Bank App zahlen", zh:"通过银行App付款" } },
  { id: "transfer", name: { mn:"Дансаар Шилжүүлэх", en:"Bank Transfer", ja:"銀行振込", ko:"계좌이체", fr:"Virement Bancaire", de:"Banküberweisung", zh:"银行转账" }, icon: "fa-building-columns",
    desc: { mn:"Банкны дансаар шилжүүлэх", en:"Direct bank transfer", ja:"直接振込", ko:"직접 계좌이체", fr:"Virement direct", de:"Direktüberweisung", zh:"直接银行转账" } },
];

const INTL_METHODS = [
  { id: "card",   name: "Credit Card",    icon: "💳", desc: { mn: "Visa, Mastercard", en: "Visa, Mastercard, UnionPay" } },
  { id: "apple",  name: "Apple Pay",      icon: "🍎", desc: { mn: "Apple Pay", en: "Touch / Face ID" } },
  { id: "paypal", name: "PayPal",         icon: "🅿️", desc: { mn: "PayPal", en: "PayPal Balance or Card" } },
];

const BANK_APPS = [
  { id: "khan",     name: "Khan Bank",     nameМн: "Хаан Банк",     icon: "🏦", color: "#0055ff", url: "https://www.khanbank.com" },
  { id: "golomt",   name: "Golomt Bank",   nameМн: "Голомт Банк",   icon: "🟣", color: "#8800ff", url: "https://www.golomtbank.com" },
  { id: "tdb",      name: "TDB",           nameМн: "Худалдаа Хөгжлийн Банк", icon: "🔴", color: "#dd0000", url: "https://www.tdbm.mn" },
  { id: "state",    name: "State Bank",    nameМн: "Төрийн Банк",   icon: "🟢", color: "#00aa44", url: "https://www.statebank.mn" },
  { id: "xac",      name: "XacBank",       nameМн: "Хас Банк",      icon: "⚡", color: "#ff6600", url: "https://www.xacbank.mn" },
  { id: "capitron", name: "Capitron Bank", nameМн: "Капитрон Банк", icon: "💎", color: "#0099cc", url: "https://www.capitronbank.mn" },
];

const TRANSFER_INFO = {
  account: "670005005035680080",
  holder: "T. Buyanbat",
};

export default function PaymentPage() {
  const { isDark, colors, mounted } = useTheme();
  const { data: session } = useSession();
  const userId = session?.user?.id?.slice(-6).toUpperCase() || "GUEST1";
  const { lang } = useLang();
  const { country, formatPrice: fmt, loading: cl } = useCurrency();

  const [dur, setDur]         = useState("3m");
  const [method, setMethod]   = useState("");
  const [bankApp, setBankApp] = useState("");
  const [step, setStep]       = useState<"main"|"qr"|"transfer"|"card">("main");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied]     = useState<string>("");

  if (!mounted) return <div style={{ minHeight:"100vh", background:"#000" }} />;

  const isMN   = country === "MN";
  const selDur = DURATIONS.find(d => d.id === dur)!;
  const base   = PLAN_PRICE * selDur.months;
  const disc   = Math.round(base * selDur.discount / 100);
  const total  = base - disc;
  const methods = isMN ? MN_METHODS : INTL_METHODS;

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    } catch {}
  }

  function fc(v: string) { return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim(); }
  function fe(v: string) { return v.replace(/\D/g,"").slice(0,4).replace(/(.{2})/,"$1/"); }

  async function handlePay() {
    if (!method) return;
    if (method === "qpay") { setStep("qr"); return; }
    if (method === "transfer") { setStep("transfer"); return; }
    if (method === "card") { setStep("card"); return; }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1800));
    setSuccess(true);
    setProcessing(false);
  }

  // ── STYLES ──
  const BG     = isDark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const BORDER = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const BORDER_ACTIVE = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const TEXT   = isDark ? "#ffffff" : "#000000";
  const MUTED  = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.6)";
  const ACCENT = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)";

  const inputSt: React.CSSProperties = {
    width:"100%", height:"44px",
    background: isDark ? "rgba(255,255,255,0.05)" : "#fff",
    border:`1px solid ${BORDER}`,
    borderRadius:"10px", padding:"0 14px",
    color:TEXT, fontSize:"14px", outline:"none",
    boxSizing:"border-box" as const, transition:"border-color 0.2s",
    fontFamily:"inherit",
  };

  if (success) return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"72px", height:"72px", borderRadius:"50%", border:`1px solid ${BORDER_ACTIVE}`, margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", boxShadow:"0 0 40px rgba(255,255,255,0.15)" }}>✓</div>
        <h1 style={{ color:TEXT, fontSize:"24px", fontWeight:800, marginBottom:"8px" }}>{lang==="mn"?"Амжилттай төлөгдлөө":lang==="ja"?"支払い完了":lang==="ko"?"결제 완료":lang==="fr"?"Paiement réussi":lang==="de"?"Zahlung erfolgreich":lang==="zh"?"支付成功":"Payment Successful"}</h1>
        <p style={{ color:MUTED, marginBottom:"6px", fontSize:"14px" }}>AuraLearn Premium · {selDur.label}</p>
        <p style={{ color:MUTED, marginBottom:"28px", fontSize:"13px" }}>{fmt(total)}</p>
        <Link href="/dashboard" style={{ background:TEXT, color:"#000", padding:"12px 32px", borderRadius:"10px", textDecoration:"none", fontWeight:700, fontSize:"14px" }}>
          {lang==="mn"?"Dashboard руу →":lang==="ja"?"ダッシュボードへ →":lang==="ko"?"대시보드로 →":lang==="fr"?"Tableau de bord →":lang==="de"?"Dashboard →":lang==="zh"?"控制台 →":"Go to Dashboard →"}
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:BG, color:TEXT, fontFamily:"'Inter',-apple-system,sans-serif", position:"relative", overflow:"hidden", transition:"background 0.3s, color 0.3s" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        .dur-card:hover { border-color: rgba(128,128,128,0.5) !important; }
        .pay-card:hover { border-color: rgba(128,128,128,0.5) !important; background: rgba(128,128,128,0.06) !important; }
        .pay-btn:hover { opacity: 0.85 !important; transform: translateY(-1px) !important; }
      `}</style>

      {isDark && <div style={{ position:"fixed", top:"-200px", left:"50%", transform:"translateX(-50%)", width:"600px", height:"400px", background:"radial-gradient(ellipse,rgba(255,255,255,0.04) 0%,transparent 70%)", pointerEvents:"none" }} />}

      {/* Header */}
      <div style={{ padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${BORDER}` }}>
        <Link href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"10px" }}>
          <svg width="24" height="24" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="21" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
            <circle cx="22" cy="22" r="16" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <circle cx="22" cy="22" r="11" fill="#fff"/>
            <path d="M22 13 L28 30 L25.5 30 L24.3 26.5 L19.7 26.5 L18.5 30 L16 30 Z M20.5 24 L23.5 24 L22 15 Z" fill="#000"/>
          </svg>
          <span style={{ color:TEXT, fontWeight:800, fontSize:"16px", letterSpacing:"-0.3px" }}>Aura<span style={{ color:MUTED }}>Learn</span></span>
        </Link>
        <div style={{ color:MUTED, fontSize:"12px", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          Premium Subscription
        </div>
      </div>

      <div style={{ maxWidth:"680px", margin:"0 auto", padding:"40px 24px 60px" }}>

        {step === "main" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>

            {/* Title */}
            <div style={{ textAlign:"center", marginBottom:"36px" }}>
              <div style={{ display:"inline-block", background:"rgba(255,255,255,0.06)", border:`1px solid ${BORDER}`, borderRadius:"20px", padding:"4px 14px", fontSize:"11px", color:MUTED, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px" }}>
                AuraLearn Premium
              </div>
              <h1 style={{ color:TEXT, fontSize:"30px", fontWeight:900, letterSpacing:"-1px", marginBottom:"6px" }}>
                {lang==="mn"?"Хугацаагаа сонгоно уу":lang==="ja"?"期間を選択":lang==="ko"?"기간 선택":lang==="fr"?"Choisir la durée":lang==="de"?"Dauer wählen":lang==="zh"?"选择时长":"Select Duration"}
              </h1>
              <p style={{ color:MUTED, fontSize:"13px" }}>
                {lang==="mn"?"Урт хугацааны захиалгаар илүү хэмнэлттэй":lang==="ja"?"長期プランでお得に":lang==="ko"?"장기 구독으로 더 절약":lang==="fr"?"Économisez avec un abonnement long":lang==="de"?"Mehr sparen mit längerem Abo":lang==="zh"?"长期订阅更划算":"Save more with longer subscriptions"}
              </p>
            </div>

            {/* Duration cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"32px" }}>
              {DURATIONS.map(d => {
                const sel = dur === d.id;
                const months = d.months;
                const t = PLAN_PRICE * months - Math.round(PLAN_PRICE * months * d.discount / 100);
                return (
                  <div key={d.id} className="dur-card" onClick={() => setDur(d.id)} style={{
                    background: sel ? "rgba(255,255,255,0.08)" : CARD,
                    border: `1px solid ${sel ? BORDER_ACTIVE : BORDER}`,
                    borderRadius:"14px", padding:"16px 12px", cursor:"pointer",
                    transition:"all 0.2s", position:"relative", textAlign:"center",
                    boxShadow: sel ? "0 0 24px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                  }}>
                    {d.badge && (
                      <div style={{ position:"absolute", top:"-9px", left:"50%", transform:"translateX(-50%)", background: isDark?(d.id==="6m"?"#fff":"rgba(255,255,255,0.15)"):(d.id==="6m"?"#000":"rgba(0,0,0,0.15)"), color: isDark?(d.id==="6m"?"#000":"#fff"):(d.id==="6m"?"#fff":"#000"), fontSize:"8px", fontWeight:800, padding:"2px 8px", borderRadius:"10px", whiteSpace:"nowrap", letterSpacing:"0.05em" }}>
                        {lang==="mn" ? d.badge : d.id==="3m"?"SAVE 10%":d.id==="6m"?"POPULAR":"BEST VALUE"}
                      </div>
                    )}
                    <div style={{ color: sel ? TEXT : MUTED, fontSize:"15px", fontWeight:800, marginBottom:"4px" }}>
                      {lang==="mn" ? d.label : d.labelEn}
                    </div>
                    <div style={{ color: sel ? TEXT : (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.5)"), fontSize:"17px", fontWeight:900 }}>
                      {fmt(t)}
                    </div>
                    <div style={{ color: isDark ? MUTED : "rgba(0,0,0,0.5)", fontSize:"10px", marginTop:"2px" }}>
                      {fmt(Math.round(t/months))}/{lang==="mn"?"сар":lang==="ja"?"ヶ月":lang==="ko"?"개월":"mo"}
                    </div>
                    {d.discount > 0 && (
                      <div style={{ color: isDark ? (sel ? "rgba(255,255,255,0.6)" : MUTED) : "rgba(0,0,0,0.4)", fontSize:"10px", marginTop:"4px", textDecoration:"line-through" }}>
                        {fmt(PLAN_PRICE * months)}
                      </div>
                    )}
                    {sel && (
                      <div style={{ position:"absolute", bottom:"8px", right:"8px", width:"16px", height:"16px", borderRadius:"50%", background:TEXT, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected plan summary */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`, borderRadius:"14px", padding:"18px 20px", marginBottom:"32px", display:"flex", justifyContent:"space-between", alignItems:"center", backdropFilter:"blur(10px)" }}>
              <div>
                <div style={{ color:TEXT, fontWeight:700, fontSize:"15px", marginBottom:"2px", WebkitTextFillColor:TEXT }}>
                  AuraLearn Premium · {lang==="mn" ? selDur.label : lang==="ja" ? selDur.labelEn.replace("Month","ヶ月").replace("Year","年") : lang==="ko" ? selDur.labelEn.replace("Month","개월").replace("Year","년") : selDur.labelEn}
                </div>
                <div style={{ color:isDark?MUTED:"rgba(0,0,0,0.55)", fontSize:"12px", display:"flex", gap:"12px" }}>
                  <span>{lang==="mn"?"Бүх сургалт":lang==="ja"?"全コース":lang==="ko"?"전체 강의":lang==="fr"?"Tous les cours":lang==="de"?"Alle Kurse":lang==="zh"?"所有课程":"All Courses"}</span>
                  <span>·</span>
                  <span>4K</span>
                  <span>·</span>
                  <span>{lang==="mn"?"Гэрчилгээ":lang==="ja"?"修了証":lang==="ko"?"수료증":lang==="fr"?"Certificat":lang==="de"?"Zertifikat":lang==="zh"?"证书":"Certificate"}</span>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                {selDur.discount > 0 && (
                  <div style={{ color:MUTED, fontSize:"11px", textDecoration:"line-through" }}>{fmt(base)}</div>
                )}
                <div style={{ color:TEXT, fontSize:"22px", fontWeight:900 }}>{fmt(total)}</div>
                {selDur.discount > 0 && (
                  <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"10px" }}>-{selDur.discount}% {lang==="mn"?"хөнгөлөлт":"off"}</div>
                )}
              </div>
            </div>

            {/* Payment method title */}
            <div style={{ marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ flex:1, height:"1px", background:isDark?BORDER:"rgba(0,0,0,0.12)" }} />
              <span style={{ color:MUTED, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                {lang==="mn"?"Төлбөрийн хэрэгсэл":lang==="ja"?"お支払い方法":lang==="ko"?"결제 수단":lang==="fr"?"Moyen de paiement":lang==="de"?"Zahlungsmethode":lang==="zh"?"支付方式":"Payment Method"}
              </span>
              <div style={{ flex:1, height:"1px", background:isDark?BORDER:"rgba(0,0,0,0.12)" }} />
            </div>

            {/* Payment method cards — horizontal */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"28px" }}>
              {methods.map(m => {
                const sel = method === m.id;
                return (
                  <div key={m.id} className="pay-card" onClick={() => { setMethod(m.id); setBankApp(""); }} style={{
                    background: sel ? "rgba(255,255,255,0.08)" : CARD,
                    border: `1px solid ${sel ? BORDER_ACTIVE : BORDER}`,
                    borderRadius:"14px", padding:"18px 14px", cursor:"pointer",
                    transition:"all 0.2s", textAlign:"center",
                    boxShadow: sel ? "0 0 20px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
                  }}>
                    <div style={{ width:"42px", height:"42px", borderRadius:"10px", marginBottom:"8px", background:sel?(isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.1)"):(isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"), display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                      <i className={`${["fa-apple","fa-paypal"].includes(m.icon)?"fa-brands":"fa-solid"} ${m.icon} fa-fw`} style={{ fontSize:"18px", color: sel ? TEXT : (isDark?"rgba(255,255,255,0.7)":"rgba(0,0,0,0.6)") }} />
                    </div>
                    <div style={{ color: TEXT, fontSize:"13px", fontWeight:700, marginBottom:"3px" }}>{typeof (m.name)==="string"?(m.name as string):((m.name as any)[lang]||(m.name as any).en)}</div>
                    <div style={{ color:isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.6)", fontSize:"10px", lineHeight:1.3 }}>{typeof m.desc==="string"?m.desc:(m.desc as any)[lang]||(m.desc as any).en}</div>
                    {sel && (
                      <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:isDark?"#fff":"#000", margin:"8px auto 0", boxShadow:isDark?"0 0 8px rgba(255,255,255,0.6)":"0 0 8px rgba(0,0,0,0.3)", animation:"pulse 1.5s ease-in-out infinite" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bank app selector — expanded inside card */}
            {isMN && method === "bankapp" && (
              <div style={{ marginBottom:"16px", animation:"fadeUp 0.25s ease", background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)", border:`1px solid ${BORDER}`, borderRadius:"12px", padding:"14px", backdropFilter:"blur(12px)" }}>
                <div style={{ fontSize:"10px", color:MUTED, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"12px" }}>
                  {lang==="mn"?"Банкаа сонгоно уу":lang==="ja"?"銀行を選択":lang==="ko"?"은행 선택":lang==="fr"?"Choisir une banque":lang==="de"?"Bank auswählen":lang==="zh"?"选择银行":"Select Your Bank"}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {BANK_APPS.map(b => {
                    const sel = bankApp === b.id;
                    return (
                      <div key={b.id} onClick={() => setBankApp(b.id)} style={{
                        display:"flex", alignItems:"center", gap:"12px",
                        padding:"10px 12px", borderRadius:"10px", cursor:"pointer",
                        background: sel ? (isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)") : "transparent",
                        border: `1px solid ${sel ? BORDER_ACTIVE : "rgba(255,255,255,0.06)"}`,
                        transition:"all 0.15s",
                        boxShadow: sel ? "0 0 12px rgba(255,255,255,0.06)" : "none",
                      }}
                      onMouseEnter={e => { if (!sel) { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}}
                      onMouseLeave={e => { if (!sel) { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}}>
                        <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:`${b.color}22`, border:`1px solid ${b.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", flexShrink:0 }}>
                          {b.icon}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ color: sel ? TEXT : (isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"), fontSize:"13px", fontWeight: sel ? 700 : 500 }}>
{lang==="mn" ? b.nameМн : lang==="ja" ? b.name : lang==="ko" ? b.nameМн : lang==="fr" ? b.name : lang==="de" ? b.name : lang==="zh" ? b.nameМн : b.name}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                          {sel && (
                            <a href={b.url} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ background:"rgba(255,255,255,0.1)", border:`1px solid ${BORDER}`, borderRadius:"6px", padding:"3px 8px", color:MUTED, fontSize:"10px", textDecoration:"none", transition:"all 0.15s", whiteSpace:"nowrap" }}
                              onMouseEnter={e => { e.currentTarget.style.color=TEXT; e.currentTarget.style.borderColor=BORDER_ACTIVE; }}
                              onMouseLeave={e => { e.currentTarget.style.color=MUTED; e.currentTarget.style.borderColor=BORDER; }}>
                              {lang==="mn" ? "Сайт ↗" : "Site ↗"}
                            </a>
                          )}
                          {sel && (
                            <div style={{ width:"16px", height:"16px", borderRadius:"50%", background:TEXT, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pay button */}
            <button className="pay-btn" onClick={handlePay} disabled={!method || (method==="bankapp"&&!bankApp) || processing} style={{
              width:"100%", height:"52px",
              background: method ? TEXT : (isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"),
              color: method ? BG : (isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.4)"),
              border:`1px solid ${method?TEXT:BORDER}`,
              borderRadius:"12px", fontSize:"15px", fontWeight:800,
              cursor: method ? "pointer" : "not-allowed",
              letterSpacing:"-0.2px", transition:"all 0.2s",
              boxShadow: method ? "0 0 32px rgba(255,255,255,0.12)" : "none",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
            }}>
              {processing
                ? <><svg style={{animation:"spin 0.8s linear infinite"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Боловсруулж байна...</>
                : method
                  ? `${(()=>{const m=methods.find(x=>x.id===method);const n=m?.name;return typeof n==="string"?n:(n as any)?.[lang]||(n as any)?.en||"";})()}${method==="bankapp"&&bankApp?` — ${BANK_APPS.find(b=>b.id===bankApp)?.nameМн||bankApp}`:""}${method==="transfer"?` — ${lang==="mn"?"Баталгаажуулах":"Confirm"}`:""} — ${fmt(total)}`
                  : (lang==="mn" ? "Хэрэгсэл сонгоно уу" : "Select payment method")
              }
            </button>

            <p style={{ textAlign:"center", color:isDark?"rgba(255,255,255,0.3)":"rgba(0,0,0,0.5)", fontSize:"11px", marginTop:"12px" }}>
              🔒 256-bit SSL · {lang==="mn"?"Шифрлэгдсэн":"Encrypted"} · PCI DSS
            </p>
          </div>
        )}

        {/* QR step */}
        {step === "qr" && (
          <div style={{ maxWidth:"360px", margin:"0 auto", textAlign:"center", animation:"fadeUp 0.3s ease" }}>
            <button onClick={()=>setStep("main")} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", marginBottom:"24px", fontSize:"13px", display:"flex", alignItems:"center", gap:"4px", padding:0 }}>← {lang==="mn"?"Буцах":lang==="ja"?"戻る":lang==="ko"?"뒤로":lang==="fr"?"Retour":lang==="de"?"Zurück":lang==="zh"?"返回":"Back"}</button>
            <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`, borderRadius:"20px", padding:"32px 24px" }}>
              <div style={{ fontSize:"13px", color:MUTED, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px" }}>
                {method==="qpay" ? "QPay" : bankApp || "Банкны Апп"}
              </div>
              <div style={{ color:TEXT, fontSize:"22px", fontWeight:900, marginBottom:"24px" }}>{fmt(total)}</div>
              {/* QR */}
              <div style={{ width:"180px", height:"180px", margin:"0 auto 20px", background:"#fff", padding:"12px", borderRadius:"12px", display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:"2px", boxShadow:"0 0 40px rgba(255,255,255,0.1)" }}>
                {Array.from({length:100}).map((_,i)=>(
                  <div key={i} style={{ background:[0,1,2,3,4,5,6,10,16,20,26,30,36,37,38,39,40,41,42,60,66,70,76,80,81,82,83,84,85,86,97,99,44,54,45,55,50,51].includes(i)||Math.random()>0.5?"#111":"#fff", borderRadius:"1px" }} />
                ))}
              </div>
              <div style={{ color:MUTED, fontSize:"12px", marginBottom:"20px" }}>
                {lang==="mn"?"QR кодыг уншуулж төлнө үү":lang==="ja"?"QRコードをスキャン":lang==="ko"?"QR코드 스캔":lang==="fr"?"Scanner pour payer":lang==="de"?"QR scannen":lang==="zh"?"扫码付款":"Scan to pay"}
              </div>
              <button onClick={()=>setSuccess(true)} style={{ background:TEXT, color:"#000", border:"none", padding:"11px 32px", borderRadius:"10px", fontWeight:800, fontSize:"14px", cursor:"pointer" }}>
                ✓ {lang==="mn"?"Төлсөн":lang==="ja"?"支払い完了":lang==="ko"?"결제 완료":lang==="fr"?"Confirmer":lang==="de"?"Bestätigen":lang==="zh"?"确认支付":"Confirm Payment"}
              </button>
            </div>
          </div>
        )}

        {/* Transfer step */}
        {step === "transfer" && (
          <div style={{ maxWidth:"440px", margin:"0 auto", animation:"fadeUp 0.3s ease" }}>
            <button onClick={()=>setStep("main")} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", marginBottom:"20px", fontSize:"13px", display:"flex", alignItems:"center", gap:"4px", padding:0 }}>← {lang==="mn"?"Буцах":lang==="ja"?"戻る":lang==="ko"?"뒤로":lang==="fr"?"Retour":lang==="de"?"Zurück":lang==="zh"?"返回":"Back"}</button>
            <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`, borderRadius:"18px", padding:"24px 22px", backdropFilter:"blur(16px)", boxShadow:"0 0 40px rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize:"10px", color:MUTED, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"18px" }}>
                {lang==="mn" ? "🏦 Дансаар Шилжүүлэх" : "🏦 Bank Transfer"}
              </div>
              {[
                { key:"account", label: lang==="mn"?"Дансны дугаар":lang==="ja"?"口座番号":lang==="ko"?"계좌번호":lang==="fr"?"Numéro de compte":lang==="de"?"Kontonummer":lang==="zh"?"账号":"Account Number", value: TRANSFER_INFO.account, copy: true },
                { key:"holder",  label: lang==="mn"?"Хүлээн авагч":lang==="ja"?"口座名義":lang==="ko"?"예금주":lang==="fr"?"Titulaire":lang==="de"?"Kontoinhaber":lang==="zh"?"户主":"Account Holder",  value: TRANSFER_INFO.holder, copy: true },
                { key:"ref",     label: lang==="mn"?"Гүйлгээний утга":lang==="ja"?"振込メモ":lang==="ko"?"이체 메모":lang==="fr"?"Référence":lang==="de"?"Verwendungszweck":lang==="zh"?"转账备注":"Reference",     value: userId, copy: true },
                { key:"amount",  label: lang==="mn"?"Дүн":lang==="ja"?"金額":lang==="ko"?"금액":lang==="fr"?"Montant":lang==="de"?"Betrag":lang==="zh"?"金额":"Amount",                    value: fmt(total), copy: false },
              ].map(f => (
                <div key={f.key} style={{ padding:"12px 0", borderBottom:`1px solid rgba(255,255,255,0.05)`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ color:MUTED, fontSize:"10px", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"3px" }}>{f.label}</div>
                    <div style={{ color:TEXT, fontSize:"14px", fontWeight:700, fontFamily:"'SF Mono','Fira Code',monospace", letterSpacing: f.key==="account"?"0.05em":"normal" }}>{f.value}</div>
                  </div>
                  {f.copy && (
                    <button onClick={() => copyText(f.value, f.key)} style={{
                      background: copied===f.key ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${copied===f.key ? BORDER_ACTIVE : BORDER}`,
                      borderRadius:"8px", padding:"5px 10px", cursor:"pointer",
                      color: copied===f.key ? TEXT : MUTED, fontSize:"11px", fontWeight:600,
                      transition:"all 0.2s", display:"flex", alignItems:"center", gap:"4px",
                    }}>
                      {copied===f.key
                        ? <><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>{lang==="mn"?"Хуулагдлаа":"Copied!"}</>
                        : <><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x="4" y="1" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="3" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>{lang==="mn"?"Хуулах":"Copy"}</>
                      }
                    </button>
                  )}
                </div>
              ))}
              <div style={{ marginTop:"16px", padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", border:`1px solid ${BORDER}` }}>
                <div style={{ color:MUTED, fontSize:"11px", lineHeight:1.5 }}>
                  ⏱ {lang==="mn" ? "Төлбөр баталгаажихад 1-5 минут шаардлагатай." : "After payment, confirmation may take 1-5 minutes."}
                </div>
              </div>
              <button onClick={()=>setSuccess(true)} style={{ width:"100%", height:"46px", marginTop:"16px", background:TEXT, color:"#000", border:"none", borderRadius:"10px", fontWeight:800, fontSize:"14px", cursor:"pointer", boxShadow:"0 0 24px rgba(255,255,255,0.1)", transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.opacity="0.9";}}
                onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>
                {lang==="mn"?"Төлсөн баталгаажуулах ✓":lang==="ja"?"振込確認 ✓":lang==="ko"?"이체 확인 ✓":lang==="fr"?"Confirmer ✓":lang==="de"?"Bestätigen ✓":lang==="zh"?"确认转账 ✓":"Confirm Transfer ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Card step */}
        {step === "card" && (
          <div style={{ maxWidth:"400px", margin:"0 auto", animation:"fadeUp 0.3s ease" }}>
            <button onClick={()=>setStep("main")} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", marginBottom:"24px", fontSize:"13px", display:"flex", alignItems:"center", gap:"4px", padding:0 }}>← {lang==="mn"?"Буцах":lang==="ja"?"戻る":lang==="ko"?"뒤로":lang==="fr"?"Retour":lang==="de"?"Zurück":lang==="zh"?"返回":"Back"}</button>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div>
                <label style={{ fontSize:"11px", color:MUTED, display:"block", marginBottom:"5px", letterSpacing:"0.06em", textTransform:"uppercase" }}>Card Number</label>
                <input value={cardNum} onChange={e=>setCardNum(fc(e.target.value))} placeholder="1234 5678 9012 3456" style={inputSt}
                  onFocus={e=>e.target.style.borderColor=BORDER_ACTIVE} onBlur={e=>e.target.style.borderColor=BORDER} />
              </div>
              <div>
                <label style={{ fontSize:"11px", color:MUTED, display:"block", marginBottom:"5px", letterSpacing:"0.06em", textTransform:"uppercase" }}>Cardholder</label>
                <input value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="Full name" style={inputSt}
                  onFocus={e=>e.target.style.borderColor=BORDER_ACTIVE} onBlur={e=>e.target.style.borderColor=BORDER} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div>
                  <label style={{ fontSize:"11px", color:MUTED, display:"block", marginBottom:"5px", letterSpacing:"0.06em", textTransform:"uppercase" }}>Expiry</label>
                  <input value={expiry} onChange={e=>setExpiry(fe(e.target.value))} placeholder="MM/YY" style={inputSt}
                    onFocus={e=>e.target.style.borderColor=BORDER_ACTIVE} onBlur={e=>e.target.style.borderColor=BORDER} />
                </div>
                <div>
                  <label style={{ fontSize:"11px", color:MUTED, display:"block", marginBottom:"5px", letterSpacing:"0.06em", textTransform:"uppercase" }}>CVV</label>
                  <input value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="123" type="password" style={inputSt}
                    onFocus={e=>e.target.style.borderColor=BORDER_ACTIVE} onBlur={e=>e.target.style.borderColor=BORDER} />
                </div>
              </div>
              <button onClick={async()=>{setProcessing(true);await new Promise(r=>setTimeout(r,1800));setSuccess(true);}} disabled={!cardNum||!cardName||!expiry||!cvv||processing} style={{
                height:"50px", background:TEXT, color:"#000", border:"none", borderRadius:"10px",
                fontWeight:800, fontSize:"14px", cursor:"pointer", marginTop:"4px",
                boxShadow:"0 0 28px rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
              }}>
                {processing
                  ? <><svg style={{animation:"spin 0.8s linear infinite"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Processing...</>
                  : `🔒 Pay ${fmt(total)}`
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
