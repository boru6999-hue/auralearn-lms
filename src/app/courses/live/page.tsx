"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

export default function LiveCoursesPage() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const [streams, setStreams]  = useState<any[]>([]);
  const [loading, setLoad]     = useState(true);
  const [hasAccess, setAccess] = useState(false);
  const [watching, setWatch]   = useState<string|null>(null);
  const [connected, setConn]   = useState(false);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const channelRef = useRef<BroadcastChannel|null>(null);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    const load=()=>{
      fetch("/api/livestreams/public")
        .then(r=>r.json())
        .then(d=>{ if(Array.isArray(d)) setStreams(d); })
        .catch(()=>{}).finally(()=>setLoad(false));
    };
    load();
    const iv=setInterval(load,5000);
    fetch("/api/check-access").then(r=>r.json()).then(d=>setAccess(!!d.hasAccess)).catch(()=>{});
    return()=>clearInterval(iv);
  },[]);

  function joinStream(id: string) {
    if(channelRef.current) channelRef.current.close();
    setWatch(id); setConn(false);
    const channel = new BroadcastChannel(`live_stream_${id}`);
    channelRef.current = channel;
    channel.onmessage = (e) => {
      const { type, frame } = e.data;
      if(type==="stream_start"){ setConn(true); }
      else if(type==="frame"&&canvasRef.current){
        setConn(true);
        const img = new Image();
        img.onload=()=>{
          const ctx=canvasRef.current?.getContext("2d");
          if(ctx&&canvasRef.current){ canvasRef.current.width=img.width; canvasRef.current.height=img.height; ctx.drawImage(img,0,0); }
        };
        img.src=frame;
      } else if(type==="stream_end"){ setConn(false); }
    };
  }

  function leave() {
    if(channelRef.current){ channelRef.current.close(); channelRef.current=null; }
    setWatch(null); setConn(false);
  }

  if(!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;

  const live      = streams.filter(s=>s.status==="live");
  const scheduled = streams.filter(s=>s.status==="scheduled");

  return (
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"32px 24px"}}>
        <Link href="/courses" style={{color:colors.text3,fontSize:"13px",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"6px",marginBottom:"20px"}}>
          <i className="fa-solid fa-arrow-left" style={{fontSize:"11px"}}/>
          {t("Бүх сургалт","All Courses","すべてのコース","전체 강의","Tous les cours","Alle Kurse","所有课程")}
        </Link>

        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
          {live.length>0&&<span style={{width:"10px",height:"10px",borderRadius:"50%",background:"#ef4444",display:"inline-block",animation:"pulse 1.5s infinite"}}/>}
          <h1 style={{color:colors.text,fontSize:"24px",fontWeight:800}}>
            <i className="fa-solid fa-tower-broadcast" style={{marginRight:"10px",color:"#ef4444"}}/>{t("Шууд хичээл","Live Classes","ライブ授業","라이브 클래스","Cours en direct","Live-Unterricht","直播课程")}
          </h1>
        </div>
        <p style={{color:colors.text3,fontSize:"13px",marginBottom:"24px"}}>
          {live.length>0
            ?t(`${live.length} шууд хичээл явагдаж байна`,`${live.length} class is live now`,`${live.length}つのライブ授業中`,`${live.length}개 라이브 진행 중`,`${live.length} cours en direct`,`${live.length} Live-Klasse`,`${live.length}个直播进行中`)
            :t("Одоо шууд хичээл байхгүй","No live classes right now","現在ライブ授業なし","현재 라이브 없음","Aucun cours en direct","Kein Live-Unterricht","暂无直播课程")}
        </p>

        {/* Access banner */}
        {hasAccess ? (
          <div style={{background:isDark?"rgba(52,211,153,0.08)":"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:"12px",padding:"12px 18px",marginBottom:"24px",display:"flex",alignItems:"center",gap:"10px"}}>
            <i className="fa-solid fa-circle-check" style={{color:"#34d399",fontSize:"16px"}}/>
            <span style={{color:colors.text,fontSize:"13px",fontWeight:600}}>
              {t("Сарын эрхтэй — бүх шууд хичээлд үнэгүй нэгдэх боломжтой!","Active subscription — join all live classes free!","サブスク有効 — 全ライブに無料参加！","구독 중 — 모든 라이브 무료 참여!","Abonnement actif — cours en direct gratuits!","Aktives Abo — alle Live-Kurse kostenlos!","订阅中 — 免费参加所有直播！")}
            </span>
          </div>
        ) : (
          <div style={{background:isDark?"rgba(255,255,255,0.04)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"12px",padding:"14px 18px",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:colors.text,fontSize:"13px",fontWeight:600}}>
                {t("Шууд хичээл үзэхийн тулд сарын эрх шаардана","Subscription required to watch live classes","ライブ授業にはサブスクが必要","라이브 클래스는 구독 필요","Abonnement requis pour les cours en direct","Abo für Live-Kurse erforderlich","需要订阅才能观看直播")}
              </div>
              <div style={{color:colors.text3,fontSize:"12px"}}>
                {t("Захиалга авснаар бүх хичээлд нэгдэх","Subscribe to join all live classes","サブスクで全ライブに参加","구독하여 모든 라이브 참여","Abonnez-vous pour tous les cours","Abo für alle Live-Kurse","订阅加入所有直播课")}
              </div>
            </div>
            <Link href="/payment" style={{background:isDark?"#fff":"#000",color:isDark?"#000":"#fff",padding:"8px 20px",borderRadius:"8px",textDecoration:"none",fontSize:"13px",fontWeight:700,whiteSpace:"nowrap" as const}}>
              {t("Захиалах","Subscribe","登録する","구독하기","S'abonner","Abonnieren","立即订阅")}
            </Link>
          </div>
        )}

        {/* Video player */}
        {watching&&(
          <div style={{marginBottom:"28px"}}>
            <div style={{background:"#000",borderRadius:"14px",overflow:"hidden",position:"relative",border:"1px solid rgba(239,68,68,0.3)",minHeight:"300px",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <canvas ref={canvasRef} style={{width:"100%",height:"auto",display:connected?"block":"none"}}/>
              {!connected&&(
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"12px",padding:"24px",textAlign:"center"}}>
                  <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"28px",color:"#ef4444"}}/>
                  <div style={{color:"#aaa",fontSize:"14px",fontWeight:600}}>
                    {t("Admin дэлгэц хуваалцахыг хүлээж байна...","Waiting for admin to share screen...","管理者の画面共有を待っています...","관리자 화면 공유 대기 중...","En attente du partage d'écran...","Warte auf Bildschirmfreigabe...","等待管理员共享屏幕...")}
                  </div>
                </div>
              )}
              {connected&&<div style={{position:"absolute",top:"12px",left:"12px",background:"rgba(239,68,68,0.9)",color:"#fff",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"6px"}}>
                <i className="fa-solid fa-circle" style={{marginRight:"5px",fontSize:"8px"}}/>LIVE
              </div>}
              <button onClick={leave} style={{position:"absolute",bottom:"12px",right:"12px",background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"6px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",display:"flex",alignItems:"center",gap:"5px"}}>
                <i className="fa-solid fa-arrow-right-from-bracket" style={{fontSize:"11px"}}/>
                {t("Гарах","Leave","退出","나가기","Quitter","Verlassen","退出")}
              </button>
            </div>
            {streams.find(s=>s._id===watching)&&(
              <div style={{marginTop:"10px"}}>
                <div style={{color:colors.text,fontWeight:700,fontSize:"15px"}}>{streams.find(s=>s._id===watching)?.title}</div>
                <div style={{color:colors.text3,fontSize:"12px"}}><i className="fa-solid fa-user" style={{marginRight:"5px"}}/>{streams.find(s=>s._id===watching)?.host}</div>
              </div>
            )}
          </div>
        )}

        {/* Live now */}
        {live.length>0&&(
          <div style={{marginBottom:"24px"}}>
            <h2 style={{color:colors.text,fontSize:"14px",fontWeight:700,marginBottom:"12px"}}>
              <i className="fa-solid fa-circle-dot" style={{color:"#ef4444",marginRight:"8px"}}/>{t("Одоо явагдаж байна","Happening Now","今すぐライブ","지금 라이브 중","En ce moment","Jetzt live","正在直播")}
            </h2>
            {live.map(s=>(
              <div key={s._id} style={{background:isDark?"rgba(239,68,68,0.06)":"#fff",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"12px",padding:"16px 20px",marginBottom:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(239,68,68,0.2)"}>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"rgba(239,68,68,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <i className="fa-solid fa-circle-dot" style={{color:"#ef4444"}}/>
                  </div>
                  <div>
                    <div style={{color:colors.text,fontWeight:700,fontSize:"14px"}}>{s.title}</div>
                    <div style={{color:colors.text3,fontSize:"12px"}}>
                      <i className="fa-solid fa-user" style={{marginRight:"4px"}}/>{s.host}
                      <span style={{margin:"0 6px"}}>·</span>
                      <i className="fa-solid fa-users" style={{marginRight:"4px"}}/>{s.enrolled||0}/{s.seats||20} {t("суудал","seats","席","좌석","places","Plätze","座位")}
                    </div>
                  </div>
                </div>
                {hasAccess?(
                  watching===s._id?(
                    <button onClick={leave} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",gap:"6px"}}>
                      <i className="fa-solid fa-circle-check"/>
                      {t("Үзэж байна","Watching","視聴中","시청 중","En cours","Läuft","观看中")}
                    </button>
                  ):(
                    <button onClick={()=>joinStream(s._id)} style={{background:"#ef4444",border:"none",color:"#fff",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:700,display:"flex",alignItems:"center",gap:"6px"}}>
                      <i className="fa-solid fa-arrow-right-to-bracket"/>
                      {t("Нэгдэх","Join","参加する","참여하기","Rejoindre","Beitreten","加入")}
                    </button>
                  )
                ):(
                  <Link href="/payment" style={{background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",color:colors.text,padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",gap:"6px"}}>
                    <i className="fa-solid fa-lock" style={{color:"#f59e0b"}}/>
                    {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Scheduled */}
        {scheduled.length>0&&(
          <div>
            <h2 style={{color:colors.text,fontSize:"14px",fontWeight:700,marginBottom:"12px"}}>
              <i className="fa-solid fa-clock" style={{color:colors.text3,marginRight:"8px"}}/>{t("Удахгүй болох","Upcoming","まもなく","예정","À venir","Bald","即将开始")}
            </h2>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {scheduled.map(s=>(
                <div key={s._id} style={{background:isDark?"rgba(255,255,255,0.03)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"12px",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.12)":"#bbb"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=colors.border}>
                  <div>
                    <div style={{color:colors.text,fontWeight:600,fontSize:"14px",marginBottom:"4px"}}>{s.title}</div>
                    <div style={{color:colors.text3,fontSize:"12px",display:"flex",gap:"10px"}}>
                      <span><i className="fa-solid fa-user" style={{marginRight:"4px"}}/>{s.host}</span>
                      <span><i className="fa-solid fa-clock" style={{marginRight:"4px"}}/>{s.scheduled}</span>
                    </div>
                  </div>
                  {hasAccess?(
                    <span style={{background:"rgba(52,211,153,0.1)",color:"#34d399",padding:"5px 12px",borderRadius:"7px",fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",gap:"5px"}}>
                      <i className="fa-solid fa-circle-check"/>
                      {t("Эрхтэй","Access granted","アクセス可能","접근 가능","Accès accordé","Zugang gewährt","已授权")}
                    </span>
                  ):(
                    <Link href="/payment" style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",color:colors.text3,padding:"5px 12px",borderRadius:"7px",textDecoration:"none",fontSize:"12px",display:"flex",alignItems:"center",gap:"5px"}}>
                      <i className="fa-solid fa-lock" style={{color:"#f59e0b"}}/>
                      {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading&&live.length===0&&scheduled.length===0&&(
          <div style={{textAlign:"center",padding:"60px",background:isDark?"rgba(255,255,255,0.03)":"#fff",borderRadius:"16px",border:`1px solid ${colors.border}`}}>
            <i className="fa-solid fa-tower-broadcast" style={{fontSize:"36px",color:colors.text3,marginBottom:"14px",display:"block"}}/>
            <div style={{color:colors.text,fontWeight:700,fontSize:"16px",marginBottom:"6px"}}>
              {t("Одоо шууд хичээл байхгүй","No live classes right now","現在ライブ授業なし","현재 라이브 없음","Aucun cours en direct","Kein Live-Unterricht","暂无直播课程")}
            </div>
            <div style={{color:colors.text3,fontSize:"13px"}}>
              {t("Admin шинэ хичээл нэмэхэд энд харагдана","Live classes added by admin will appear here","管理者がライブを追加すると表示されます","관리자가 추가하면 표시됩니다","Les cours apparaîtront ici","Kurse erscheinen hier","管理员添加后将显示")}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
