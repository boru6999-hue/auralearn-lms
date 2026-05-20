"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useSession } from "next-auth/react";

export default function AIFloatButton() {
  const { isDark, mounted } = useTheme();
  const { lang } = useLang();
  const { data: session } = useSession();
  const [open, setOpen]     = useState(false);
  const [tab, setTab]       = useState<"chat"|"quiz"|"recommend">("chat");
  const [messages, setMsgs] = useState<{role:string,text:string}[]>([]);
  const [input, setInput]   = useState("");
  const [loading, setLoad]  = useState(false);
  const [quiz, setQuiz]     = useState<any[]>([]);
  const [quizTopic, setQT]  = useState("");
  const [answers, setAns]   = useState<Record<number,number>>({});
  const [checked, setCheck] = useState(false);
  const [recs, setRecs]     = useState<any[]>([]);
  const [recLoading, setRL] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = (mn:string,en:string,ja="",ko="",fr="",de="",zh="") =>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  if(!mounted||!session) return null;

  const BG    = isDark?"#0a0a0f":"#F2F0EB";
  const TEXT  = isDark?"#fff":"#1a1a1a";
  const MUTED = isDark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)";
  const RULE  = isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)";
  const PANEL = isDark?"#111":"#fff";

  async function sendChat() {
    if(!input.trim()||loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(p=>[...p,{role:"user",text:userMsg}]);
    setLoad(true);
    try {
      const res = await fetch("/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:userMsg})});
      const data = await res.json();
      setMsgs(p=>[...p,{role:"assistant",text:data.reply||t("Алдаа гарлаа","Error occurred")}]);
    } catch {
      setMsgs(p=>[...p,{role:"assistant",text:t("Алдаа гарлаа","Error occurred")}]);
    }
    setLoad(false);
  }

  async function genQuiz() {
    if(!quizTopic.trim()||loading) return;
    setLoad(true); setQuiz([]); setAns({}); setCheck(false);
    try {
      const res = await fetch("/api/ai/quiz",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:quizTopic,count:5})});
      const data = await res.json();
      setQuiz(data.questions||[]);
    } catch {}
    setLoad(false);
  }

  async function loadRecs() {
    setRL(true);
    try {
      const res = await fetch("/api/ai/recommend");
      const data = await res.json();
      setRecs(data.recommendations||[]);
    } catch {}
    setRL(false);
  }

  const score = quiz.length>0?quiz.filter((q:any,i:number)=>answers[i]===q.answer).length:0;

  return (
    <>
      {/* Float button */}
      <button onClick={()=>setOpen(!open)} style={{
        position:"fixed",bottom:"24px",right:"24px",zIndex:500,
        width:"48px",height:"48px",borderRadius:"50%",
        background:isDark?"#fff":"#1a1a1a",
        color:isDark?"#000":"#fff",
        border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:isDark?"0 4px 20px rgba(255,255,255,0.1)":"0 4px 20px rgba(0,0,0,0.15)",
        transition:"transform 0.2s",
        fontSize:"18px",
      }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        <i className={`fa-solid ${open?"fa-xmark":"fa-robot"}`}/>
      </button>

      {/* Panel */}
      {open&&(
        <div style={{
          position:"fixed",bottom:"82px",right:"24px",zIndex:499,
          width:"clamp(300px,90vw,380px)",height:"520px",
          background:PANEL,border:`1px solid ${RULE}`,
          borderRadius:"16px",display:"flex",flexDirection:"column",
          boxShadow:isDark?"0 8px 40px rgba(0,0,0,0.6)":"0 8px 40px rgba(0,0,0,0.12)",
          overflow:"hidden",fontFamily:"'Inter',-apple-system,sans-serif",
        }}>

          {/* Header */}
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${RULE}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:PANEL,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <i className="fa-solid fa-robot" style={{fontSize:"14px",color:MUTED}}/>
              <span style={{fontSize:"13px",fontWeight:500,color:TEXT}}>
                {t("AI туслагч","AI Assistant","AIアシスタント","AI 어시스턴트","Assistant IA","KI-Assistent","AI助手")}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${RULE}`,flexShrink:0}}>
            {([
              {key:"chat",label:t("Chat","Chat","チャット","채팅","Chat","Chat","聊天")},
              {key:"quiz",label:t("Quiz","Quiz","クイズ","퀴즈","Quiz","Quiz","测验")},
              {key:"recommend",label:t("Зөвлөгөө","Recommend","おすすめ","추천","Recomm.","Empf.","推荐")},
            ] as const).map(tb=>(
              <button key={tb.key} onClick={()=>setTab(tb.key)} style={{
                flex:1,padding:"10px 4px",border:"none",background:"transparent",
                fontSize:"11px",fontWeight:tab===tb.key?500:300,
                color:tab===tb.key?TEXT:MUTED,
                borderBottom:tab===tb.key?`2px solid ${TEXT}`:"2px solid transparent",
                cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.02em",
              }}>{tb.label}</button>
            ))}
          </div>

          {/* Chat tab */}
          {tab==="chat"&&(
            <>
              <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:"10px"}}>
                {messages.length===0&&(
                  <div style={{textAlign:"center",paddingTop:"40px"}}>
                    <i className="fa-solid fa-comments" style={{fontSize:"28px",color:MUTED,marginBottom:"10px",display:"block"}}/>
                    <div style={{fontSize:"12px",color:MUTED,fontWeight:300,lineHeight:1.6}}>
                      {t("Ямар ч асуулт асуугаарай","Ask me anything about your courses","何でも聞いてください","무엇이든 물어보세요","Posez n'importe quelle question","Stellen Sie eine Frage","请随便提问")}
                    </div>
                  </div>
                )}
                {messages.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{
                      maxWidth:"80%",padding:"9px 13px",borderRadius:"12px",
                      background:m.role==="user"?(isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)"):isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)",
                      fontSize:"12px",color:TEXT,fontWeight:300,lineHeight:1.6,
                      border:`1px solid ${RULE}`,
                    }}>{m.text}</div>
                  </div>
                ))}
                {loading&&(
                  <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 0"}}>
                    <div style={{width:"5px",height:"5px",borderRadius:"50%",background:MUTED,animation:"pulse 1s infinite"}}/>
                    <div style={{width:"5px",height:"5px",borderRadius:"50%",background:MUTED,animation:"pulse 1s 0.2s infinite"}}/>
                    <div style={{width:"5px",height:"5px",borderRadius:"50%",background:MUTED,animation:"pulse 1s 0.4s infinite"}}/>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
              <div style={{padding:"12px 14px",borderTop:`1px solid ${RULE}`,display:"flex",gap:"8px",flexShrink:0}}>
                <input value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder={t("Асуулт бичих...","Type a question...","質問を入力...","질문 입력...","Votre question...","Ihre Frage...","输入问题...")}
                  style={{flex:1,background:"transparent",border:`1px solid ${RULE}`,borderRadius:"8px",padding:"8px 12px",color:TEXT,fontSize:"12px",outline:"none",fontFamily:"inherit",fontWeight:300}}/>
                <button onClick={sendChat} disabled={loading||!input.trim()} style={{width:"34px",height:"34px",border:"none",background:input.trim()?(isDark?"#fff":"#1a1a1a"):"transparent",borderRadius:"8px",cursor:input.trim()?"pointer":"not-allowed",color:input.trim()?(isDark?"#000":"#fff"):MUTED,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${RULE}`}}>
                  <i className="fa-solid fa-paper-plane" style={{fontSize:"12px"}}/>
                </button>
              </div>
            </>
          )}

          {/* Quiz tab */}
          {tab==="quiz"&&(
            <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
              {quiz.length===0?(
                <>
                  <div style={{fontSize:"12px",color:MUTED,fontWeight:300,marginBottom:"14px",lineHeight:1.6}}>
                    {t("Сэдэв оруулаад Quiz үүсгэнэ","Enter a topic to generate a quiz","トピックを入力してクイズを生成","주제를 입력하여 퀴즈 생성","Entrez un sujet pour générer un quiz","Thema eingeben für Quiz","输入主题生成测验")}
                  </div>
                  <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
                    <input value={quizTopic} onChange={e=>setQT(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&genQuiz()}
                      placeholder={t("Жишээ: React hooks","e.g. React hooks","例: React hooks","예: React hooks","Ex: Crochets React","z.B. React hooks","例: React hooks")}
                      style={{flex:1,background:"transparent",border:`1px solid ${RULE}`,borderRadius:"8px",padding:"8px 12px",color:TEXT,fontSize:"12px",outline:"none",fontFamily:"inherit"}}/>
                    <button onClick={genQuiz} disabled={loading||!quizTopic.trim()} style={{padding:"8px 14px",border:`1px solid ${RULE}`,background:quizTopic.trim()?(isDark?"#fff":"#1a1a1a"):"transparent",color:quizTopic.trim()?(isDark?"#000":"#fff"):MUTED,borderRadius:"8px",cursor:"pointer",fontSize:"11px",fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap"}}>
                      {loading?<i className="fa-solid fa-spinner fa-spin"/>:t("Үүсгэх","Generate","生成","생성","Générer","Generieren","生成")}
                    </button>
                  </div>
                </>
              ):(
                <>
                  {!checked?(
                    <>
                      {quiz.map((q:any,i:number)=>(
                        <div key={i} style={{marginBottom:"16px"}}>
                          <div style={{fontSize:"12px",fontWeight:500,color:TEXT,marginBottom:"8px",lineHeight:1.5}}>{i+1}. {q.question}</div>
                          {q.options.map((opt:string,j:number)=>(
                            <button key={j} onClick={()=>setAns(p=>({...p,[i]:j}))} style={{
                              display:"block",width:"100%",textAlign:"left",padding:"7px 12px",marginBottom:"4px",
                              border:`1px solid ${answers[i]===j?(isDark?"rgba(255,255,255,0.3)":"rgba(0,0,0,0.3)"):RULE}`,
                              background:answers[i]===j?(isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.04)"):"transparent",
                              borderRadius:"8px",cursor:"pointer",fontSize:"11px",color:TEXT,fontFamily:"inherit",fontWeight:300,
                            }}>{opt}</button>
                          ))}
                        </div>
                      ))}
                      <div style={{display:"flex",gap:"8px"}}>
                        <button onClick={()=>setCheck(true)} disabled={Object.keys(answers).length<quiz.length} style={{flex:1,padding:"9px",background:isDark?"#fff":"#1a1a1a",color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>
                          {t("Шалгах","Check","確認","확인","Vérifier","Prüfen","检查")}
                        </button>
                        <button onClick={()=>{setQuiz([]);setAns({});setCheck(false);}} style={{padding:"9px 14px",border:`1px solid ${RULE}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                          {t("Дахих","Reset","リセット","초기화","Réinitialiser","Zurücksetzen","重置")}
                        </button>
                      </div>
                    </>
                  ):(
                    <div style={{textAlign:"center",paddingTop:"20px"}}>
                      <div style={{fontSize:"32px",fontWeight:300,color:TEXT,marginBottom:"4px"}}>{score}/{quiz.length}</div>
                      <div style={{fontSize:"12px",color:MUTED,marginBottom:"20px"}}>
                        {score===quiz.length?t("Бүгдийг зөв хариулав!","Perfect score!"):t(`${quiz.length-score} буруу хариулт`,`${quiz.length-score} incorrect`)}
                      </div>
                      <button onClick={()=>{setQuiz([]);setAns({});setCheck(false);setQT("");}} style={{padding:"9px 20px",background:isDark?"#fff":"#1a1a1a",color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit"}}>
                        {t("Дахин оролдох","Try again","やり直す","다시 시도","Réessayer","Nochmal","重试")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Recommend tab */}
          {tab==="recommend"&&(
            <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
              {recs.length===0?(
                <div style={{textAlign:"center",paddingTop:"30px"}}>
                  <i className="fa-solid fa-lightbulb" style={{fontSize:"24px",color:MUTED,marginBottom:"10px",display:"block"}}/>
                  <div style={{fontSize:"12px",color:MUTED,fontWeight:300,marginBottom:"16px",lineHeight:1.6}}>
                    {t("Таны суралцалтад тулгуурлан сургалт зөвлөнө","Get course recommendations based on your learning","学習に基づいておすすめを表示","학습에 기반한 강의 추천","Recommandations basées sur votre apprentissage","Empfehlungen basierend auf Ihrem Lernen","根据您的学习推荐课程")}
                  </div>
                  <button onClick={loadRecs} disabled={recLoading} style={{padding:"9px 20px",background:isDark?"#fff":"#1a1a1a",color:isDark?"#000":"#fff",border:"none",borderRadius:"100px",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    {recLoading?<i className="fa-solid fa-spinner fa-spin"/>:<i className="fa-solid fa-sparkles"/>}
                    {t("Зөвлөмж авах","Get recommendations","おすすめを取得","추천 받기","Obtenir des recommandations","Empfehlungen erhalten","获取推荐")}
                  </button>
                </div>
              ):(
                <>
                  {recs.map((r:any,i:number)=>(
                    <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${RULE}`}}>
                      <div style={{fontSize:"13px",fontWeight:400,color:TEXT,marginBottom:"3px"}}>{r.title}</div>
                      <div style={{fontSize:"11px",color:MUTED,fontWeight:300,lineHeight:1.5}}>{r.reason}</div>
                    </div>
                  ))}
                  <button onClick={()=>setRecs([])} style={{marginTop:"12px",padding:"7px 16px",border:`1px solid ${RULE}`,background:"transparent",color:MUTED,borderRadius:"100px",cursor:"pointer",fontSize:"11px",fontFamily:"inherit"}}>
                    {t("Дахин","Refresh","更新","새로고침","Actualiser","Aktualisieren","刷新")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
    </>
  );
}
