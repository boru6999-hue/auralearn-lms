"use client";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCurrency } from "@/hooks/useCurrency";

export default function PaymentPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const { data: session } = useSession();
  const { currency, formatPrice } = useCurrency();

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  // Base price in USD (~$8.67)
  const BASE_USD = 8.67;
  const formattedPrice = formatPrice(BASE_USD);

  const BANKS = [
    { name:"Khan Bank",    logo:"🏦", color:"#1a5fb4", account:"5000 1234 5678" },
    { name:"Golomt Bank",  logo:"🏦", color:"#c0392b", account:"1234 5678 9012" },
    { name:"TDB Bank",     logo:"🏦", color:"#27ae60", account:"9876 5432 1098" },
    { name:"XacBank",      logo:"🏦", color:"#8e44ad", account:"4567 8901 2345" },
  ];

  if(!mounted) return <div style={{minHeight:"100vh",background:"#F2F0EB"}}/>;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const CARD  = isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)";
  const HOVER = isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  const FEATURES = [
    { icon:"fa-graduation-cap", title:t("Бүх сургалт","All courses","全コース","모든 강의","Tous les cours","Alle Kurse","所有课程"), desc:t("100+ сургалт захиалгагүй үзнэ","Unlimited access to 100+ courses","100以上のコース","100개 이상 강의","100+ cours sans limite","100+ Kurse unbegrenzt","100+课程无限制") },
    { icon:"fa-tower-broadcast", title:t("Шууд хичээл","Live classes","ライブ授業","라이브 클래스","Cours en direct","Live-Unterricht","直播课"), desc:t("Admin-ийн шууд хичээлд нэгдэх","Join live streaming classes","ライブ授業に参加","라이브 수업 참여","Rejoindre les cours en direct","Live-Unterricht beitreten","参加直播课") },
    { icon:"fa-robot", title:t("AI туслагч","AI assistant","AIアシスタント","AI 어시스턴트","Assistant IA","KI-Assistent","AI助手"), desc:t("Gemini Chat, Quiz, Зөвлөгөө","Gemini Chat, Quiz, Recommendations","チャット・クイズ・おすすめ","채팅, 퀴즈, 추천","Chat, Quiz, Recommandations","Chat, Quiz, Empfehlungen","聊天、测验、推荐") },
    { icon:"fa-certificate", title:t("Гэрчилгээ","Certificates","証明書","수료증","Certificats","Zertifikate","证书"), desc:t("Сургалт дүүргэснийхээ гэрчилгээ","Earn certificates upon completion","修了証明書","수료증 발급","Certificats à la fin","Zertifikate bei Abschluss","完成后获得证书") },
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"860px",margin:"0 auto",padding:"0 clamp(20px,5vw,48px)"}}>

        {/* Header */}
        <div style={{padding:"clamp(36px,6vw,56px) 0 36px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"10px"}}>
            {t("Захиалга","Subscription","サブスクリプション","구독","Abonnement","Abonnement","订阅")}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"24px",alignItems:"flex-end"}} className="pay-top">
            <div>
              <h1 style={{fontSize:"clamp(26px,4vw,36px)",fontWeight:300,color:TEXT,letterSpacing:"-1.5px",lineHeight:1.1,marginBottom:"10px"}}>
                {t("Premium эрх авах","Get Premium access","プレミアム取得","프리미엄 이용","Accéder à Premium","Premium erhalten","获取高级权限")}
              </h1>
              <p style={{fontSize:"13px",color:MUTED,fontWeight:300,lineHeight:1.7}}>
                {t("Бүх сургалт, шууд хичээл, AI туслагч — нэг захиалгаар.","All courses, live classes, AI tools — one subscription.","全コース・ライブ・AIが一括で。","모든 강의, 라이브, AI — 하나의 구독.","Tout inclus en un abonnement.","Alles in einem Abo.","一个订阅包含所有功能。")}
              </p>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"clamp(32px,5vw,44px)",fontWeight:300,color:TEXT,letterSpacing:"-2px",lineHeight:1}}>
                {formattedPrice}
              </div>
              <div style={{fontSize:"11px",color:MUTED,marginTop:"4px"}}>
                / {t("сар","month","月","월","mois","Monat","月")} · {t("хэдийд ч цуцлах","cancel anytime","いつでもキャンセル","언제든 취소","annulable","jederzeit kündbar","随时可取消")}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{padding:"28px 0",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
            {t("Багтсан зүйлс","What's included","含まれるもの","포함된 항목","Ce qui est inclus","Was enthalten ist","包含内容")}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0"}} className="feat-grid">
            {FEATURES.map((f,i)=>(
              <div key={i} style={{
                display:"flex",gap:"14px",alignItems:"flex-start",
                padding:"14px 0",
                borderBottom:`1px solid ${RULE}`,
                paddingRight:i%2===0?"28px":"0",
                paddingLeft:i%2===1?"28px":"0",
              }}>
                <div style={{width:"30px",height:"30px",borderRadius:"6px",background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px"}}>
                  <i className={`fa-solid ${f.icon}`} style={{fontSize:"12px",color:MUTED}}/>
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:400,color:TEXT,marginBottom:"2px"}}>{f.title}</div>
                  <div style={{fontSize:"11px",color:MUTED,fontWeight:300,lineHeight:1.6}}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank transfer */}
        <div style={{padding:"28px 0",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
            {t("Банкны шилжүүлэг","Bank transfer","銀行振込","계좌 이체","Virement bancaire","Banküberweisung","银行转账")}
          </div>
          <p style={{fontSize:"12px",color:MUTED,fontWeight:300,marginBottom:"20px",lineHeight:1.7}}>
            {t(
              "Доорх банкны дансуудын аль нэгэнд шилжүүлэг хийгээд, гүйлгээний утгад таны имэйл хаягийг бичнэ үү. Төлбөр баталгаажсаны дараа таны эрх идэвхжинэ.",
              "Transfer to any of the accounts below. Include your email in the transaction note. Your access will be activated after payment is confirmed.",
              "下記口座に振り込み、メモに메ールアドレスを記入してください。確認後にアクセスが有効になります。",
              "아래 계좌 중 하나로 이체하고, 메모에 이메일을 입력하세요. 확인 후 이용 가능합니다.",
              "Effectuez un virement vers l'un des comptes ci-dessous avec votre email en note. Accès activé après confirmation.",
              "Überweisen Sie auf eines der folgenden Konten. Geben Sie Ihre E-Mail in den Verwendungszweck an.",
              "转账至以下账户之一，备注中填写您的邮箱。确认后激活访问权限。"
            )}
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:RULE}} className="banks-grid">
            {BANKS.map((b,i)=>(
              <div key={i} style={{background:BG,padding:"16px 20px",display:"flex",alignItems:"center",gap:"14px",cursor:"pointer",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.8)"}
                onMouseLeave={e=>e.currentTarget.style.background=BG}>
                <div style={{width:"36px",height:"36px",borderRadius:"8px",background:b.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>
                  🏦
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:400,color:TEXT,marginBottom:"2px"}}>{b.name}</div>
                  <div style={{fontSize:"11px",color:MUTED,fontFamily:"monospace",letterSpacing:"0.05em"}}>{b.account}</div>
                </div>
                <button onClick={()=>navigator.clipboard?.writeText(b.account.replace(/\s/g,""))}
                  style={{marginLeft:"auto",background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"11px",padding:"4px",fontFamily:"inherit"}}>
                  <i className="fa-regular fa-copy"/>
                </button>
              </div>
            ))}
          </div>
          <div style={{marginTop:"16px",padding:"14px 16px",background:isDark?"rgba(181,134,58,0.06)":"rgba(181,134,58,0.08)",border:`1px solid rgba(181,134,58,0.2)`,display:"flex",gap:"10px",alignItems:"flex-start"}}>
            <i className="fa-solid fa-circle-info" style={{color:"#B5863A",fontSize:"13px",marginTop:"1px",flexShrink:0}}/>
            <div style={{fontSize:"12px",color:MUTED,fontWeight:300,lineHeight:1.6}}>
              {t(
                `Шилжүүлгийн дүн: ${formattedPrice} · Гүйлгээний утга: таны имэйл · Баталгаажсаны дараа 24 цагийн дотор эрх идэвхжинэ.`,
                `Amount: ${formattedPrice} · Note: your email address · Access activated within 24 hours of confirmation.`,
                `金額: ${formattedPrice} · メモ: メールアドレス · 確認後24時間以内に有効化。`,
                `금액: ${formattedPrice} · 메모: 이메일 주소 · 확인 후 24시간 내 활성화.`,
                `Montant: ${formattedPrice} · Note: votre email · Activé dans les 24h.`,
                `Betrag: ${formattedPrice} · Verwendungszweck: Ihre E-Mail · Aktivierung innerhalb 24h.`,
                `金额: ${formattedPrice} · 备注: 您的邮箱 · 确认后24小时内激活。`
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{padding:"28px 0 clamp(32px,5vw,48px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"16px"}}>
          <Link href="/courses" style={{fontSize:"12px",color:MUTED,textDecoration:"none",display:"flex",alignItems:"center",gap:"5px"}}>
            <i className="fa-solid fa-arrow-left" style={{fontSize:"10px"}}/>
            {t("Сургалтууд руу буцах","Back to courses","コースに戻る","강의로 돌아가기","Retour aux cours","Zurück","返回课程")}
          </Link>
          {!session&&(
            <div style={{display:"flex",gap:"10px"}}>
              <Link href="/auth/register" style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",textDecoration:"none"}}>
                {t("Бүртгүүлэх","Register","登録","회원가입","S'inscrire","Registrieren","注册")}
              </Link>
              <Link href="/auth/login" style={{padding:"10px 20px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",borderRadius:"100px",textDecoration:"none"}}>
                {t("Нэвтрэх","Sign in","ログイン","로그인","Connexion","Anmelden","登录")}
              </Link>
            </div>
          )}
          {session&&(
            <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>
              {t("Төлбөр хийсний дараа admin-д хандана уу.","Contact admin after payment to activate your account.","支払い後、管理者にお問い合わせください。","결제 후 관리자에게 문의하세요.","Contactez l'admin après le paiement.","Nach der Zahlung Admin kontaktieren.","付款后联系管理员激活账户。")}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:600px){
          .pay-top{grid-template-columns:1fr!important;text-align:left!important;}
          .pay-top>div:last-child{text-align:left!important;}
          .feat-grid{grid-template-columns:1fr!important;}
          .feat-grid>div{padding-left:0!important;padding-right:0!important;}
          .banks-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
