"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import Link from "next/link";

export default function LivePage() {
  const { isDark, mounted } = useTheme();
  const { lang } = useLang();
  const [streams, setStreams]   = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);
  const [hasAccess, setAccess]  = useState(false);
  const [watching, setWatch]    = useState<string|null>(null);
  const [connected, setConn]    = useState(false);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const channelRef = useRef<BroadcastChannel|null>(null);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    const load=()=>{
      fetch("/api/livestreams/public").then(r=>r.json()).then(d=>{if(Array.isArray(d))setStreams(d);}).catch(()=>{}).finally(()=>setLoad(false));
    };
    load();
    const iv=setInterval(load,5000);
    fetch("/api/check-access").then(r=>r.json()).then(d=>setAccess(!!d.hasAccess)).catch(()=>{});
    return()=>clearInterval(iv);
  },[]);

  function joinStream(id:string){
    if(channelRef.current) channelRef.current.close();
    setWatch(id); setConn(false);
    const ch=new BroadcastChannel(`live_stream_${id}`);
    channelRef.current=ch;
    ch.onmessage=(e)=>{
      const{type,frame}=e.data;
      if(type==="stream_start") setConn(true);
      else if(type==="frame"&&canvasRef.current){
        setConn(true);
        const img=new Image();
        img.onload=()=>{ const ctx=canvasRef.current?.getContext("2d"); if(ctx&&canvasRef.current){canvasRef.current.width=img.width;canvasRef.current.height=img.height;ctx.drawImage(img,0,0);} };
        img.src=frame;
      } else if(type==="stream_end") setConn(false);
    };
  }

  function leave(){
    if(channelRef.current){channelRef.current.close();channelRef.current=null;}
    setWatch(null);setConn(false);
  }

  if(!mounted) return <div style={{minHeight:"100vh",background:"#F2F0EB"}}/>;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)";
  const HOVER = isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  const live      = streams.filter(s=>s.status==="live");
  const scheduled = streams.filter(s=>s.status==="scheduled");

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1080px",margin:"0 auto",padding:"0 48px"}}>

        {/* Header */}
        <div style={{padding:"48px 0 32px",borderBottom:`1px solid ${RULE}`,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              {live.length>0&&<div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#ef4444"}}/>}
              <span style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED}}>
                {t("Шууд хичээл","Live classes","ライブ授業","라이브 클래스","Cours en direct","Live-Unterricht","直播课程")}
              </span>
            </div>
            <h1 style={{fontSize:"32px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
              {live.length>0
                ?t(`${live.length} шууд явагдаж байна`,`${live.length} live now`,`${live.length}つのライブ中`,`${live.length}개 라이브 중`,`${live.length} en direct`,`${live.length} live`,`${live.length}个直播中`)
                :t("Шууд хичээл байхгүй","No live classes now","現在ライブなし","현재 라이브 없음","Aucun cours en direct","Kein Live-Unterricht","暂无直播")}
            </h1>
          </div>
          {!hasAccess&&(
            <Link href="/payment" style={{padding:"8px 20px",background:TEXT,color:isDark?"#000":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",textDecoration:"none"}}>
              {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")} →
            </Link>
          )}
        </div>

        {/* Video player */}
        {watching&&(
          <div style={{padding:"32px 0",borderBottom:`1px solid ${RULE}`}}>
            <div style={{background:"#000",aspectRatio:"16/9",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <canvas ref={canvasRef} style={{width:"100%",height:"100%",display:connected?"block":"none"}}/>
              {!connected&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)",fontWeight:300,marginBottom:"8px"}}>
                    {t("Дамжуулалт хүлээж байна...","Waiting for stream...","配信待ち...","스트림 대기 중...","Attente du stream...","Warte auf Stream...","等待直播...")}
                  </div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.25)"}}>
                    {t("Admin болон та нэг browser-д байх шаардлагатай","Admin must be in the same browser","管理者と同じブラウザが必要","관리자와 같은 브라우저 필요","Admin doit être dans le même navigateur","Admin muss im selben Browser sein","管理员需在同一浏览器")}
                  </div>
                </div>
              )}
              {connected&&<div style={{position:"absolute",top:"12px",left:"12px",display:"flex",alignItems:"center",gap:"6px",padding:"4px 10px",background:"rgba(239,68,68,0.9)"}}>
                <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#fff"}}/>
                <span style={{fontSize:"10px",letterSpacing:"0.1em",color:"#fff",fontWeight:500}}>LIVE</span>
              </div>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"12px"}}>
              <div style={{fontSize:"14px",fontWeight:300,color:TEXT}}>{streams.find(s=>s._id===watching)?.title}</div>
              <button onClick={leave} style={{padding:"6px 16px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",background:"none",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit"}}>
                {t("Гарах","Leave","退出","나가기","Quitter","Verlassen","退出")}
              </button>
            </div>
          </div>
        )}

        {/* Live now */}
        {live.length>0&&(
          <div style={{padding:"32px 0",borderBottom:`1px solid ${RULE}`}}>
            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
              {t("Одоо явагдаж байна","Happening now","今すぐ","지금 라이브","En ce moment","Jetzt","正在直播")}
            </div>
            {live.map((s:any)=>(
              <div key={s._id} style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px",padding:"16px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"3px"}}>
                    <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#ef4444"}}/>
                    <span style={{fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(239,68,68,0.7)"}}>LIVE</span>
                  </div>
                  <div style={{fontSize:"15px",fontWeight:300,color:TEXT,letterSpacing:"-0.3px"}}>{s.title}</div>
                  <div style={{fontSize:"11px",color:MUTED,marginTop:"2px"}}>{s.host} · {s.enrolled||0}/{s.seats||20} {t("суудал","seats","席","좌석","places","Plätze","座位")}</div>
                </div>
                {hasAccess?(
                  watching===s._id?(
                    <button onClick={leave} style={{padding:"8px 20px",border:"1px solid rgba(239,68,68,0.3)",color:"rgba(239,68,68,0.7)",fontSize:"12px",background:"none",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit"}}>
                      {t("Үзэж байна","Watching","視聴中","시청 중","En cours","Läuft","观看中")}
                    </button>
                  ):(
                    <button onClick={()=>joinStream(s._id)} style={{padding:"8px 20px",background:"#ef4444",color:"#fff",fontSize:"12px",fontWeight:500,border:"none",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit"}}>
                      {t("Нэгдэх","Join","参加","참여","Rejoindre","Beitreten","加入")}
                    </button>
                  )
                ):(
                  <Link href="/payment" style={{padding:"8px 20px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",borderRadius:"100px",textDecoration:"none"}}>
                    {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Scheduled */}
        {scheduled.length>0&&(
          <div style={{padding:"32px 0 48px"}}>
            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
              {t("Удахгүй болох","Upcoming","まもなく","예정","À venir","Bald","即将开始")}
            </div>
            {scheduled.map((s:any)=>(
              <div key={s._id} style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px",padding:"16px 0",borderBottom:`1px solid ${RULE}`}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:300,color:TEXT,letterSpacing:"-0.3px",marginBottom:"2px"}}>{s.title}</div>
                  <div style={{fontSize:"11px",color:MUTED}}>{s.host} · {s.scheduled}</div>
                </div>
                {hasAccess?(
                  <span style={{fontSize:"11px",color:"#22c55e",letterSpacing:"0.04em"}}>
                    ✓ {t("Эрхтэй","Access granted","アクセス可","접근 가능","Accès accordé","Zugang","已授权")}
                  </span>
                ):(
                  <Link href="/payment" style={{padding:"6px 16px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"11px",borderRadius:"100px",textDecoration:"none"}}>
                    {t("Захиалах","Subscribe","登録","구독","S'abonner","Abonnieren","订阅")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading&&live.length===0&&scheduled.length===0&&(
          <div style={{padding:"80px 0",textAlign:"center"}}>
            <div style={{fontSize:"13px",color:MUTED,fontWeight:300,marginBottom:"8px"}}>
              {t("Одоо шууд хичээл байхгүй","No live classes at the moment","現在ライブなし","현재 라이브 없음","Aucun cours en direct","Kein Live-Unterricht","暂无直播")}
            </div>
            <div style={{fontSize:"11px",color:MUTED}}>
              {t("Admin шинэ хичээл нэмэхэд энд харагдана","Live classes added by admin will appear here","管理者がライブを追加すると表示されます","관리자가 추가하면 표시됩니다","Les cours apparaîtront ici","Kurse erscheinen hier","管理员添加后将显示")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
