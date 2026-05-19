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

  const FEATURES = [
    t("Бүх сургалт үнэгүй","All courses unlocked","全コース無料","모든 강의 무료","Tous les cours gratuits","Alle Kurse kostenlos","所有课程免费"),
    t("Шууд хичээлд нэгдэх","Join live classes","ライブ授業参加","라이브 클래스 참여","Cours en direct","Live-Unterricht","参加直播课"),
    t("AI Chat, Quiz, Зөвлөгөө","AI Chat, Quiz, Recommendations","AIチャット・クイズ","AI 채팅, 퀴즈, 추천","Chat IA, Quiz, Recommandations","KI-Chat, Quiz, Empfehlungen","AI聊天、测验、推荐"),
    t("Гэрчилгээ авах","Earn certificates","証明書取得","수료증 발급","Obtenir des certificats","Zertifikate erhalten","获取证书"),
    t("7 хэлийн дэмжлэг","7 language support","7言語サポート","7개 언어 지원","Support 7 langues","7-Sprachen-Support","7种语言支持"),
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:"480px"}}>

        <Link href="/" style={{display:"flex",alignItems:"center",gap:"8px",textDecoration:"none",marginBottom:"48px"}}>
          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:TEXT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:isDark?"#000":"#fff"}}>A</div>
          <span style={{fontSize:"14px",fontWeight:600,color:TEXT}}>AuraLearn</span>
        </Link>

        <div style={{marginBottom:"40px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"8px"}}>
            {t("Захиалга","Subscription","サブスクリプション","구독","Abonnement","Abonnement","订阅")}
          </div>
          <h1 style={{fontSize:"28px",fontWeight:300,color:TEXT,letterSpacing:"-1px",marginBottom:"6px"}}>
            {t("Premium эрх авах","Get Premium access","プレミアムを取得","프리미엄 이용","Obtenir Premium","Premium erhalten","获取高级权限")}
          </h1>
          <p style={{fontSize:"13px",color:MUTED,fontWeight:300}}>
            {t("Нэг удаагийн төлбөр — бүх сургалтад хандах эрх","One payment — full access to all courses","一括払いで全コースにアクセス","일회 결제로 모든 강의 이용","Paiement unique — accès complet","Einmalzahlung — voller Zugang","一次付款，全部课程访问")}
          </p>
        </div>

        {/* Price */}
        <div style={{padding:"28px 0",borderTop:`1px solid ${RULE}`,borderBottom:`1px solid ${RULE}`,marginBottom:"32px"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"4px"}}>
            <span style={{fontSize:"42px",fontWeight:300,color:TEXT,letterSpacing:"-2px"}}>₮29,900</span>
            <span style={{fontSize:"13px",color:MUTED,fontWeight:300}}>/ {t("сар","month","月","월","mois","Monat","月")}</span>
          </div>
          <div style={{fontSize:"11px",color:MUTED}}>
            {t("Хэдийд ч цуцлах боломжтой","Cancel anytime","いつでもキャンセル可","언제든 취소 가능","Annulable à tout moment","Jederzeit kündbar","随时可取消")}
          </div>
        </div>

        {/* Features */}
        <div style={{display:"flex",flexDirection:"column",gap:"0",marginBottom:"32px"}}>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 0",borderBottom:`1px solid ${RULE}`}}>
              <i className="fa-solid fa-check" style={{fontSize:"11px",color:"#22c55e",flexShrink:0}}/>
              <span style={{fontSize:"13px",color:TEXT,fontWeight:300}}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {session?(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <button style={{width:"100%",padding:"14px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"14px",fontWeight:500,border:"none",cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.02em"}}>
              {t("Захиалга хийх","Subscribe now","今すぐ登録","지금 구독","S'abonner maintenant","Jetzt abonnieren","立即订阅")}
            </button>
            <p style={{fontSize:"11px",color:MUTED,textAlign:"center",fontWeight:300}}>
              {t("Одоогоор Stripe холбоогүй. Хожим нэмэгдэнэ.","Stripe not connected yet. Coming soon.","Stripeはまだ未接続。近日追加予定。","Stripe 연결 예정.","Stripe non connecté pour l'instant.","Stripe noch nicht verbunden.","Stripe暂未连接。")}
            </p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <Link href="/auth/register" style={{width:"100%",padding:"14px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"14px",fontWeight:500,border:"none",cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.02em",textDecoration:"none",textAlign:"center",display:"block",boxSizing:"border-box" as const}}>
              {t("Бүртгүүлж захиалах","Register to subscribe","登録して購読","가입 후 구독","S'inscrire pour s'abonner","Registrieren und abonnieren","注册并订阅")}
            </Link>
            <Link href="/auth/login" style={{width:"100%",padding:"12px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textDecoration:"none",textAlign:"center",display:"block"}}>
              {t("Бүртгэлтэй бол нэвтрэх","Already have account? Sign in","アカウントをお持ちの方はログイン","계정 있으면 로그인","Déjà inscrit? Connexion","Bereits registriert? Anmelden","已有账号?登录")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
