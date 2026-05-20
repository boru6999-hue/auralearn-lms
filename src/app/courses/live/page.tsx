"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function LiveViewerPage() {
  const { isDark, mounted } = useTheme();
  const { lang } = useLang();
  const { data: session } = useSession();
  const [streams, setStreams]   = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);
  const [hasAccess, setAccess]  = useState(false);
  const [watching, setWatch]    = useState<string|null>(null);
  const [connected, setConn]    = useState(false);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const pcRef      = useRef<RTCPeerConnection|null>(null);
  const channelRef = useRef<any>(null);
  const viewerId   = useRef(`viewer-${Math.random().toString(36).slice(2)}`);

  const t = (mn:string,en:string) => lang==="mn"?mn:en;

  useEffect(()=>{
    const load=()=>{
      fetch("/api/admin/livestreams").then(r=>r.json()).then(d=>{if(Array.isArray(d))setStreams(d.filter((s:any)=>s.status==="live"||s.status==="scheduled"));}).catch(()=>{}).finally(()=>setLoad(false));
    };
    load();
    const iv=setInterval(load,5000);
    fetch("/api/check-access").then(r=>r.json()).then(d=>setAccess(!!d.hasAccess)).catch(()=>{});
    return()=>clearInterval(iv);
  },[]);

  async function joinStream(streamId: string) {
    if(pcRef.current) { pcRef.current.close(); pcRef.current=null; }
    if(channelRef.current) { channelRef.current.unsubscribe(); }

    setWatch(streamId); setConn(false);

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.ontrack = (e)=>{
      if(videoRef.current && e.streams[0]) {
        videoRef.current.srcObject = e.streams[0];
        videoRef.current.play().catch(()=>{});
        setConn(true);
      }
    };

    pc.onicecandidate = (e)=>{
      if(e.candidate && channelRef.current) {
        channelRef.current.send({
          type:"broadcast",
          event:"ice-candidate",
          payload:{ candidate: e.candidate, from: viewerId.current, target:"admin" }
        });
      }
    };

    pc.onconnectionstatechange = ()=>{
      if(pc.connectionState==="disconnected"||pc.connectionState==="closed") {
        setConn(false);
      }
    };

    const ch = supabase.channel(`live-${streamId}`,{
      config:{ broadcast:{ self:false, ack:false } }
    });

    ch.on("broadcast",{event:"offer"},async({payload}:any)=>{
      if(payload.target!==viewerId.current) return;
      await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ch.send({
        type:"broadcast",
        event:"answer",
        payload:{ answer, from: viewerId.current, target:"admin" }
      });
    });

    ch.on("broadcast",{event:"ice-candidate"},async({payload}:any)=>{
      if(payload.target!==viewerId.current) return;
      if(pc && payload.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    });

    ch.on("broadcast",{event:"stream-ended"},()=>{
      setConn(false);
      setWatch(null);
      if(videoRef.current) videoRef.current.srcObject=null;
    });

    await ch.subscribe();
    channelRef.current = ch;

    // Announce join
    ch.send({
      type:"broadcast",
      event:"join",
      payload:{ viewerId: viewerId.current }
    });
  }

  function leaveStream() {
    if(channelRef.current) {
      channelRef.current.send({type:"broadcast",event:"leave",payload:{viewerId:viewerId.current}});
      channelRef.current.unsubscribe();
      channelRef.current=null;
    }
    if(pcRef.current) { pcRef.current.close(); pcRef.current=null; }
    if(videoRef.current) videoRef.current.srcObject=null;
    setWatch(null); setConn(false);
  }

  if(!mounted) return <div style={{minHeight:"100vh",background:"#F2F0EB"}}/>;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
        HOVER=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";

  const live      = streams.filter(s=>s.status==="live");
  const scheduled = streams.filter(s=>s.status==="scheduled");

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"1080px",margin:"0 auto",padding:"0 clamp(24px,5vw,48px)"}}>

        {/* Header */}
        <div style={{padding:"48px 0 32px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
            {live.length>0&&<div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#ef4444"}}/>}
            <span style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED}}>
              {t("Шууд хичээл","Live classes")}
            </span>
          </div>
          <h1 style={{fontSize:"32px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
            {live.length>0
              ?t(`${live.length} шууд явагдаж байна`,`${live.length} live now`)
              :t("Шууд хичээл байхгүй","No live classes now")}
          </h1>
        </div>

        {/* Video player */}
        {watching&&(
          <div style={{padding:"32px 0",borderBottom:`1px solid ${RULE}`}}>
            <div style={{background:"#000",aspectRatio:"16/9",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <video ref={videoRef} autoPlay style={{width:"100%",height:"100%",display:connected?"block":"none"}}/>
              {!connected&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",fontWeight:300,marginBottom:"8px"}}>
                    {t("Холболт хүлээж байна...","Connecting to stream...")}
                  </div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)"}}>
                    {t("Admin stream эхлүүлэх үед автоматаар холбогдоно","Will connect when admin starts streaming")}
                  </div>
                </div>
              )}
              {connected&&(
                <div style={{position:"absolute",top:"12px",left:"12px",display:"flex",alignItems:"center",gap:"5px",padding:"4px 10px",background:"rgba(239,68,68,0.9)"}}>
                  <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#fff"}}/>
                  <span style={{fontSize:"10px",letterSpacing:"0.1em",color:"#fff",fontWeight:500}}>LIVE</span>
                </div>
              )}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"12px"}}>
              <div style={{fontSize:"14px",fontWeight:300,color:TEXT}}>
                {streams.find(s=>s._id===watching)?.title}
              </div>
              <button onClick={leaveStream} style={{padding:"6px 16px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",background:"none",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit"}}>
                {t("Гарах","Leave")}
              </button>
            </div>
          </div>
        )}

        {/* Live streams */}
        {live.length>0&&(
          <div style={{padding:"32px 0",borderBottom:`1px solid ${RULE}`}}>
            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"20px"}}>
              {t("Одоо явагдаж байна","Happening now")}
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
                  <div style={{fontSize:"15px",fontWeight:300,color:TEXT,letterSpacing:"-0.3px",marginBottom:"2px"}}>{s.title}</div>
                  <div style={{fontSize:"11px",color:MUTED}}>{s.host}</div>
                </div>
                {hasAccess?(
                  watching===s._id?(
                    <button onClick={leaveStream} style={{padding:"8px 20px",border:"1px solid rgba(239,68,68,0.3)",color:"rgba(239,68,68,0.7)",fontSize:"12px",background:"none",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit"}}>
                      {t("Үзэж байна","Watching")}
                    </button>
                  ):(
                    <button onClick={()=>joinStream(s._id)} style={{padding:"8px 20px",background:"#ef4444",color:"#fff",fontSize:"12px",fontWeight:500,border:"none",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit"}}>
                      {t("Нэгдэх","Join")}
                    </button>
                  )
                ):(
                  <Link href="/payment" style={{padding:"8px 20px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"12px",borderRadius:"100px",textDecoration:"none"}}>
                    {t("Захиалах","Subscribe")}
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
              {t("Удахгүй болох","Upcoming")}
            </div>
            {scheduled.map((s:any)=>(
              <div key={s._id} style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px",padding:"16px 0",borderBottom:`1px solid ${RULE}`}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:300,color:TEXT,letterSpacing:"-0.3px",marginBottom:"2px"}}>{s.title}</div>
                  <div style={{fontSize:"11px",color:MUTED}}>{s.host} · {s.scheduled}</div>
                </div>
                {hasAccess?(
                  <span style={{fontSize:"11px",color:"#22c55e",letterSpacing:"0.04em"}}>
                    ✓ {t("Эрхтэй","Access granted")}
                  </span>
                ):(
                  <Link href="/payment" style={{padding:"6px 16px",border:`1px solid ${RULE}`,color:MUTED,fontSize:"11px",borderRadius:"100px",textDecoration:"none"}}>
                    {t("Захиалах","Subscribe")}
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
              {t("Одоо шууд хичээл байхгүй","No live classes at the moment")}
            </div>
            <div style={{fontSize:"11px",color:MUTED}}>
              {t("Admin шинэ хичээл нэмэхэд энд харагдана","Live classes will appear here")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
