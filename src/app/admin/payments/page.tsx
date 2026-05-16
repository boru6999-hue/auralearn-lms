"use client";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const SC:any={completed:"#34d399",pending:"#f59e0b",refunded:"#f87171"};

export default function PaymentsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats]       = useState({total:0,thisMonth:0,pending:0,refunded:0});
  const [loading, setLoad]      = useState(true);
  const [filter, setFilter]     = useState("all");

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  const BG    =isDark?"#0a0a0a":"#f5f5f5";
  const CARD  =isDark?"rgba(255,255,255,0.04)":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e5e5e5";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#888";

  async function load(f="all"){
    setLoad(true);
    try{
      const res=await fetch(`/api/admin/payments?status=${f}`);
      const data=await res.json();
      setPayments(data.payments||[]);
      if(data.stats)setStats(data.stats);
    }catch{}
    setLoad(false);
  }

  useEffect(()=>{load();},[]);

  async function refund(id:string){
    if(!confirm(t("Буцаах уу?","Refund this payment?","返金しますか？","환불하시겠습니까?","Rembourser?","Erstatten?","退款？")))return;
    await fetch("/api/admin/payments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:"refunded"})});
    setPayments(p=>p.map(x=>x._id===id?{...x,status:"refunded"}:x));
  }

  if(!mounted)return<div style={{minHeight:"100vh",background:"#000"}}/>;

  const STAT_CARDS=[
    {label:t("Нийт орлого","Total Revenue","総収益","총 수익","Revenu total","Gesamtumsatz","总收入"), value:`₮${stats.total.toLocaleString()}`, icon:"fa-money-bill-wave", color:"#34d399"},
    {label:t("Энэ сарын","This Month","今月","이번 달","Ce mois","Diesen Monat","本月"),               value:`₮${stats.thisMonth.toLocaleString()}`, icon:"fa-chart-line",     color:MUTED},
    {label:t("Хүлээгдэж буй","Pending","保留中","대기 중","En attente","Ausstehend","待处理"),          value:stats.pending, icon:"fa-clock",                                   color:"#f59e0b"},
    {label:t("Буцаасан","Refunded","返金","환불","Remboursé","Erstattet","已退款"),                     value:stats.refunded, icon:"fa-rotate-left",                            color:"#f87171"},
  ];

  const HEADERS=[
    t("Хэрэглэгч","User","ユーザー","사용자","Utilisateur","Benutzer","用户"),
    t("Дүн","Amount","金額","금액","Montant","Betrag","金额"),
    t("Арга","Method","方法","방법","Méthode","Methode","方式"),
    "Status",
    t("Огноо","Date","日付","날짜","Date","Datum","日期"),
    t("Үйлдэл","Action","操作","액션","Action","Aktion","操作"),
  ];

  return(
    <AdminLayout>
      <div style={{padding:"28px 32px",background:BG,minHeight:"100vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
          <div>
            <h1 style={{fontSize:"20px",fontWeight:800,color:TEXT,marginBottom:"3px"}}>
              {t("Төлбөр","Payments","支払い","결제","Paiements","Zahlungen","支付")}
            </h1>
            <p style={{color:MUTED,fontSize:"12px"}}>{t("Гүйлгээний бүртгэл","Transaction History","取引履歴","거래 내역","Historique","Transaktionsverlauf","交易记录")}</p>
          </div>
          <button onClick={()=>load(filter)} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"7px 12px",borderRadius:"8px",cursor:"pointer",fontSize:"12px"}}>
            <i className="fa-solid fa-rotate-right"/>
          </button>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"24px"}}>
          {STAT_CARDS.map((s,i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"10px",padding:"16px"}}>
              <i className={`fa-solid ${s.icon}`} style={{color:s.color,fontSize:"15px",marginBottom:"8px",display:"block"}}/>
              <div style={{color:TEXT,fontSize:"20px",fontWeight:800}}>{s.value}</div>
              <div style={{color:MUTED,fontSize:"11px"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
          {["all","completed","pending","refunded"].map(f=>(
            <button key={f} onClick={()=>{setFilter(f);load(f);}} style={{padding:"5px 14px",borderRadius:"7px",border:`1px solid ${filter===f?TEXT:BORDER}`,background:filter===f?(isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"):"transparent",color:filter===f?TEXT:MUTED,fontSize:"12px",cursor:"pointer",textTransform:"capitalize"}}>
              {f==="all"?t("Бүгд","All","すべて","전체","Tous","Alle","全部"):f}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading?(
          <div style={{textAlign:"center",padding:"60px",color:MUTED}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
            {t("Ачааллаж байна...","Loading...","読み込み中...","로딩 중...","Chargement...","Laden...","加载中...")}
          </div>
        ):(
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${BORDER}`}}>
                  {HEADERS.map(h=>(
                    <th key={h} style={{padding:"11px 14px",color:MUTED,fontSize:"10px",fontWeight:600,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length===0?(
                  <tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:MUTED}}>
                    {t("Гүйлгээ олдсонгүй","No transactions found")}
                  </td></tr>
                ):payments.map((p,i)=>(
                  <tr key={p._id} style={{borderBottom:i<payments.length-1?`1px solid ${BORDER}`:"none"}}
                    onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{color:TEXT,fontSize:"13px"}}>{p.user?.name||"—"}</div>
                      <div style={{color:MUTED,fontSize:"11px"}}>{p.user?.email||"—"}</div>
                    </td>
                    <td style={{padding:"11px 14px",color:"#34d399",fontSize:"13px",fontWeight:700}}>
                      {p.currency==="MNT"?"₮":p.currency==="JPY"?"¥":p.currency==="KRW"?"₩":"$"}{(p.amount||0).toLocaleString()}
                    </td>
                    <td style={{padding:"11px 14px",color:TEXT,fontSize:"12px"}}>{p.method||"—"}</td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{background:`${SC[p.status||"pending"]}22`,color:SC[p.status||"pending"],fontSize:"10px",padding:"2px 8px",borderRadius:"10px",fontWeight:600}}>{p.status||"pending"}</span>
                    </td>
                    <td style={{padding:"11px 14px",color:MUTED,fontSize:"12px"}}>
                      {p.createdAt?new Date(p.createdAt).toLocaleDateString(lang==="mn"?"mn-MN":"en-US"):"—"}
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      {p.status==="completed"&&(
                        <button onClick={()=>refund(p._id)} style={{background:"none",border:`1px solid ${BORDER}`,color:"#f87171",padding:"4px 8px",borderRadius:"6px",cursor:"pointer",fontSize:"11px"}}>
                          {t("Буцаах","Refund","返金","환불","Rembourser","Erstatten","退款")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
