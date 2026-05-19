"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminLivePage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [streams, setStreams] = useState<any[]>([]);
  const [active, setActive]  = useState<any>(null);
  const [isLive, setIsLive]  = useState(false);
  const [camOn, setCam]      = useState(false);
  const [micOn, setMic]      = useState(true);
  const [screen, setScreen]  = useState(false);
  const [newTitle, setTitle] = useState("");
  const videoRef   = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream|null>(null);
  const channelRef = useRef<BroadcastChannel|null>(null);
  const timerRef   = useRef<NodeJS.Timeout|null>(null);

  const t = (mn:string,en:string) => lang==="mn"?mn:en;

  useEffect(()=>{
    fetch("/api/admin/livestreams").then(r=>r.json()).then(d=>{if(Array.isArray(d))setStreams(d);}).catch(()=>{});
  },[]);

  function setupBroadcast(stream:MediaStream, id:string) {
    if(channelRef.current) channelRef.current.close();
    const channel = new BroadcastChannel(`live_stream_${id}`);
    channelRef.current = channel;
    channel.postMessage({type:"stream_start"});
    const canvas = document.createElement("canvas");
    const video  = videoRef.current;
    function sendFrame() {
      if(!video||!isLive) return;
      canvas.width=video.videoWidth||640; canvas.height=video.videoHeight||480;
      const ctx=canvas.getContext("2d");
      if(ctx){ctx.drawImage(video,0,0);channel.postMessage({type:"frame",frame:canvas.toDataURL("image/jpeg",0.5)});}
    }
    timerRef.current = setInterval(sendFrame,100);
    return ()=>{ clearInterval(timerRef.current!); channel.postMessage({type:"stream_end"}); channel.close(); };
  }

  async function createStream() {
    if(!newTitle.trim()) return;
    const res = await fetch("/api/admin/livestreams",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:newTitle,host:"Admin",seats:20})});
    const data = await res.json();
    setStreams(p=>[data,...p]); setActive(data); setTitle("");
  }

  async function toggleStream() {
    if(!active) return;
    if(!isLive) {
      await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active._id,status:"live"})});
      setIsLive(true);
      if(streamRef.current) setupBroadcast(streamRef.current,active._id);
    } else {
      if(timerRef.current) clearInterval(timerRef.current);
      if(channelRef.current){channelRef.current.postMessage({type:"stream_end"});channelRef.current.close();channelRef.current=null;}
      await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active._id,status:"ended"})});
      setIsLive(false);
    }
  }

  async function toggleCam() {
    if(!camOn) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        s.getAudioTracks().forEach(tr=>{tr.enabled=micOn;});
        streamRef.current=s;
        if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play();}
        if(isLive&&active) setupBroadcast(s,active._id);
        setCam(true); setScreen(false);
      } catch { alert(t("Камерт хандах боломжгүй","Camera access denied")); }
    } else {
      streamRef.current?.getTracks().forEach(tr=>tr.stop());
      if(videoRef.current) videoRef.current.srcObject=null;
      setCam(false);
    }
  }

  async function toggleScreen() {
    if(!screen) {
      try {
        const s = await (navigator.mediaDevices as any).getDisplayMedia({video:true,audio:true});
        try {
          const mic = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
          const combined = new MediaStream([...s.getVideoTracks(),...s.getAudioTracks(),...mic.getAudioTracks()]);
          streamRef.current=combined;
        } catch { streamRef.current=s; }
        if(videoRef.current){videoRef.current.srcObject=streamRef.current;videoRef.current.play();}
        if(isLive&&active) setupBroadcast(streamRef.current!,active._id);
        setScreen(true); setCam(false);
        s.getVideoTracks()[0].onended=()=>{ streamRef.current?.getTracks().forEach(tr=>tr.stop()); setScreen(false); if(videoRef.current)videoRef.current.srcObject=null; };
      } catch {}
    } else {
      streamRef.current?.getTracks().forEach(tr=>tr.stop());
      if(videoRef.current) videoRef.current.srcObject=null;
      setScreen(false);
    }
  }

  function toggleMic() {
    streamRef.current?.getAudioTracks().forEach(tr=>{tr.enabled=!micOn;});
    setMic(!micOn);
  }

  if(!mounted) return null;

  const BG=isDark?"#0a0a0f":"#F2F0EB",TEXT=isDark?"#fff":"#1a1a1a",
        MUTED=isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",
        RULE=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
        HOVER=isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)";
  const INP={background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,outline:"none",color:TEXT,fontSize:"13px",fontWeight:300,padding:"8px 0",fontFamily:"inherit",flex:1} as React.CSSProperties;

  return (
    <AdminLayout>
      <div style={{padding:"40px 48px",background:BG,minHeight:"100vh"}}>
        <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
          <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"6px"}}>Admin</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <h1 style={{fontSize:"28px",fontWeight:300,color:TEXT,letterSpacing:"-1px"}}>{t("Шууд дамжуулалт","Live Studio")}</h1>
            {isLive&&<div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#ef4444"}}/>
              <span style={{fontSize:"11px",color:"rgba(239,68,68,0.8)",letterSpacing:"0.08em"}}>LIVE</span>
            </div>}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:"48px"}}>
          {/* Main */}
          <div>
            {/* Video */}
            <div style={{background:"#000",aspectRatio:"16/9",marginBottom:"16px",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <video ref={videoRef} muted style={{width:"100%",height:"100%",display:camOn||screen?"block":"none"}} autoPlay/>
              {!camOn&&!screen&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",fontWeight:300}}>{t("Камер эсвэл дэлгэц хуваалцаагүй","No camera or screen active")}</div>
                </div>
              )}
              {isLive&&<div style={{position:"absolute",top:"12px",left:"12px",display:"flex",alignItems:"center",gap:"5px",padding:"4px 10px",background:"rgba(239,68,68,0.9)"}}>
                <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#fff"}}/>
                <span style={{fontSize:"10px",letterSpacing:"0.1em",color:"#fff",fontWeight:500}}>LIVE</span>
              </div>}
            </div>

            {/* Controls */}
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {[
                {label:camOn?t("Камер унтраах","Stop cam"):t("Камер асаах","Start cam"),fn:toggleCam,icon:camOn?"fa-video-slash":"fa-video",active:camOn},
                {label:screen?t("Дэлгэц зогсоох","Stop screen"):t("Дэлгэц хуваалцах","Share screen"),fn:toggleScreen,icon:screen?"fa-display":"fa-display",active:screen},
                {label:micOn?t("Микрофон унтраах","Mute"):t("Микрофон асаах","Unmute"),fn:toggleMic,icon:micOn?"fa-microphone":"fa-microphone-slash",active:micOn},
              ].map((ctrl,i)=>(
                <button key={i} onClick={ctrl.fn} style={{padding:"8px 16px",border:`1px solid ${ctrl.active?"rgba(34,197,94,0.3)":RULE}`,background:ctrl.active?"rgba(34,197,94,0.08)":"transparent",color:ctrl.active?"#22c55e":MUTED,fontSize:"12px",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px"}}>
                  <i className={`fa-solid ${ctrl.icon}`} style={{fontSize:"11px"}}/>
                  {ctrl.label}
                </button>
              ))}
              {active&&(
                <button onClick={toggleStream} style={{padding:"8px 20px",background:isLive?"rgba(239,68,68,0.1)":"#ef4444",border:`1px solid ${isLive?"rgba(239,68,68,0.3)":"#ef4444"}`,color:isLive?"#ef4444":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",cursor:"pointer",fontFamily:"inherit",marginLeft:"auto"}}>
                  {isLive?t("Зогсоох","End stream"):t("Эхлүүлэх","Go live")}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* New stream */}
            <div style={{marginBottom:"32px",paddingBottom:"24px",borderBottom:`1px solid ${RULE}`}}>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"16px"}}>{t("Шинэ дамжуулалт","New stream")}</div>
              <div style={{display:"flex",gap:"8px"}}>
                <input value={newTitle} onChange={e=>setTitle(e.target.value)} style={INP} placeholder={t("Гарчиг...","Title...")}
                  onKeyDown={e=>e.key==="Enter"&&createStream()}/>
                <button onClick={createStream} style={{padding:"8px 14px",background:TEXT,color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {t("Нэмэх","Add")}
                </button>
              </div>
            </div>

            {/* Stream list */}
            <div>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"16px"}}>{t("Дамжуулалтууд","Streams")}</div>
              {streams.length===0?(
                <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>{t("Дамжуулалт байхгүй","No streams yet")}</div>
              ):streams.map((s:any,i:number)=>(
                <div key={s._id||i} onClick={()=>setActive(s)} style={{padding:"12px 0",borderBottom:`1px solid ${RULE}`,cursor:"pointer",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:"13px",fontWeight:active?._id===s._id?400:300,color:active?._id===s._id?TEXT:MUTED,letterSpacing:"-0.2px"}}>{s.title}</div>
                    <span style={{fontSize:"9px",letterSpacing:"0.1em",color:s.status==="live"?"#ef4444":MUTED}}>{s.status}</span>
                  </div>
                  <div style={{fontSize:"11px",color:MUTED,marginTop:"2px"}}>{s.host} · {s.enrolled||0}/{s.seats||20}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
