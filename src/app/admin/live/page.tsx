"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";
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

export default function AdminLivePage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [streams, setStreams]   = useState<any[]>([]);
  const [isLive, setIsLive]     = useState(false);
  const [active, setActive]     = useState<any>(null);
  const [camOn, setCam]         = useState(false);
  const [micOn, setMic]         = useState(true);
  const [screen, setScreen]     = useState(false);
  const [newTitle, setTitle]    = useState("");
  const [confirm, setConfirm]   = useState<string|null>(null);
  const [viewers, setViewers]   = useState(0);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream|null>(null);
  const peersRef    = useRef<Map<string,RTCPeerConnection>>(new Map());
  const channelRef  = useRef<any>(null);

  const t = (mn:string,en:string) => lang==="mn"?mn:en;

  useEffect(()=>{
    fetch("/api/admin/livestreams").then(r=>r.json()).then(d=>{if(Array.isArray(d))setStreams(d);}).catch(()=>{});
  },[]);

  function getOrCreatePeer(viewerId: string): RTCPeerConnection {
    if(peersRef.current.has(viewerId)) return peersRef.current.get(viewerId)!;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    // Add local tracks
    streamRef.current?.getTracks().forEach(track=>{
      pc.addTrack(track, streamRef.current!);
    });
    // Send ICE candidates to viewer
    pc.onicecandidate = (e)=>{
      if(e.candidate && channelRef.current) {
        channelRef.current.send({
          type:"broadcast",
          event:"ice-candidate",
          payload:{ candidate: e.candidate, target: viewerId, from:"admin" }
        });
      }
    };
    pc.onconnectionstatechange = ()=>{
      if(pc.connectionState==="disconnected"||pc.connectionState==="closed") {
        peersRef.current.delete(viewerId);
        setViewers(peersRef.current.size);
      }
    };
    peersRef.current.set(viewerId, pc);
    return pc;
  }

  async function startSignaling(streamId: string) {
    if(channelRef.current) { channelRef.current.unsubscribe(); }
    const ch = supabase.channel(`live-${streamId}`, {
      config:{ broadcast:{ self:false, ack:false } }
    });

    ch.on("broadcast",{event:"join"},async({payload}:any)=>{
      const viewerId = payload.viewerId;
      setViewers(p=>p+1);
      const pc = getOrCreatePeer(viewerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ch.send({
        type:"broadcast",
        event:"offer",
        payload:{ offer, target: viewerId, from:"admin" }
      });
    });

    ch.on("broadcast",{event:"answer"},async({payload}:any)=>{
      const pc = peersRef.current.get(payload.from);
      if(pc && payload.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      }
    });

    ch.on("broadcast",{event:"ice-candidate"},async({payload}:any)=>{
      if(payload.target==="admin") return;
      const pc = peersRef.current.get(payload.from);
      if(pc && payload.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    });

    ch.on("broadcast",{event:"leave"},({payload}:any)=>{
      const pc = peersRef.current.get(payload.viewerId);
      if(pc) { pc.close(); peersRef.current.delete(payload.viewerId); }
      setViewers(peersRef.current.size);
    });

    await ch.subscribe();
    channelRef.current = ch;

    // Announce stream is live
    ch.send({ type:"broadcast", event:"stream-live", payload:{ streamId, title: active?.title } });
  }

  async function createStream() {
    if(!newTitle.trim()) return;
    const res = await fetch("/api/admin/livestreams",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:newTitle,host:"Admin",seats:20})});
    const data = await res.json();
    setStreams(p=>[data,...p]); setTitle("");
  }

  async function deleteStream(id:string) {
    if(active?._id===id) await endStream();
    await fetch("/api/admin/livestreams",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setStreams(p=>p.filter(s=>s._id!==id));
    setConfirm(null);
  }

  async function startStream() {
    if(!active||!streamRef.current) return;
    await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active._id,status:"live"})});
    setStreams(p=>p.map(s=>s._id===active._id?{...s,status:"live"}:s));
    await startSignaling(active._id);
    setIsLive(true);
  }

  async function endStream() {
    if(channelRef.current) {
      channelRef.current.send({type:"broadcast",event:"stream-ended",payload:{}});
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    peersRef.current.forEach(pc=>pc.close());
    peersRef.current.clear();
    setViewers(0);
    if(active) {
      await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active._id,status:"ended"})});
      setStreams(p=>p.map(s=>s._id===active._id?{...s,status:"ended"}:s));
    }
    setIsLive(false);
  }

  async function toggleCam() {
    if(!camOn) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({video:true,audio:micOn});
        streamRef.current = s;
        if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play();}
        // Update existing peers with new tracks
        peersRef.current.forEach(pc=>{
          s.getTracks().forEach(track=>pc.addTrack(track,s));
        });
        setCam(true); setScreen(false);
      } catch { alert(t("Камерт хандах боломжгүй","Camera access denied")); }
    } else {
      streamRef.current?.getTracks().forEach(t=>t.stop());
      if(videoRef.current) videoRef.current.srcObject=null;
      setCam(false); streamRef.current=null;
    }
  }

  async function toggleScreen() {
    if(!screen) {
      try {
        const s = await (navigator.mediaDevices as any).getDisplayMedia({video:true,audio:true});
        try {
          const mic = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
          streamRef.current = new MediaStream([...s.getVideoTracks(),...mic.getAudioTracks()]);
        } catch { streamRef.current=s; }
        if(videoRef.current){videoRef.current.srcObject=streamRef.current;videoRef.current.play();}
        peersRef.current.forEach(pc=>{
          streamRef.current!.getTracks().forEach(track=>pc.addTrack(track,streamRef.current!));
        });
        setScreen(true); setCam(false);
        s.getVideoTracks()[0].onended=()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); setScreen(false); if(videoRef.current)videoRef.current.srcObject=null; };
      } catch {}
    } else {
      streamRef.current?.getTracks().forEach(t=>t.stop());
      if(videoRef.current) videoRef.current.srcObject=null;
      setScreen(false); streamRef.current=null;
    }
  }

  function toggleMic() {
    streamRef.current?.getAudioTracks().forEach(t=>{t.enabled=!micOn;});
    setMic(!micOn);
  }

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
        HOVER=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)",
        DROP=isDark?"#111":"#fff",DROPB=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)";
  const INP={background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"13px",fontWeight:300,padding:"8px 0",fontFamily:"inherit",flex:1} as React.CSSProperties;

  return (
    <AdminLayout>
      <div style={{padding:"clamp(24px,4vw,40px) clamp(20px,4vw,48px)",background:BG,minHeight:"100vh"}}>

        {/* Header */}
        <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              {isLive&&<div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#ef4444"}}/>}
              <h1 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>
                {t("Шууд дамжуулалт","Live Studio")}
              </h1>
              {isLive&&<span style={{fontSize:"10px",color:"rgba(239,68,68,0.8)",letterSpacing:"0.1em"}}>LIVE</span>}
            </div>
            {isLive&&(
              <div style={{fontSize:"12px",color:MUTED,display:"flex",alignItems:"center",gap:"6px"}}>
                <i className="fa-solid fa-eye" style={{fontSize:"11px"}}/>
                {viewers} {t("үзэгч","viewers")}
              </div>
            )}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:"40px"}} className="live-grid">

          {/* Left */}
          <div>
            {/* Video */}
            <div style={{background:"#000",aspectRatio:"16/9",marginBottom:"16px",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <video ref={videoRef} muted style={{width:"100%",height:"100%",display:camOn||screen?"block":"none"}} autoPlay/>
              {!camOn&&!screen&&(
                <div style={{textAlign:"center"}}>
                  <i className="fa-solid fa-video-slash" style={{fontSize:"24px",color:"rgba(255,255,255,0.2)",display:"block",marginBottom:"8px"}}/>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",fontWeight:300}}>
                    {t("Камер эсвэл дэлгэц идэвхгүй","No camera or screen active")}
                  </div>
                </div>
              )}
              {isLive&&<div style={{position:"absolute",top:"10px",left:"10px",display:"flex",alignItems:"center",gap:"5px",padding:"3px 10px",background:"rgba(239,68,68,0.9)"}}>
                <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#fff"}}/>
                <span style={{fontSize:"10px",letterSpacing:"0.1em",color:"#fff",fontWeight:500}}>LIVE</span>
              </div>}
            </div>

            {/* Stream select */}
            {streams.filter(s=>s.status!=="ended").length>0&&(
              <div style={{marginBottom:"14px"}}>
                <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>
                  {t("Stream сонгох","Select stream")}
                </label>
                <select value={active?._id||""} onChange={e=>{const s=streams.find(x=>x._id===e.target.value);setActive(s||null);}}
                  style={{...INP,border:`1px solid ${RULE}`,borderRadius:"6px",padding:"8px 12px",flex:"none",width:"100%"}}>
                  <option value="">{t("— Сонгох —","— Select —")}</option>
                  {streams.filter(s=>s.status!=="ended").map(s=>(
                    <option key={s._id} value={s._id}>{s.title} [{s.status}]</option>
                  ))}
                </select>
              </div>
            )}

            {/* Controls */}
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"14px"}}>
              {[
                {label:camOn?t("Камер хаах","Stop cam"):t("Камер","Camera"),fn:toggleCam,icon:camOn?"fa-video-slash":"fa-video",active:camOn},
                {label:screen?t("Зогсоох","Stop"):t("Дэлгэц","Screen"),fn:toggleScreen,icon:"fa-display",active:screen},
                {label:micOn?t("Дуугүй","Mute"):t("Mic","Mic"),fn:toggleMic,icon:micOn?"fa-microphone":"fa-microphone-slash",active:micOn},
              ].map((ctrl,i)=>(
                <button key={i} onClick={ctrl.fn} style={{padding:"8px 14px",border:`1px solid ${ctrl.active?"rgba(34,197,94,0.3)":RULE}`,background:ctrl.active?"rgba(34,197,94,0.08)":"transparent",color:ctrl.active?"#22c55e":MUTED,fontSize:"12px",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px"}}>
                  <i className={`fa-solid ${ctrl.icon}`} style={{fontSize:"11px"}}/>
                  {ctrl.label}
                </button>
              ))}
              {active&&(
                <button onClick={isLive?endStream:startStream}
                  disabled={!isLive&&!streamRef.current}
                  style={{padding:"8px 20px",background:isLive?"rgba(239,68,68,0.1)":"#ef4444",border:`1px solid ${isLive?"rgba(239,68,68,0.3)":"#ef4444"}`,color:isLive?"#ef4444":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",cursor:"pointer",fontFamily:"inherit",marginLeft:"auto",opacity:(!isLive&&!streamRef.current)?0.5:1}}>
                  {isLive?t("Зогсоох","End stream"):t("Эхлүүлэх","Go live")}
                </button>
              )}
            </div>
            {!isLive&&active&&!streamRef.current&&(
              <div style={{fontSize:"11px",color:MUTED,fontWeight:300}}>
                {t("Эхлүүлэхийн өмнө камер эсвэл дэлгэц идэвхжүүлнэ үү","Enable camera or screen before going live")}
              </div>
            )}
          </div>

          {/* Right: Stream list */}
          <div>
            <div style={{marginBottom:"24px",paddingBottom:"20px",borderBottom:`1px solid ${RULE}`}}>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"12px"}}>
                {t("Шинэ stream","New stream")}
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <input value={newTitle} onChange={e=>setTitle(e.target.value)} style={INP}
                  placeholder={t("Гарчиг...","Title...")}
                  onKeyDown={e=>e.key==="Enter"&&createStream()}/>
                <button onClick={createStream} disabled={!newTitle.trim()} style={{padding:"8px 14px",background:newTitle.trim()?TEXT:"transparent",color:newTitle.trim()?(isDark?"#000":"#fff"):MUTED,border:`1px solid ${newTitle.trim()?TEXT:RULE}`,borderRadius:"100px",cursor:newTitle.trim()?"pointer":"not-allowed",fontSize:"12px",fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>
                  {t("Нэмэх","Add")}
                </button>
              </div>
            </div>

            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"14px"}}>
              {t("Дамжуулалтууд","Streams")} ({streams.length})
            </div>

            {streams.length===0?(
              <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{t("Stream байхгүй","No streams yet")}</div>
            ):streams.map((s:any,i:number)=>(
              <div key={s._id||i} style={{padding:"12px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>setActive(s)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"2px"}}>
                      {s.status==="live"&&<div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>}
                      <div style={{fontSize:"13px",fontWeight:active?._id===s._id?400:300,color:active?._id===s._id?TEXT:MUTED,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</div>
                    </div>
                    <div style={{fontSize:"10px",color:s.status==="live"?"rgba(239,68,68,0.7)":MUTED,letterSpacing:"0.08em"}}>{s.status}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setConfirm(s._id);}} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"11px",padding:"2px 4px",flexShrink:0}}
                    onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                    onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                    <i className="fa-solid fa-trash"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {confirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:DROP,border:`1px solid ${DROPB}`,borderRadius:"12px",padding:"24px",width:"300px"}}>
            <div style={{fontSize:"14px",fontWeight:400,color:TEXT,marginBottom:"6px"}}>{t("Устгах уу?","Delete this stream?")}</div>
            <div style={{fontSize:"12px",color:MUTED,fontWeight:300,marginBottom:"20px"}}>{t("Устгасны дараа буцаах боломжгүй.","This action cannot be undone.")}</div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>deleteStream(confirm)} style={{flex:1,padding:"9px",background:"#ef4444",border:"none",color:"#fff",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>{t("Устгах","Delete")}</button>
              <button onClick={()=>setConfirm(null)} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${DROPB}`,color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>{t("Цуцлах","Cancel")}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@media(max-width:768px){.live-grid{grid-template-columns:1fr!important;}}`}</style>
    </AdminLayout>
  );
}
