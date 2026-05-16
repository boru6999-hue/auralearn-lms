"use client";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function LivePage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoad]   = useState(true);
  const [modal, setModal]    = useState(false);
  const [form, setForm]      = useState({ title:"", host:"", scheduled:"", seats:"20" });
  const [studio, setStudio]  = useState(false);
  const [active, setActive]  = useState<any>(null);
  const [camOn, setCamOn]    = useState(false);
  const [micOn, setMicOn]    = useState(true);
  const [deafen, setDeafen]  = useState(false);
  const [screen, setScreen]  = useState(false);
  const [viewers, setViewers]= useState(0);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream|null>(null);
  const channelRef = useRef<BroadcastChannel|null>(null);
  const cleanupRef = useRef<(()=>void)|null>(null);

  const t=(mn:string,en:string)=>lang==="mn"?mn:en;
  const BG    =isDark?"#0a0a0a":"#f5f5f5";
  const CARD  =isDark?"rgba(255,255,255,0.04)":"#fff";
  const BORDER=isDark?"#1e1e1e":"#e5e5e5";
  const TEXT  =isDark?"#fff":"#000";
  const MUTED =isDark?"#555":"#888";
  const INP={width:"100%",height:"38px",background:isDark?"#1a1a1a":"#f0f0f0",border:`1px solid ${BORDER}`,borderRadius:"8px",padding:"0 12px",color:TEXT,fontSize:"13px",outline:"none",boxSizing:"border-box"} as React.CSSProperties;

  useEffect(()=>{
    fetch("/api/admin/livestreams").then(r=>r.json()).then(d=>{if(Array.isArray(d))setStreams(d);}).catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  useEffect(()=>{
    if(!studio) return;
    const iv=setInterval(()=>setViewers(v=>Math.max(0,v+Math.floor(Math.random()*3-1))),3000);
    return()=>clearInterval(iv);
  },[studio]);

  function setupBroadcast(mediaStream: MediaStream, streamId: string, title: string, host: string) {
    if (channelRef.current) channelRef.current.close();
    const channel = new BroadcastChannel(`live_stream_${streamId}`);
    channelRef.current = channel;
    const video = document.createElement('video');
    video.srcObject = mediaStream; video.muted = true; video.play();
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 720;
    const ctx = canvas.getContext('2d')!;
    channel.postMessage({ type: 'stream_start', streamId, title, host });
    const frameInterval = setInterval(()=>{
      if (!mediaStream.active) { clearInterval(frameInterval); return; }
      try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); channel.postMessage({ type: 'frame', frame: canvas.toDataURL('image/jpeg', 0.5) }); } catch {}
    }, 66);
    return ()=>{ clearInterval(frameInterval); channel.postMessage({ type: 'stream_end' }); channel.close(); };
  }

  async function startStudio(s: any) {
    await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:s._id,status:"live"})});
    const bc = new BroadcastChannel('live_streams_list');
    bc.postMessage({ type: 'stream_added', streamId: s._id, title: s.title, host: s.host }); bc.close();
    setActive(s); setStudio(true); setViewers(s.enrolled||0);
    setStreams(p=>p.map(x=>x._id===s._id?{...x,status:"live"}:x));
  }

  async function endStudio() {
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current=null; }
    if (channelRef.current) { channelRef.current.close(); channelRef.current=null; }
    if (active) {
      await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active._id,status:"ended"})});
      const bc = new BroadcastChannel('live_streams_list');
      bc.postMessage({ type: 'stream_ended', streamId: active._id }); bc.close();
    }
    streamRef.current?.getTracks().forEach(t=>t.stop());
    if (videoRef.current) videoRef.current.srcObject=null;
    setCamOn(false); setScreen(false); setStudio(false);
    setStreams(p=>p.map(x=>x._id===active._id?{...x,status:"ended"}:x));
    setActive(null);
  }

  async function toggleCam() {
    if (!camOn) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        streamRef.current=s;
        // Set mic state based on current micOn
        s.getAudioTracks().forEach(t=>{t.enabled=micOn&&!deafen;});
        if (videoRef.current) { videoRef.current.srcObject=s; videoRef.current.play(); }
        if (cleanupRef.current) cleanupRef.current();
        cleanupRef.current = setupBroadcast(s, active._id, active.title, active.host);
        setCamOn(true); setScreen(false);
      } catch(err:any) {
        // Try video only if audio fails
        try {
          const s = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
          streamRef.current=s;
          if (videoRef.current) { videoRef.current.srcObject=s; videoRef.current.play(); }
          if (cleanupRef.current) cleanupRef.current();
          cleanupRef.current = setupBroadcast(s, active._id, active.title, active.host);
          setCamOn(true); setScreen(false);
        } catch { alert(t("Камерт хандах боломжгүй","Camera access denied")); }
      }
    } else {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current=null; }
      streamRef.current?.getTracks().forEach(t=>t.stop());
      if (videoRef.current) videoRef.current.srcObject=null;
      if (channelRef.current) channelRef.current.postMessage({type:'stream_end'});
      setCamOn(false);
    }
  }

  async function toggleScreen() {
    if (!screen) {
      try {
        // Get screen + system audio
        const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({video:true, audio:true});
        
        // Also get mic audio if micOn
        let finalStream = screenStream;
        if (micOn && !deafen) {
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({audio:true, video:false});
            // Combine screen video + mic audio tracks
            const tracks = [
              ...screenStream.getVideoTracks(),
              ...screenStream.getAudioTracks(),
              ...micStream.getAudioTracks(),
            ];
            finalStream = new MediaStream(tracks);
          } catch {
            // Use screen only if mic fails
            finalStream = screenStream;
          }
        }

        streamRef.current = finalStream;
        if (videoRef.current) { videoRef.current.srcObject=finalStream; videoRef.current.play(); }
        if (cleanupRef.current) cleanupRef.current();
        cleanupRef.current = setupBroadcast(finalStream, active._id, active.title, active.host);
        setScreen(true); setCamOn(false);

        screenStream.getVideoTracks()[0].onended = ()=>{
          if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current=null; }
          streamRef.current?.getTracks().forEach(t=>t.stop());
          setScreen(false);
          if (videoRef.current) videoRef.current.srcObject=null;
        };
      } catch {}
    } else {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current=null; }
      streamRef.current?.getTracks().forEach(t=>t.stop());
      if (videoRef.current) videoRef.current.srcObject=null;
      setScreen(false);
    }
  }

  function toggleMic() {
    const newMicOn = !micOn;
    streamRef.current?.getAudioTracks().forEach(t=>{t.enabled=newMicOn&&!deafen;});
    setMicOn(newMicOn);
  }

  async function addStream() {
    const res=await fetch("/api/admin/livestreams",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,seats:Number(form.seats)})});
    const data=await res.json();
    setStreams(p=>[data,...p]);
    setModal(false); setForm({title:"",host:"",scheduled:"",seats:"20"});
  }

  if (!mounted) return <div style={{minHeight:"100vh",background:"#000"}}/>;

  const CONTROLS = [
    {key:"cam",   icon:camOn?"fa-video":"fa-video-slash",         on:camOn,         action:toggleCam,              label:t(camOn?"Хаах":"Камер",camOn?"Off":"Cam")},
    {key:"mic",   icon:micOn?"fa-microphone":"fa-microphone-slash",on:micOn&&!deafen,action:toggleMic,             label:t(micOn?"Mute":"Mic","Mute")},
    {key:"screen",icon:"fa-display",                               on:screen,        action:toggleScreen,          label:t(screen?"Зогсоох":"Дэлгэц",screen?"Stop":"Screen")},
    {key:"deafen",icon:deafen?"fa-volume-xmark":"fa-volume-high", on:!deafen,       action:()=>setDeafen(!deafen), label:"Deafen"},
  ];

  const FORM_FIELDS = [
    {key:"title",    label:t("Гарчиг","Title"),  value:form.title,    type:"text",   set:(v:string)=>setForm(f=>({...f,title:v}))},
    {key:"host",     label:t("Багш","Host"),     value:form.host,     type:"text",   set:(v:string)=>setForm(f=>({...f,host:v}))},
    {key:"scheduled",label:t("Цаг","Time"),      value:form.scheduled,type:"text",   set:(v:string)=>setForm(f=>({...f,scheduled:v}))},
    {key:"seats",    label:t("Суудал","Seats"),  value:form.seats,    type:"number", set:(v:string)=>setForm(f=>({...f,seats:v}))},
  ];

  // Studio view
  if (studio && active) return (
    <AdminLayout>
      <div style={{padding:"20px 24px",background:BG,minHeight:"100vh",display:"flex",flexDirection:"column",gap:"14px"}}>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#ef4444",animation:"pulse 1s infinite",display:"inline-block"}}/>
            <span style={{color:TEXT,fontWeight:800,fontSize:"16px"}}>{active.title}</span>
            <span style={{background:"rgba(239,68,68,0.15)",color:"#ef4444",fontSize:"10px",padding:"2px 8px",borderRadius:"5px",fontWeight:700}}>LIVE</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
            <span style={{color:MUTED,fontSize:"12px"}}><i className="fa-solid fa-eye" style={{marginRight:"5px"}}/>{viewers} {t("үзэгч","viewers")}</span>
            <button onClick={endStudio} style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",padding:"7px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:600}}>
              <i className="fa-solid fa-stop" style={{marginRight:"5px"}}/>{t("Дуусгах","End Stream")}
            </button>
          </div>
        </div>

        <div style={{background:"#000",borderRadius:"14px",border:`1px solid ${BORDER}`,position:"relative",overflow:"hidden",aspectRatio:"16/9",maxHeight:"calc(100vh - 200px)"}}>
          <video ref={videoRef} autoPlay muted style={{width:"100%",height:"100%",objectFit:"contain"}}/>
          {!camOn&&!screen&&(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px"}}>
              <i className="fa-solid fa-video-slash" style={{fontSize:"36px",color:"#333"}}/>
              <span style={{color:"#555",fontSize:"13px"}}>{t("Камер эсвэл дэлгэц идэвхжүүлнэ үү","Enable camera or screen share")}</span>
            </div>
          )}
          <div style={{position:"absolute",top:"12px",left:"12px",display:"flex",gap:"6px"}}>
            {(camOn||screen)&&<span key="cam-badge" style={{background:"rgba(52,211,153,0.9)",color:"#000",fontSize:"10px",padding:"3px 8px",borderRadius:"5px",fontWeight:700}}>{screen?"SCREEN":"CAM"}</span>}
            {micOn&&!deafen&&<span key="mic-badge" style={{background:"rgba(52,211,153,0.9)",color:"#000",fontSize:"10px",padding:"3px 8px",borderRadius:"5px",fontWeight:700}}>MIC</span>}
            {deafen&&<span key="deafen-badge" style={{background:"rgba(248,113,113,0.9)",color:"#fff",fontSize:"10px",padding:"3px 8px",borderRadius:"5px",fontWeight:700}}>DEAFEN</span>}
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:"16px"}}>
          {CONTROLS.map(btn=>(
            <div key={btn.key} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px"}}>
              <button onClick={btn.action} style={{width:"52px",height:"52px",borderRadius:"50%",border:`1px solid ${btn.on?"#34d399":BORDER}`,background:btn.on?"rgba(52,211,153,0.1)":(isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"),color:btn.on?"#34d399":MUTED,cursor:"pointer",fontSize:"17px",transition:"all 0.15s"}}>
                <i className={`fa-solid ${btn.icon}`}/>
              </button>
              <span style={{color:MUTED,fontSize:"9px"}}>{btn.label.toUpperCase().slice(0,8)}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );

  // List view
  return (
    <AdminLayout>
      <div style={{padding:"28px 32px",background:BG,minHeight:"100vh"}}>
        <style>{`@keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"3px"}}>
              <span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#ef4444",display:"inline-block",animation:"pulse2 1.5s infinite"}}/>
              <h1 style={{fontSize:"20px",fontWeight:800,color:TEXT}}>{t("Шууд дамжуулалт","Live Stream")}</h1>
            </div>
            <p style={{color:MUTED,fontSize:"12px"}}>
              {streams.filter(s=>s.status==="live").length} live · {streams.filter(s=>s.status==="scheduled").length} {t("төлөвлөгдсөн","scheduled")}
            </p>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>{setLoad(true);fetch("/api/admin/livestreams").then(r=>r.json()).then(d=>{if(Array.isArray(d))setStreams(d);}).finally(()=>setLoad(false));}} style={{background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"7px 12px",borderRadius:"8px",cursor:"pointer",fontSize:"12px"}}>
              <i className="fa-solid fa-rotate-right"/>
            </button>
            <button onClick={()=>setModal(true)} style={{background:isDark?"#1a1a1a":"#000",color:"#fff",border:"none",padding:"8px 16px",borderRadius:"8px",fontSize:"13px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}}>
              <i className="fa-solid fa-circle-dot" style={{color:"#ef4444"}}/>{t("Шинэ stream","New Stream")}
            </button>
          </div>
        </div>

        {loading?(
          <div style={{textAlign:"center",padding:"60px",color:MUTED}}>
            <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"24px",display:"block",marginBottom:"10px"}}/>
          </div>
        ):(
          <>
            {streams.filter(s=>s.status==="live").map(s=>(
              <div key={s._id} style={{background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"12px",padding:"16px 20px",marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <i className="fa-solid fa-circle-dot" style={{color:"#ef4444",fontSize:"18px"}}/>
                  <div>
                    <div style={{color:TEXT,fontWeight:700,fontSize:"14px"}}>{s.title}</div>
                    <div style={{color:MUTED,fontSize:"12px"}}>{s.host}</div>
                  </div>
                </div>
                <button onClick={()=>startStudio(s)} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",padding:"7px 14px",borderRadius:"7px",cursor:"pointer",fontSize:"12px",fontWeight:600}}>
                  <i className="fa-solid fa-tower-broadcast" style={{marginRight:"5px"}}/>Studio
                </button>
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
              {streams.filter(s=>s.status!=="live").map(s=>(
                <div key={s._id} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"12px",padding:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                    <span style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",color:MUTED,fontSize:"10px",padding:"2px 7px",borderRadius:"4px",fontWeight:600}}>{s.status?.toUpperCase()}</span>
                    <button onClick={async()=>{await fetch("/api/admin/livestreams",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:s._id})});setStreams(p=>p.filter(x=>x._id!==s._id));}} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:"11px"}}>
                      <i className="fa-solid fa-trash"/>
                    </button>
                  </div>
                  <div style={{color:TEXT,fontWeight:700,fontSize:"13px",marginBottom:"6px"}}>{s.title}</div>
                  <div style={{color:MUTED,fontSize:"11px",marginBottom:"3px"}}><i className="fa-solid fa-user" style={{marginRight:"4px"}}/>{s.host}</div>
                  <div style={{color:MUTED,fontSize:"11px",marginBottom:"10px"}}><i className="fa-solid fa-clock" style={{marginRight:"4px"}}/>{s.scheduled}</div>
                  {s.status==="scheduled"&&(
                    <button onClick={()=>startStudio(s)} style={{width:"100%",background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",border:`1px solid ${BORDER}`,color:MUTED,padding:"7px",borderRadius:"7px",cursor:"pointer",fontSize:"12px",fontWeight:600}}>
                      <i className="fa-solid fa-tower-broadcast" style={{marginRight:"5px"}}/>{t("Эхлүүлэх","Start")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:isDark?"#111":"#fff",border:`1px solid ${BORDER}`,borderRadius:"14px",padding:"24px",width:"360px"}}>
            <h2 style={{color:TEXT,fontSize:"15px",fontWeight:700,marginBottom:"16px"}}>{t("Шинэ Live Stream","New Live Stream")}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {FORM_FIELDS.map(field=>(
                <div key={field.key}>
                  <label style={{color:MUTED,fontSize:"11px",display:"block",marginBottom:"4px"}}>{field.label}</label>
                  <input value={field.value} onChange={e=>field.set(e.target.value)} type={field.type} style={INP}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
              <button onClick={addStream} style={{flex:1,background:isDark?"#222":"#000",color:"#fff",border:"none",padding:"10px",borderRadius:"8px",fontWeight:600,cursor:"pointer"}}>{t("Нэмэх","Add")}</button>
              <button onClick={()=>setModal(false)} style={{flex:1,background:"none",border:`1px solid ${BORDER}`,color:MUTED,padding:"10px",borderRadius:"8px",cursor:"pointer"}}>{t("Цуцлах","Cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
