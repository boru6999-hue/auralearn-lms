"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminLivePage() {
  const { lang } = useLang();
  const { isDark, mounted } = useTheme();
  const [streams, setStreams] = useState<any[]>([]);
  const [isLive, setIsLive]  = useState(false);
  const [active, setActive]  = useState<any>(null);
  const [camOn, setCam]      = useState(false);
  const [micOn, setMic]      = useState(true);
  const [screen, setScreen]  = useState(false);
  const [newTitle, setTitle] = useState("");
  const [confirm, setConfirm]= useState<string|null>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream|null>(null);
  const channelRef = useRef<BroadcastChannel|null>(null);
  const timerRef   = useRef<NodeJS.Timeout|null>(null);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

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
      if(!video) return;
      canvas.width=video.videoWidth||640; canvas.height=video.videoHeight||480;
      const ctx=canvas.getContext("2d");
      if(ctx){ctx.drawImage(video,0,0);channel.postMessage({type:"frame",frame:canvas.toDataURL("image/jpeg",0.5)});}
    }
    timerRef.current = setInterval(sendFrame,100);
  }

  async function createStream() {
    if(!newTitle.trim()) return;
    const res = await fetch("/api/admin/livestreams",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:newTitle,host:"Admin",seats:20})});
    const data = await res.json();
    setStreams(p=>[data,...p]); setTitle("");
  }

  async function deleteStream(id:string) {
    // If this is the active stream, end it first
    if(active?._id===id) await endStream();
    await fetch("/api/admin/livestreams",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setStreams(p=>p.filter(s=>s._id!==id));
    setConfirm(null);
  }

  async function startStream() {
    if(!active) return;
    await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active._id,status:"live"})});
    setIsLive(true);
    if(streamRef.current) setupBroadcast(streamRef.current,active._id);
    setStreams(p=>p.map(s=>s._id===active._id?{...s,status:"live"}:s));
  }

  async function endStream() {
    if(timerRef.current) clearInterval(timerRef.current);
    if(channelRef.current){channelRef.current.postMessage({type:"stream_end"});channelRef.current.close();channelRef.current=null;}
    if(active) {
      await fetch("/api/admin/livestreams",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active._id,status:"ended"})});
      setStreams(p=>p.map(s=>s._id===active._id?{...s,status:"ended"}:s));
    }
    setIsLive(false);
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
          streamRef.current = new MediaStream([...s.getVideoTracks(),...s.getAudioTracks(),...mic.getAudioTracks()]);
        } catch { streamRef.current=s; }
        if(videoRef.current){videoRef.current.srcObject=streamRef.current;videoRef.current.play();}
        if(isLive&&active) setupBroadcast(streamRef.current!,active._id);
        setScreen(true); setCam(false);
        s.getVideoTracks()[0].onended=()=>{streamRef.current?.getTracks().forEach(tr=>tr.stop());setScreen(false);if(videoRef.current)videoRef.current.srcObject=null;};
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

  const liveStreams = streams.filter(s=>s.status==="live");
  const otherStreams = streams.filter(s=>s.status!=="live");

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
                {t("Шууд дамжуулалт","Live Studio","ライブスタジオ","라이브 스튜디오","Studio en direct","Live-Studio","直播工作室")}
              </h1>
              {isLive&&<span style={{fontSize:"10px",color:"rgba(239,68,68,0.8)",letterSpacing:"0.1em"}}>LIVE</span>}
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:"40px"}} className="live-grid">

          {/* Left: Video + Controls */}
          <div>
            {/* Video */}
            <div style={{background:"#000",aspectRatio:"16/9",marginBottom:"16px",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <video ref={videoRef} muted style={{width:"100%",height:"100%",display:camOn||screen?"block":"none"}} autoPlay/>
              {!camOn&&!screen&&(
                <div style={{textAlign:"center"}}>
                  <i className="fa-solid fa-video-slash" style={{fontSize:"24px",color:"rgba(255,255,255,0.2)",display:"block",marginBottom:"8px"}}/>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",fontWeight:300}}>
                    {t("Камер эсвэл дэлгэц идэвхгүй","No camera or screen active","カメラまたは画面共有なし","카메라 또는 화면 공유 없음","Pas de caméra ou écran","Kein Kamera oder Bildschirm","无摄像头或屏幕")}
                  </div>
                </div>
              )}
              {isLive&&<div style={{position:"absolute",top:"10px",left:"10px",display:"flex",alignItems:"center",gap:"5px",padding:"3px 10px",background:"rgba(239,68,68,0.9)"}}>
                <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#fff"}}/>
                <span style={{fontSize:"10px",letterSpacing:"0.1em",color:"#fff",fontWeight:500}}>LIVE</span>
              </div>}
            </div>

            {/* Stream select */}
            {streams.length>0&&(
              <div style={{marginBottom:"14px"}}>
                <label style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,display:"block",marginBottom:"6px"}}>
                  {t("Идэвхтэй stream","Active stream","アクティブなStream","활성 스트림","Stream actif","Aktiver Stream","活跃直播")}
                </label>
                <select value={active?._id||""} onChange={e=>{const s=streams.find(x=>x._id===e.target.value);setActive(s||null);}}
                  style={{...INP,border:`1px solid ${RULE}`,borderRadius:"6px",padding:"8px 12px",flex:"none",width:"100%"}}>
                  <option value="">{t("Stream сонгох","Select stream","Streamを選択","스트림 선택","Sélectionner un stream","Stream wählen","选择直播")}</option>
                  {streams.filter(s=>s.status!=="ended").map(s=>(
                    <option key={s._id} value={s._id}>{s.title} [{s.status}]</option>
                  ))}
                </select>
              </div>
            )}

            {/* Controls */}
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"14px"}}>
              {[
                {label:camOn?t("Камер хаах","Stop cam","カメラ停止","카메라 끄기","Arrêter cam","Kamera aus","关闭摄像头"):t("Камер","Camera","カメラ","카메라","Caméra","Kamera","摄像头"),fn:toggleCam,icon:camOn?"fa-video-slash":"fa-video",active:camOn},
                {label:screen?t("Зогсоох","Stop","停止","중지","Arrêter","Stoppen","停止"):t("Дэлгэц","Screen","画面","화면","Écran","Bildschirm","屏幕"),fn:toggleScreen,icon:"fa-display",active:screen},
                {label:micOn?t("Дуугүй","Mute","ミュート","음소거","Muet","Stumm","静音"):t("Mic","Mic","マイク","마이크","Micro","Mikrofon","麦克风"),fn:toggleMic,icon:micOn?"fa-microphone":"fa-microphone-slash",active:micOn},
              ].map((ctrl,i)=>(
                <button key={i} onClick={ctrl.fn} style={{padding:"8px 14px",border:`1px solid ${ctrl.active?"rgba(34,197,94,0.3)":RULE}`,background:ctrl.active?"rgba(34,197,94,0.08)":"transparent",color:ctrl.active?"#22c55e":MUTED,fontSize:"12px",borderRadius:"100px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"6px"}}>
                  <i className={`fa-solid ${ctrl.icon}`} style={{fontSize:"11px"}}/>
                  {ctrl.label}
                </button>
              ))}
              {active&&(
                <button onClick={isLive?endStream:startStream} style={{padding:"8px 20px",background:isLive?"rgba(239,68,68,0.1)":"#ef4444",border:`1px solid ${isLive?"rgba(239,68,68,0.3)":"#ef4444"}`,color:isLive?"#ef4444":"#fff",fontSize:"12px",fontWeight:500,borderRadius:"100px",cursor:"pointer",fontFamily:"inherit",marginLeft:"auto"}}>
                  {isLive?t("Зогсоох","End stream","終了","종료","Terminer","Beenden","结束"):t("Эхлүүлэх","Go live","ライブ開始","라이브 시작","Démarrer","Starten","开始直播")}
                </button>
              )}
            </div>
          </div>

          {/* Right: Stream list */}
          <div>
            {/* New stream */}
            <div style={{marginBottom:"24px",paddingBottom:"20px",borderBottom:`1px solid ${RULE}`}}>
              <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"12px"}}>
                {t("Шинэ stream","New stream","新しいStream","새 스트림","Nouveau stream","Neuer Stream","新直播")}
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <input value={newTitle} onChange={e=>setTitle(e.target.value)} style={INP}
                  placeholder={t("Гарчиг...","Title...","タイトル...","제목...","Titre...","Titel...","标题...")}
                  onKeyDown={e=>e.key==="Enter"&&createStream()}/>
                <button onClick={createStream} disabled={!newTitle.trim()} style={{padding:"8px 14px",background:newTitle.trim()?TEXT:"transparent",color:newTitle.trim()?(isDark?"#000":"#fff"):MUTED,border:`1px solid ${newTitle.trim()?TEXT:RULE}`,borderRadius:"100px",cursor:newTitle.trim()?"pointer":"not-allowed",fontSize:"12px",fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>
                  {t("Нэмэх","Add","追加","추가","Ajouter","Hinzufügen","添加")}
                </button>
              </div>
            </div>

            {/* Streams */}
            <div style={{fontSize:"10px",letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:"14px"}}>
              {t("Дамжуулалтууд","Streams","Streams","스트림","Streams","Streams","直播列表")}
              {streams.length>0&&<span style={{marginLeft:"6px",fontWeight:400}}>({streams.length})</span>}
            </div>

            {streams.length===0?(
              <div style={{fontSize:"12px",color:MUTED,fontWeight:300}}>
                {t("Stream байхгүй","No streams yet","まだStreamなし","스트림 없음","Aucun stream","Keine Streams","暂无直播")}
              </div>
            ):streams.map((s:any,i:number)=>(
              <div key={s._id||i} style={{padding:"12px 0",borderBottom:`1px solid ${RULE}`,transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=HOVER}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
                  <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setActive(s)}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"2px"}}>
                      {s.status==="live"&&<div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>}
                      <div style={{fontSize:"13px",fontWeight:active?._id===s._id?400:300,color:active?._id===s._id?TEXT:MUTED,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</div>
                    </div>
                    <div style={{fontSize:"10px",color:s.status==="live"?"rgba(239,68,68,0.7)":MUTED,letterSpacing:"0.08em"}}>{s.status} · {s.host||"Admin"}</div>
                  </div>
                  <button onClick={()=>setConfirm(s._id)} style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"11px",padding:"2px 4px",flexShrink:0,opacity:0.6}}
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

      {/* Delete confirm modal */}
      {confirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:isDark?"#111":"#fff",border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"}`,borderRadius:"12px",padding:"24px",width:"300px"}}>
            <div style={{fontSize:"14px",fontWeight:400,color:TEXT,marginBottom:"6px"}}>
              {t("Устгах уу?","Delete this stream?","削除しますか?","삭제하시겠습니까?","Supprimer ce stream?","Stream löschen?","删除此直播?")}
            </div>
            <div style={{fontSize:"12px",color:MUTED,marginBottom:"20px",fontWeight:300}}>
              {t("Устгасны дараа буцаах боломжгүй.","This action cannot be undone.","この操作は元に戻せません。","이 작업은 되돌릴 수 없습니다.","Cette action est irréversible.","Diese Aktion kann nicht rückgängig gemacht werden.","此操作无法撤销。")}
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>deleteStream(confirm)} style={{flex:1,padding:"9px",background:"#ef4444",border:"none",color:"#fff",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>
                {t("Устгах","Delete","削除","삭제","Supprimer","Löschen","删除")}
              </button>
              <button onClick={()=>setConfirm(null)} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"}`,color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                {t("Цуцлах","Cancel","キャンセル","취소","Annuler","Abbrechen","取消")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .live-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </AdminLayout>
  );
}
