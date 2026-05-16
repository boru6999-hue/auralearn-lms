import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import Lesson from "@/models/Lesson";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  await connectDB();

  const userId = session.user.id;
  const enrollments = await Enrollment.find({ userId }).lean() as any[];
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean() as any[];

  const progressData = await Promise.all(
    courses.map(async (course) => {
      const totalLessons = await Lesson.countDocuments({ courseId: course._id });
      const completedLessons = await Progress.countDocuments({ userId, courseId: course._id, completed: true });
      const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return { courseId: course._id.toString(), percent, completedLessons, totalLessons };
    })
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #1e1e3a" }}>
          <div>
            <p style={{ color: "#8b5cf6", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.4rem" }}>⚡ ТАВТАЙ МОРИЛНО УУ</p>
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 900, fontFamily: "var(--font-orbitron)", background: "linear-gradient(135deg, #f1f0ff, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {session.user.name}
            </h1>
          </div>
          <Link href="/courses" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, boxShadow: "0 0 20px #7c3aed40" }}>
            + Сургалт нэмэх
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Нийт сургалт", value: courses.length, icon: "📚", color: "#8b5cf6" },
            { label: "Дууссан хичээл", value: progressData.reduce((a, p) => a + p.completedLessons, 0), icon: "✅", color: "#06b6d4" },
            { label: "Дундаж явц", value: `${progressData.length > 0 ? Math.round(progressData.reduce((a, p) => a + p.percent, 0) / progressData.length) : 0}%`, icon: "📊", color: "#ec4899" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#13131f", border: `1px solid ${stat.color}30`, borderRadius: "12px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: `radial-gradient(circle, ${stat.color}20, transparent)` }} />
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: stat.color, fontFamily: "var(--font-orbitron)" }}>{stat.value}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-orbitron)", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          МИНИЙ СУРГАЛТУУД
        </h2>

        {courses.length === 0 ? (
          <div style={{ background: "#13131f", border: "1px dashed #1e1e3a", borderRadius: "16px", padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎮</div>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Та одоогоор ямар ч сургалтад бүртгүүлээгүй байна</p>
            <Link href="/courses" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff", padding: "10px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
              Сургалт үзэх →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {courses.map((course: any) => {
              const prog = progressData.find(p => p.courseId === course._id.toString());
              const percent = prog?.percent || 0;
              return (
                <Link key={course._id.toString()} href={`/courses/${course.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#13131f", border: "1px solid #1e1e3a", borderRadius: "12px", overflow: "hidden", transition: "all 0.3s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#8b5cf6"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1e1e3a"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                    <div style={{ height: "140px", background: "linear-gradient(135deg, #1a1a2e, #7c3aed30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative" }}>
                      {course.thumbnail ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>🎓</span>}
                      <div style={{ position: "absolute", top: "10px", right: "10px", background: percent === 100 ? "#059669" : "#7c3aed", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", fontFamily: "var(--font-orbitron)" }}>
                        {percent === 100 ? "✓ ДУУССАН" : `${percent}%`}
                      </div>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f0ff", marginBottom: "0.75rem" }}>{course.title}</h3>
                      <div style={{ background: "#1e1e3a", borderRadius: "4px", height: "4px", overflow: "hidden", marginBottom: "0.5rem" }}>
                        <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg, #7c3aed, #06b6d4)", boxShadow: "0 0 8px #7c3aed80" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{prog?.completedLessons || 0} / {prog?.totalLessons || 0} хичээл</span>
                        <span style={{ fontSize: "0.75rem", color: "#8b5cf6", fontWeight: 600 }}>{percent}%</span>
                      </div>
                    </div>
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