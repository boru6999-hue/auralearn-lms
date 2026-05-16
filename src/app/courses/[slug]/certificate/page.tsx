"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CertificatePage() {
  const { slug } = useParams();
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const { data: session } = useSession();
  const [course, setCourse]     = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoad]      = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    if(!slug) return;
    fetch(`/api/courses/${slug}`)
      .then(r=>r.json())
      .then(async courseData=>{
        setCourse(courseData);
        const pRes = await fetch(`/api/progress?courseId=${courseData._id}`);
        const prog = await pRes.json();
        setProgress(prog);

        // Check eligibility
        const totalLessons = courseData.sections?.reduce((a:number,s:any)=>a+(s.lessons?.length||0),0)||0;
        const completedCount = prog?.lessons?.filter((l:any)=>l.completed).length||0;

        // All lessons completed
        const allDone = totalLessons > 0 && completedCount >= totalLessons;

        // All quizzes passed (score >= 70%)
        const quizLessons = courseData.sections?.flatMap((s:any)=>s.lessons?.filter((l:any)=>l.type==="quiz")||[])||[];
        const allQuizPassed = quizLessons.every((ql:any)=>{
          const lp = prog?.lessons?.find((l:any)=>l.lessonId===ql._id);
          if(!lp||lp.quizScore<0) return false;
          const passing = Math.ceil((ql.quiz?.length||1)*0.7);
          return lp.quizScore >= passing;
        });

        setEligible(allDone && (quizLessons.length===0||allQuizPassed));
      })
      .catch(()=>{})
      .finally(()=>setLoad(false));
  },[slug]);

  // Draw certificate on canvas
  useEffect(()=>{
    if(!eligible||!course||!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const W = 900, H = 640;
    canvas.width = W; canvas.height = H;

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0,0,W,H);

    // Outer border
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3;
    ctx.strokeRect(20,20,W-40,H-40);

    // Inner border
    ctx.strokeStyle = "rgba(201,162,39,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(32,32,W-64,H-64);

    // Corner decorations
    const corners = [[44,44],[W-44,44],[44,H-44],[W-44,H-44]];
    corners.forEach(([x,y])=>{
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fill();
    });

    // Logo / Brand
    ctx.fillStyle = "#c9a227";
    ctx.font = "bold 18px 'Inter',Arial,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ AURALEARN ✦", W/2, 100);

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 38px 'Georgia',serif";
    ctx.fillText(t(
      "ГЭРЧИЛГЭЭ",
      "CERTIFICATE OF COMPLETION",
      "修了証明書",
      "수료 증명서",
      "CERTIFICAT D'ACHÈVEMENT",
      "ABSCHLUSSZERTIFIKAT",
      "完成证书"
    ), W/2, 165);

    // Subtitle
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "14px 'Inter',Arial,sans-serif";
    ctx.fillText(t(
      "Дараах хэрэглэгч амжилттай дүүргэсэн болохыг гэрчилнэ",
      "This is to certify that",
      "以下の方が修了したことを証明します",
      "다음 사람이 수료했음을 증명합니다",
      "Ceci certifie que",
      "Dies bescheinigt, dass",
      "兹证明以下学员已完成"
    ), W/2, 210);

    // Student name
    const studentName = session?.user?.name || "Бору";
    ctx.fillStyle = "#c9a227";
    ctx.font = "bold 44px 'Georgia',serif";
    ctx.fillText(studentName, W/2, 285);

    // Underline
    const nameWidth = ctx.measureText(studentName).width;
    ctx.strokeStyle = "rgba(201,162,39,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W/2-nameWidth/2-20, 298);
    ctx.lineTo(W/2+nameWidth/2+20, 298);
    ctx.stroke();

    // Course text
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "15px 'Inter',Arial,sans-serif";
    ctx.fillText(t(
      "дараах сургалтыг амжилттай дүүргэсэн:",
      "has successfully completed the course:",
      "以下のコースを修了しました：",
      "다음 강의를 성공적으로 이수했습니다:",
      "a suivi avec succès le cours :",
      "hat den folgenden Kurs erfolgreich abgeschlossen:",
      "已成功完成以下课程："
    ), W/2, 340);

    // Course name
    ctx.fillStyle = "#fff";
    ctx.font = "bold 26px 'Georgia',serif";
    const courseName = course.title || "Course";
    // Wrap if long
    if(ctx.measureText(courseName).width > 700){
      ctx.font = "bold 20px 'Georgia',serif";
    }
    ctx.fillText(courseName, W/2, 385);

    // Date
    const date = progress?.certificateAt
      ? new Date(progress.certificateAt).toLocaleDateString(lang==="mn"?"mn-MN":"en-US",{year:"numeric",month:"long",day:"numeric"})
      : new Date().toLocaleDateString(lang==="mn"?"mn-MN":"en-US",{year:"numeric",month:"long",day:"numeric"});

    // Divider line
    ctx.strokeStyle = "rgba(201,162,39,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 440); ctx.lineTo(W-100, 440);
    ctx.stroke();

    // Signature area
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "13px 'Inter',Arial,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(t("Олгосон огноо","Date Issued","発行日","발급일","Date d'émission","Ausstellungsdatum","颁发日期"), 120, 490);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px 'Inter',Arial,sans-serif";
    ctx.fillText(date, 120, 515);

    // Instructor signature
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "13px 'Inter',Arial,sans-serif";
    ctx.fillText(t("Гарын үсэг","Signature","署名","서명","Signature","Unterschrift","签名"), W-120, 490);
    ctx.fillStyle = "#c9a227";
    ctx.font = "italic bold 22px 'Georgia',serif";
    ctx.fillText("Boru", W-120, 520);

    // Certificate ID
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "11px 'Inter',Arial,sans-serif";
    const certId = `AURA-${course._id?.toString().slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    ctx.fillText(`Certificate ID: ${certId}`, W/2, 590);

    // Gold seal
    ctx.beginPath();
    ctx.arc(W/2, 455, 38, 0, Math.PI*2);
    ctx.fillStyle = "rgba(201,162,39,0.1)";
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#c9a227";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("★", W/2, 463);

  },[eligible, course, session, progress, lang]);

  function downloadCert(){
    if(!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${course?.title||"certificate"}-certificate.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  if(!mounted||loading) return(
    <div style={{minHeight:"100vh",background:colors.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"28px",color:colors.text3}}/>
    </div>
  );

  if(!eligible) {
    const totalLessons = course?.sections?.reduce((a:number,s:any)=>a+(s.lessons?.length||0),0)||0;
    const completedCount = progress?.lessons?.filter((l:any)=>l.completed).length||0;
    const quizLessons = course?.sections?.flatMap((s:any)=>s.lessons?.filter((l:any)=>l.type==="quiz")||[])||[];
    const passedQuizzes = quizLessons.filter((ql:any)=>{
      const lp = progress?.lessons?.find((l:any)=>l.lessonId===ql._id);
      if(!lp||lp.quizScore<0) return false;
      return lp.quizScore >= Math.ceil((ql.quiz?.length||1)*0.7);
    }).length;

    return(
      <div style={{minHeight:"100vh",background:colors.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
        <div style={{maxWidth:"480px",width:"100%",background:isDark?"rgba(255,255,255,0.04)":"#fff",border:`1px solid ${colors.border}`,borderRadius:"16px",padding:"32px",textAlign:"center"}}>
          <i className="fa-solid fa-certificate" style={{fontSize:"48px",color:"#f59e0b",marginBottom:"16px",display:"block"}}/>
          <h2 style={{color:colors.text,fontSize:"20px",fontWeight:800,marginBottom:"8px"}}>
            {t("Гэрчилгээ авахын тулд...","To earn your certificate...")}
          </h2>
          <p style={{color:colors.text3,fontSize:"13px",marginBottom:"24px"}}>
            {t("Бүх хичээлийг дүүргэж, тестэнд тэнцэх шаардлагатай","Complete all lessons and pass all quizzes")}
          </p>

          {/* Progress checklist */}
          <div style={{textAlign:"left",display:"flex",flexDirection:"column",gap:"10px",marginBottom:"24px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",background:isDark?"rgba(255,255,255,0.03)":"#f9f9f9",borderRadius:"8px"}}>
              <i className={`fa-solid ${completedCount>=totalLessons?"fa-circle-check":"fa-circle-xmark"}`} style={{color:completedCount>=totalLessons?"#34d399":"#f87171",fontSize:"16px"}}/>
              <div>
                <div style={{color:colors.text,fontSize:"13px",fontWeight:600}}>
                  {t("Бүх хичээл дүүргэх","Complete all lessons")}
                </div>
                <div style={{color:colors.text3,fontSize:"11px"}}>{completedCount}/{totalLessons} {t("дүүргэсэн","completed")}</div>
              </div>
            </div>

            {quizLessons.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",background:isDark?"rgba(255,255,255,0.03)":"#f9f9f9",borderRadius:"8px"}}>
                <i className={`fa-solid ${passedQuizzes>=quizLessons.length?"fa-circle-check":"fa-circle-xmark"}`} style={{color:passedQuizzes>=quizLessons.length?"#34d399":"#f87171",fontSize:"16px"}}/>
                <div>
                  <div style={{color:colors.text,fontSize:"13px",fontWeight:600}}>
                    {t("Бүх тестэнд тэнцэх (70%+)","Pass all quizzes (70%+)")}
                  </div>
                  <div style={{color:colors.text3,fontSize:"11px"}}>{passedQuizzes}/{quizLessons.length} {t("тэнцсэн","passed")}</div>
                </div>
              </div>
            )}
          </div>

          <Link href={`/courses/${slug}`} style={{display:"inline-flex",alignItems:"center",gap:"8px",background:isDark?"#fff":"#000",color:isDark?"#000":"#fff",padding:"10px 24px",borderRadius:"10px",textDecoration:"none",fontWeight:700,fontSize:"14px"}}>
            <i className="fa-solid fa-arrow-left" style={{fontSize:"12px"}}/>
            {t("Сургалт руу буцах","Back to course")}
          </Link>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:isDark?"#000":"#f0f0f0",padding:"32px 24px",fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"940px",margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
          <Link href={`/courses/${slug}`} style={{color:colors.text3,fontSize:"13px",textDecoration:"none",display:"flex",alignItems:"center",gap:"6px"}}>
            <i className="fa-solid fa-arrow-left" style={{fontSize:"11px"}}/>
            {t("Сургалт руу буцах","Back to course")}
          </Link>
          <div style={{display:"flex",gap:"10px"}}>
            <button onClick={downloadCert} style={{background:"#c9a227",border:"none",color:"#000",padding:"9px 20px",borderRadius:"9px",cursor:"pointer",fontWeight:700,fontSize:"13px",display:"flex",alignItems:"center",gap:"7px"}}>
              <i className="fa-solid fa-download"/>
              {t("Татах","Download PNG")}
            </button>
          </div>
        </div>

        {/* Congrats banner */}
        <div style={{background:"rgba(201,162,39,0.1)",border:"1px solid rgba(201,162,39,0.3)",borderRadius:"12px",padding:"14px 20px",marginBottom:"24px",display:"flex",alignItems:"center",gap:"12px"}}>
          <i className="fa-solid fa-trophy" style={{color:"#c9a227",fontSize:"20px"}}/>
          <div>
            <div style={{color:colors.text,fontWeight:700,fontSize:"14px"}}>
              🎉 {t("Баяр хүргэе!","Congratulations!","おめでとうございます！","축하합니다!","Félicitations!","Herzlichen Glückwunsch!","恭喜！")}
            </div>
            <div style={{color:colors.text3,fontSize:"12px"}}>
              {t(`"${course?.title}" сургалтыг амжилттай дүүргэлээ!`,`You've completed "${course?.title}"!`)}
            </div>
          </div>
        </div>

        {/* Certificate canvas */}
        <div style={{borderRadius:"14px",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <canvas ref={canvasRef} style={{width:"100%",height:"auto",display:"block"}}/>
        </div>

        <p style={{textAlign:"center",color:colors.text3,fontSize:"12px",marginTop:"16px"}}>
          <i className="fa-solid fa-info-circle" style={{marginRight:"5px"}}/>{t("PNG форматаар татаж авах боломжтой","Download as PNG image")}
        </p>
      </div>
    </div>
  );
}
