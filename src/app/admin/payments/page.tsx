"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/ai/admin/AdminLayout";

export default function AdminPaymentsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoad] = useState(true);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    fetch("/api/admin/payments").then(r=>r.json()).then(d=>{if(Array.isArray(d))setPayments(d);}).catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
        HOVER=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  return (
    <AdminLayout>
      <div style={{padding:"clamp(24px,4vw,40px) clamp(20px,4vw,48px)",background:BG,minHeight:"100vh"}}>
        <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"8px"}}>
            <h1 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
              {t("Төлбөр","Payments","支払い","결제","Paiements","Zahlungen","支付")}
            </h1>
            <span style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{payments.length} {t("бүртгэл","records","件","건","enregistrements","Einträge","记录")}</span>
          </div>
        </div>

        {loading?(
          <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}</div>
        ):payments.length===0?(
          <div style={{padding:"40px 0"}}>
            <div style={{fontSize:"13px",color:MUTED,fontWeight:300,marginBottom:"6px"}}>{t("Төлбөрийн бүртгэл байхгүй","No payment records yet","支払い記録なし","결제 기록 없음","Aucun enregistrement","Keine Zahlungen","暂无支付记录")}</div>
            <div style={{fontSize:"11px",color:MUTED}}>{t("Хэрэглэгчид захиалга хийх үед энд харагдана","Records will appear when users subscribe","ユーザーが登録したときに表示されます","사용자가 구독하면 표시됩니다","Apparaît quand les utilisateurs s'abonnent","Erscheint wenn Nutzer abonnieren","用户订阅后将显示")}</div>
          </div>
        ):(
          <div style={{overflowX:"auto"}}>
            <div style={{minWidth:"500px"}}>
              {/* Header */}
              <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"16px",padding:"0 0 10px",borderBottom:`1px solid ${RULE}`}}>
                {[t("Хэрэглэгч","User","ユーザー","사용자","Utilisateur","Benutzer","用户"),
                  t("Дүн","Amount","金額","금액","Montant","Betrag","金额"),
                  t("Статус","Status","ステータス","상태","Statut","Status","状态"),
                  t("Огноо","Date","日付","날짜","Date","Datum","日期")].map((h,i)=>(
                  <span key={i} style={{fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",color:MUTED}}>{h}</span>
                ))}
              </div>
              {payments.map((p:any,i:number)=>(
                <div key={p._id||i} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"16px",alignItems:"center",padding:"13px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:300,color:TEXT}}>{p.userName||p.userId}</div>
                    <div style={{fontSize:"11px",color:MUTED}}>{p.email}</div>
                  </div>
                  <span style={{fontSize:"13px",fontWeight:300,color:TEXT}}>₮{(p.amount||0).toLocaleString()}</span>
                  <span style={{fontSize:"10px",color:p.status==="success"?"#22c55e":p.status==="pending"?"#f59e0b":"#ef4444",letterSpacing:"0.08em"}}>{p.status}</span>
                  <span style={{fontSize:"11px",color:MUTED,whiteSpace:"nowrap"}}>{p.createdAt?new Date(p.createdAt).toLocaleDateString():"—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
