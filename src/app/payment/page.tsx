"use client";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PaymentPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const { data: session } = useSession();

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  if(!mounted) return <div style={{minHeight:"100vh",background:"#F2F0EB"}}/>;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const HOVER = isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  const FEATURES = [
    { icon:"fa-graduation-cap", title:t("Бүх сургалт","All courses","全コース","모든 강의","Tous les cours","Alle Kurse","所有课程"), desc:t("Бүх сургалтыг захиалгагүйгээр үзнэ","Unlimited access to all courses","全コース無制限視聴","모든 강의 무제한 수강","Accès illimité à tous les cours","Unbegrenzter Zugang zu allen Kursen","无限制访问所有课程") },
    { icon:"fa-tower-broadcast", title:t("Шууд хичээл","Live classes","ライブ授業","라이브 클래스","Cours en direct","Live-Unterricht","直播课程"), desc:t("Шууд явагдаж буй хичээлд нэгдэх","Join live streaming classes","ライブ授業への参加","라이브 수업 참여","Rejoindre les cours en direct","Live-Unterricht beitreten","参加直播课程") },
    { icon:"fa-robot", title:t("AI туслагч","AI assistant","AIアシスタント","AI 어시스턴트","Assistant IA","KI-Assistent","AI助手"), desc:t("Chat, Quiz Generator, Зөвлөгөө","Chat, Quiz Generator, Recommendations","チャット、クイズ、おすすめ","채팅, 퀴즈, 추천","Chat, Quiz, Recommandations","Chat, Quiz, Empfehlungen","聊天、测验、推荐") },
    { icon:"fa-certificate", title:t("Гэрчилгээ","Certificates","証明書","수료증","Certificats","Zertifikate","证书"), desc:t("Сургалт дүүргэснийхээ гэрчилгээ авах","Earn certificates upon completion","修了証明書の取得","수료증 발급","Obtenez des certificats","Zertifikate erhalten","获得完成证书") },
    { icon:"fa-language", title:t("7 хэл","7 languages","7言語","7개 언어","7 langues","7 Sprachen","7种语言"), desc:t("Монгол, Англи, Япон, Солонгос болон бусад","Mongolian, English, Japanese, Korean and more","モンゴル語、英語、日本語、韓国語など","몽골어, 영어, 일본어, 한국어 등","Mongol, Anglais, Japonais, Coréen et plus","Mongolisch, Englisch, Japanisch, Koreanisch","蒙古语、英语、日语、韩语等") },
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"0 clamp(24px,5vw,48px)"}}>

        {/* Header */}
        <div style={{padding:"clamp(40px,6vw,56px) 0 40px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"48px",alignItems:"end"}} className="pay-header">
            <div>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"10px"}}>
                {t("Захиалга","Subscription","サブスクリプション","구독","Abonnement","Abonnement","订阅")}
              </div>
              <h1 style={{fontSize:"clamp(28px,4vw,38px)",fontWeight:300,color:TEXT,letterSpacing:"-1.5px",lineHeight:1.1,marginBottom:"12px"}}>
                {t("Premium эрх авах","Get Premium access","プレミアム取得","프리미엄 이용하기","Accéder à Premium","Premium erhalten","获取高级权限")}
              </h1>
              <p style={{fontSize:"13px",color:MUTED,fontWeight:300,lineHeight:1.7,maxWidth:"320px"}}>
                {t("Нэг захиалгаар бүх сургалт, шууд хичээл, AI туслагчид хандах боломж.","One subscription unlocks all courses, live classes and AI tools.","一括で全コース・ライブ・AIにアクセス。","하나의 구독으로 모든 강의, 라이브, AI 이용.","Un abonnement pour tout débloquer.","Ein Abo für alles.","一个订阅，解锁所有功能。")}
              </p>
            </div>
            <div>
              <div style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,marginBottom:"10px"}}>
                {t("Сарын төлбөр","Monthly price","月額料金","월 요금","Prix mensuel","Monatlicher Preis","月费")}
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"6px"}}>
                <span style={{fontSize:"clamp(36px,5vw,48px)",fontWeight:300,color:TEXT,letterSpacing:"-2px"}}>₮29,900</span>
                <span style={{fontSize:"13px",color:MUTED,fontWeight:300}}>/ {t("сар","mo","月","월","mois","Mo.","月")}</span>
              </div>
              <div style={{fontSize:"11px",color:MUTED,fontWeight:300}}>
                {t("Хэдийд ч цуцлах боломжтой","Cancel anytime","いつでもキャンセル可","언제든 취소 가능","Annulable à tout moment","Jederzeit kündbar","随时可取消")}
              </div>
            </div>
          </div>
        </div>

        {/* Features list */}
        <div style={{padding:"32px 0",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
            {t("Багтсан зүйлс","What's included","含まれるもの","포함된 항목","Ce qui est inclus","Was enthalten ist","包含内容")}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0"}} className="features-pay">
            {FEATURES.map((f,i)=>(
              <div key={i} style={{
                display:"flex",gap:"14px",alignItems:"flex-start",
                padding:"16px 0",
                borderBottom:`1px solid ${RULE}`,
                paddingRight:i%2===0?"32px":"0",
                paddingLeft:i%2===1?"32px":"0",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:"32px",height:"32px",borderRadius:"6px",background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"2px"}}>
                  <i className={`fa-solid ${f.icon}`} style={{fontSize:"13px",color:MUTED}}/>
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:400,color:TEXT,marginBottom:"3px",letterSpacing:"-0.2px"}}>{f.title}</div>
                  <div style={{fontSize:"11px",color:MUTED,fontWeight:300,lineHeight:1.6}}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{padding:"32px 0 clamp(32px,5vw,48px)",display:"grid",gridTemplateColumns:"1fr auto",gap:"24px",alignItems:"center"}} className="pay-cta">
          <div style={{fontSize:"12px",color:MUTED,fontWeight:300,lineHeight:1.6}}>
            {t("Одоогоор Stripe холбоогүй. Дараа нэмэгдэнэ.","Stripe integration coming soon. Contact admin to upgrade your account.","Stripe近日対応予定。管理者に連絡してアップグレード。","Stripe 연동 예정. 관리자에게 업그레이드 문의.","Stripe bientôt disponible. Contactez l'admin.","Stripe kommt bald. Admin kontaktieren.","Stripe即将推出。联系管理员升级账户。")}
          </div>
          <div style={{display:"flex",gap:"10px",flexShrink:0}}>
            {session?(
              <button style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,border:"none",cursor:"not-allowed",borderRadius:"100px",fontFamily:"inherit",opacity:0.6}}>
                {t("Удахгүй","Coming soon","近日公開","곧 출시","Bientôt","Bald verfügbar","即将推出")}
              </button>
            ):(
              <>
                <Link href="/auth/register" style={{padding:"10px 24px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",textDecoration:"none",whiteSpace:"nowrap" as const}}>
                  {t("Бүртгүүлэх","Get started","始める","시작하기","Commencer","Loslegen","开始")}
                </Link>
                <Link href="/auth/login" style={{padding:"10px 20px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",borderRadius:"100px",textDecoration:"none",whiteSpace:"nowrap" as const}}>
                  {t("Нэвтрэх","Sign in","ログイン","로그인","Se connecter","Anmelden","登录")}
                </Link>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${RULE}`,padding:"16px clamp(24px,5vw,48px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
        <Link href="/courses" style={{fontSize:"11px",color:MUTED,textDecoration:"none"}}>
          ← {t("Сургалтууд руу буцах","Back to courses","コースに戻る","강의로 돌아가기","Retour aux cours","Zurück zu Kurse","返回课程")}
        </Link>
        <span style={{fontSize:"11px",color:MUTED}}>AuraLearn · SW25-1 · Т.Буянбат</span>
      </div>

      <style>{`
        @media(max-width:640px){
          .pay-header{grid-template-columns:1fr!important;gap:24px!important;}
          .features-pay{grid-template-columns:1fr!important;}
          .features-pay>div{padding-left:0!important;padding-right:0!important;}
          .pay-cta{grid-template-columns:1fr!important;}
          .pay-cta>div:last-child{flex-direction:column!important;}
          .pay-cta a,.pay-cta button{width:100%!important;text-align:center!important;justify-content:center!important;}
        }
      `}</style>
    </div>
  );
}
