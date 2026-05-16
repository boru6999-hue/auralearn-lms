"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CertificatesPage() {
  const { isDark, colors, mounted } = useTheme();
  const { lang } = useLang();
  const { data: session } = useSession();
  const [completedCourses, setCompleted] = useState<any[]>([]);
  const [loading, setLoad] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewCourse, setPreview] = useState<any>(null);
  const [previewProgress, setPreviewProg] = useState<any>(null);

  const t=(mn:string,en:string,ja="",ko="",fr="",de="",zh="")=>
    lang==="mn"?mn:lang==="ja"?(ja||en):lang==="ko"?(ko||en):lang==="fr"?(fr||en):lang==="de"?(de||en):lang==="zh"?(zh||en):en;

  useEffect(()=>{
    // Get all progress records and find completed ones
    fetch("/api/dashboard")
      .then(r=>r.json())
      .then(async data=>{
        const courses = data.courses || [];
        const progressData = data.progressData || [];

        // Find courses where user has completed all lessons and passed quizzes
        const eligible: any[] = [];
        for(const course of courses){
          const prog = progressData.find((p:any)=>p.courseId===course._id);
          if(!prog) continue;

          // Fetch full course for quiz data
          const cRes = await fetch(`/api/courses/${course._id}`);
          const fullCourse = await cRes.json();
          const pRes = await fetch(`/api/progress?courseId=${course._id}`);
          const fullProg = await pRes.json();

          const totalLessons = fullCourse?.sections?.reduce((a:number,s:any)=>a+(s.lessons?.length||0),0)||0;
          const completedCount = fullProg?.lessons?.filter((l:any)=>l.completed).length||0;
          const allDone = totalLessons>0 && completedCount>=totalLessons;

          const quizLessons = fullCourse?.sections?.flatMap((s:any)=>s.lessons?.filter((l:any)=>l.type==="quiz")||[])||[];
          const allQuizPassed = quizLessons.length===0 || quizLessons.every((ql:any)=>{
            const lp = fullProg?.lessons?.find((l:any)=>l.lessonId===ql._id);
            if(!lp||lp.quizScore<0) return false;
            return lp.quizScore >= Math.ceil((ql.quiz?.length||1)*0.7);
          });

          if(allDone && allQuizPassed){
            eligible.push({ course: fullCourse, progress: fullProg });
          }
        }
        setCompleted(eligible);
      })
      .catch(()=>{})
      .finally(()=>setLoad(false));
  },[]);

  function drawCertificate(canvas: HTMLCanvasElement, course: any, prog: any){
    const ctx = canvas.getContext("2d")!;
    const W=900, H=640;
    canvas.width=W; canvas.height=H;

    // Background
    ctx.fillStyle="#0a0a0a";
    ctx.fillRect(0,0,W,H);

    // Borders
    ctx.strokeStyle="#c9a227"; ctx.lineWidth=3;
    ctx.strokeRect(20,20,W-40,H-40);
    ctx.strokeStyle="rgba(201,162,39,0.3)"; ctx.lineWidth=1;
    ctx.strokeRect(32,32,W-64,H-64);

    // Corner dots
    [[44,44],[W-44,44],[44,H-44],[W-44,H-44]].forEach(([x,y])=>{
      ctx.fillStyle="#c9a227"; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
    });

    // Brand
    ctx.fillStyle="#c9a227"; ctx.font="bold 18px Arial"; ctx.textAlign="center";
    ctx.fillText("✦ AURALEARN ✦", W/2, 100);

    // Title
    ctx.fillStyle="#fff"; ctx.font="bold 36px Georgia";
    ctx.fillText(t("ГЭРЧИЛГЭЭ","CERTIFICATE OF COMPLETION","修了証明書","수료 증명서","CERTIFICAT D'ACHÈVEMENT","ABSCHLUSSZERTIFIKAT","完成证书"), W/2, 162);

    // Subtitle
    ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="14px Arial";
    ctx.fillText(t("Дараах хэрэглэгч амжилттай дүүргэсэн болохыг гэрчилнэ","This is to certify that","以下の方が修了したことを証明します","다음 사람이 수료했음을 증명합니다","Ceci certifie que","Dies bescheinigt, dass","兹证明"), W/2, 208);

    // Name
    const name = session?.user?.name || "Boru";
    ctx.fillStyle="#c9a227"; ctx.font="bold 44px Georgia";
    ctx.fillText(name, W/2, 282);

    // Underline
    const nw = ctx.measureText(name).width;
    ctx.strokeStyle="rgba(201,162,39,0.5)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(W/2-nw/2-20,296); ctx.lineTo(W/2+nw/2+20,296); ctx.stroke();

    // Course label
    ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.font="15px Arial";
    ctx.fillText(t("дараах сургалтыг амжилттай дүүргэсэн:","has successfully completed the course:","以下のコースを修了:","다음 강의를 이수:","a suivi le cours :","hat abgeschlossen:","已完成以下课程："), W/2, 338);

    // Course name
    ctx.fillStyle="#fff";
    let fontSize=26;
    ctx.font=`bold ${fontSize}px Georgia`;
    while(ctx.measureText(course.title||"").width>700&&fontSize>16){ fontSize--; ctx.font=`bold ${fontSize}px Georgia`; }
    ctx.fillText(course.title||"", W/2, 383);

    // Divider
    ctx.strokeStyle="rgba(201,162,39,0.3)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(100,438); ctx.lineTo(W-100,438); ctx.stroke();

    // Gold seal
    ctx.beginPath(); ctx.arc(W/2,453,36,0,Math.PI*2);
    ctx.fillStyle="rgba(201,162,39,0.1)"; ctx.fill();
    ctx.strokeStyle="#c9a227"; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle="#c9a227"; ctx.font="bold 22px Arial"; ctx.textAlign="center";
    ctx.fillText("★", W/2, 461);

    // Date
    const date = prog?.certificateAt
      ? new Date(prog.certificateAt).toLocaleDateString(lang==="mn"?"mn-MN":"en-US",{year:"numeric",month:"long",day:"numeric"})
      : new Date().toLocaleDateString(lang==="mn"?"mn-MN":"en-US",{year:"numeric",month:"long",day:"numeric"});

    ctx.textAlign="left";
    ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="12px Arial";
    ctx.fillText(t("Олгосон огноо","Date Issued","発行日","발급일","Date","Datum","颁发日期"), 120,488);
    ctx.fillStyle="#fff"; ctx.font="bold 14px Arial";
    ctx.fillText(date, 120,510);

    // Signature
    ctx.textAlign="right";
    ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="12px Arial";
    ctx.fillText(t("Гарын үсэг","Signature","署名","서명","Signature","Unterschrift","签名"), W-120,488);
    ctx.fillStyle="#c9a227"; ctx.font="italic bold 24px Georgia";
    ctx.fillText("Boru", W-120,514);

    // Certificate ID
    ctx.textAlign="center"; ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.font="10px Arial";
    ctx.fillText(`ID: AURA-${(course._id||"").toString().slice(-8).toUpperCase()}`, W/2,588);
  }

  function downloadCert(course:any, prog:any){
    const canvas = document.createElement("canvas");
    drawCertificate(canvas, course, prog);
    const link = document.createElement("a");
    link.download = `${course.title||"certificate"}-certificate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if(!mounted||loading) return(
    <div style={{minHeight:"100vh",background:colors.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <i className="fa-solid fa-spinner fa-spin" style={{fontSize:"28px",color:colors.text3}}/>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"32px 24px"}}>

        {/* Header */}
        <div style={{marginBottom:"28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
            <i className="fa-solid fa-certificate" style={{fontSize:"24px",color:"#c9a227"}}/>
            <h1 style={{color:colors.text,fontSize:"24px",fontWeight:800}}>
              {t("Миний гэрчилгээнүүд","My Certificates","私の証明書","내 수료증","Mes certificats","Meine Zertifikate","我的证书")}
            </h1>
          </div>
          <p style={{color:colors.text3,fontSize:"13px"}}>
            {t("Дүүргэсэн сургалтуудын гэрчилгээ","Certificates for completed courses","修了したコースの証明書","완료한 강의의 수료증","Certificats des cours terminés","Zertifikate für abgeschlossene Kurse","已完成课程的证书")}
          </p>
        </div>

        {completedCourses.length===0?(
          <div style={{textAlign:"center",padding:"60px",background:isDark?"rgba(255,255,255,0.03)":"#fff",borderRadius:"16px",border:`1px solid ${colors.border}`}}>
            <i className="fa-solid fa-certificate" style={{fontSize:"48px",color:"#c9a227",display:"block",marginBottom:"16px",opacity:0.4}}/>
            <div style={{color:colors.text,fontWeight:700,fontSize:"16px",marginBottom:"8px"}}>
              {t("Одоогоор гэрчилгээ байхгүй","No certificates yet","まだ証明書はありません","아직 수료증이 없습니다","Aucun certificat pour l'instant","Noch keine Zertifikate","目前没有证书")}
            </div>
            <div style={{color:colors.text3,fontSize:"13px",marginBottom:"24px"}}>
              {t("Сургалтыг бүгдийг дүүргэж, тестэнд тэнцсэний дараа гэрчилгээ авна","Complete all lessons and pass all quizzes to earn certificates","全レッスンを完了してクイズに合格すると証明書を取得","모든 레슨 완료 및 퀴즈 통과 시 수료증 발급","Terminez tous les cours et réussissez les quiz","Schließen Sie alle Lektionen ab und bestehen Sie die Tests","完成所有课程并通过测验即可获得证书")}
            </div>
            <Link href="/courses" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:isDark?"#fff":"#000",color:isDark?"#000":"#fff",padding:"10px 24px",borderRadius:"10px",textDecoration:"none",fontWeight:700,fontSize:"14px"}}>
              <i className="fa-solid fa-graduation-cap"/>
              {t("Сургалт үзэх","Browse Courses","コースを見る","강의 보기","Voir les cours","Kurse ansehen","浏览课程")}
            </Link>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {completedCourses.map(({course,progress:prog},i)=>(
              <div key={course._id||i} style={{background:isDark?"rgba(255,255,255,0.03)":"#fff",border:"1px solid rgba(201,162,39,0.3)",borderRadius:"14px",padding:"20px 24px",display:"flex",alignItems:"center",gap:"16px"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,162,39,0.6)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(201,162,39,0.3)"}>

                {/* Gold icon */}
                <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"rgba(201,162,39,0.1)",border:"2px solid rgba(201,162,39,0.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <i className="fa-solid fa-certificate" style={{color:"#c9a227",fontSize:"22px"}}/>
                </div>

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:colors.text,fontWeight:700,fontSize:"15px",marginBottom:"3px"}}>{course.title}</div>
                  <div style={{color:colors.text3,fontSize:"12px",display:"flex",gap:"12px",flexWrap:"wrap"}}>
                    <span><i className="fa-solid fa-circle-check" style={{color:"#34d399",marginRight:"4px"}}/>{t("Бүх хичээл дүүргэсэн","All lessons completed","全レッスン修了","모든 레슨 완료","Tous les cours terminés","Alle Lektionen abgeschlossen","已完成所有课程")}</span>
                    {prog?.certificateAt&&<span><i className="fa-solid fa-calendar" style={{marginRight:"4px"}}/>{new Date(prog.certificateAt).toLocaleDateString()}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                  <Link href={`/courses/${course.slug||course._id}/certificate`} style={{background:"none",border:"1px solid rgba(201,162,39,0.4)",color:"#c9a227",padding:"7px 14px",borderRadius:"8px",textDecoration:"none",fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",gap:"5px"}}>
                    <i className="fa-solid fa-eye"/>
                    {t("Харах","View","表示","보기","Voir","Ansehen","查看")}
                  </Link>
                  <button onClick={()=>downloadCert(course,prog)} style={{background:"#c9a227",border:"none",color:"#000",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:700,display:"flex",alignItems:"center",gap:"5px"}}>
                    <i className="fa-solid fa-download"/>
                    {t("Татах","Download","ダウンロード","다운로드","Télécharger","Herunterladen","下载")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
