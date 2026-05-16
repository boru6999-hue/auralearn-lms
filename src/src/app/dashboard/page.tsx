"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLang();
  const { isDark, colors, mounted } = useTheme();
  const d = t.dashboard;

  const [courses, setCourses] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated") {
      fetch("/api/dashboard").then(r => r.json()).then(data => {
        setCourses(data.courses || []);
        setProgressData(data.progressData || []);
        setDbUser(data.user || null);
        setLoading(false);
      });
    }
  }, [status]);

  const displayName = dbUser?.name || session?.user?.name || "";
  const displayImage = (dbUser?.image && dbUser.image.length > 500) ? dbUser.image : (session?.user?.image || "");
  const totalCompleted = progressData.reduce((a: number, p: any) => a + (p.completedLessons || 0), 0);
  const avgProgress = progressData.length > 0 ? Math.round(progressData.reduce((a: number, p: any) => a + p.percent, 0) / progressData.length) : 0;

  if (status === "loading" || loading) return (
    <div style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: colors.text3, fontSize: "14px" }}>...</span>
    </div>
  );

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#000" }} />;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", padding: "32px 24px", transition: "background 0.2s" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", paddingBottom: "24px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              border: `1px solid ${colors.border}`, flexShrink: 0,
              overflow: "hidden", background: colors.bg2,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {displayImage
                ? <img src={displayImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ color: colors.text, fontSize: "16px", fontWeight: 700 }}>{displayName?.[0]?.toUpperCase() || "?"}</span>
              }
            </div>
            <div>
              <p style={{ color: colors.text3, fontSize: "12px", margin: "0 0 2px" }}>{d.welcome}</p>
              <h1 style={{ color: colors.text, fontSize: "18px", fontWeight: 700, margin: 0 }}>{displayName}</h1>
            </div>
          </div>
          <Link href="/courses" style={{
            height: "36px", padding: "0 16px",
            background: colors.btnPrimary, color: colors.btnPrimaryText,
            border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
            textDecoration: "none", display: "flex", alignItems: "center",
          }}>
            {d.add_course}
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: d.total_courses, value: courses.length },
            { label: d.completed, value: totalCompleted },
            { label: d.avg_progress, value: `${avgProgress}%` },
          ].map(s => (
            <div key={s.label} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: "8px", padding: "16px 20px", transition: "background 0.2s" }}>
              <div style={{ fontSize: "22px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: colors.text3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: "1px", background: colors.border, marginBottom: "24px" }} />
        <h2 style={{ color: colors.text3, fontSize: "12px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>{d.my_courses}</h2>

        {courses.length === 0 ? (
          <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: "8px", padding: "48px", textAlign: "center" }}>
            <p style={{ color: colors.text3, marginBottom: "16px", fontSize: "14px" }}>{d.no_courses}</p>
            <Link href="/courses" style={{ background: colors.btnPrimary, color: colors.btnPrimaryText, padding: "10px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
              {d.browse}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {courses.map((course: any) => {
              const prog = progressData.find((p: any) => p.courseId === course._id);
              const percent = prog?.percent || 0;
              return (
                <Link key={course._id} href={`/courses/${course.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: "8px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", transition: "border-color 0.15s, background 0.2s" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "6px", flexShrink: 0, overflow: "hidden", background: colors.bg3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                      {course.thumbnail ? <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎓"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: colors.text, fontSize: "14px", fontWeight: 600, marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{course.title}</div>
                      <div style={{ background: colors.bg3, borderRadius: "4px", height: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${percent}%`, height: "100%", background: colors.text }} />
                      </div>
                    </div>
                    <div style={{ color: percent === 100 ? colors.text : colors.text3, fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>{percent}%</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
