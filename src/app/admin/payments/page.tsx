"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminPaymentsPage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoad] = useState(true);

  const t = (mn:string,en:string) => lang==="mn"?mn:en;

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
      <div style={{padding:"40px 48px",background:BG,minHeight:"100vh"}}>
        <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <h1 style={{fontSize:"28px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>{t("Төлбөр","Payments")}</h1>
            <span style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{payments.length} {t("бүртгэл","records")}</span>
          </div>
        </div>
        {loading?(
          <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{t("Ачааллаж байна...","Loading...")}</div>
        ):payments.length===0?(
          <div style={{padding:"40px 0",fontSize:"13px",color:MUTED,fontWeight:300}}>{t("Төлбөрийн бүртгэл байхгүй","No payment records yet")}</div>
        ):payments.map((p:any,i:number)=>(
          <div key={p._id||i} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"16px",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=HOVER}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div>
              <div style={{fontSize:"13px",fontWeight:300,color:TEXT}}>{p.userName||p.userId}</div>
              <div style={{fontSize:"11px",color:MUTED}}>{p.email}</div>
            </div>
            <span style={{fontSize:"13px",fontWeight:300,color:TEXT}}>₮{(p.amount||0).toLocaleString()}</span>
            <span style={{fontSize:"10px",color:p.status==="success"?"#22c55e":p.status==="pending"?"#f59e0b":"#ef4444",letterSpacing:"0.08em"}}>{p.status}</span>
            <span style={{fontSize:"11px",color:MUTED}}>{p.createdAt?new Date(p.createdAt).toLocaleDateString():"—"}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
