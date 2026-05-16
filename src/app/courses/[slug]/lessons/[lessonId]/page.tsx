import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session) redirect("/auth/login");

  await connectDB();

  const course = await Course.findOne({ slug }).lean() as any;
  if (!course) notFound();

  // Find lesson from sections
  let lesson: any = null;
  for (const sec of course.sections || []) {
    for (const les of sec.lessons || []) {
      if (les._id?.toString() === lessonId) { lesson = les; break; }
    }
    if (lesson) break;
  }
  if (!lesson) notFound();

  // All lessons flat list
  const allLessons = (course.sections || []).flatMap((s: any) => s.lessons || []);

  // Progress
  const progress = await Progress.findOne({
    userId: (session.user as any).id,
    courseId: course._id,
  }).lean() as any;

  const completedIds = (progress?.lessons || [])
    .filter((l: any) => l.completed)
    .map((l: any) => l.lessonId?.toString());

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ display: "flex", maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", gap: "2rem" }}>

        {/* Sidebar */}
        <aside style={{ width: "280px", flexShrink: 0 }}>
          <Link href={`/courses/${slug}`} style={{ color: "#8b5cf6", textDecoration: "none", fontSize: "0.85rem", display: "block", marginBottom: "1rem" }}>
            ← Буцах
          </Link>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f0ff", marginBottom: "1rem" }}>
            {course.title}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {allLessons.map((l: any, index: number) => {
              const isActive = l._id?.toString() === lessonId;
              const isDone = completedIds.includes(l._id?.toString());
              return (
                <Link key={l._id?.toString() || index} href={`/courses/${slug}/lessons/${l._id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 0.75rem", borderRadius: "8px",
                    background: isActive ? "#7c3aed20" : "transparent",
                    border: isActive ? "1px solid #7c3aed50" : "1px solid transparent",
                  }}>
                    <span style={{ fontSize: "0.75rem", color: isDone ? "#34d399" : "#94a3b8", fontWeight: 700 }}>
                      {isDone ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: isActive ? "#a78bfa" : "#94a3b8", lineHeight: 1.3 }}>
                      {l.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#f1f0ff", marginBottom: "1.5rem" }}>
            {lesson.title}
          </h1>

          {lesson.videoUrl && (
            <div style={{ aspectRatio: "16/9", width: "100%", marginBottom: "1.5rem", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e1e3a" }}>
              {lesson.videoUrl.includes("youtube") || lesson.videoUrl.includes("youtu.be") ? (
                <iframe
                  src={`https://www.youtube.com/embed/${lesson.videoUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]}`}
                  style={{ width: "100%", height: "100%" }}
                  allowFullScreen
                />
              ) : (
                <video src={lesson.videoUrl} controls style={{ width: "100%", height: "100%" }} />
              )}
            </div>
          )}

          {lesson.description && (
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              {lesson.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <span style={{
              padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600,
              background: completedIds.includes(lessonId) ? "rgba(52,211,153,0.15)" : "rgba(124,58,237,0.15)",
              color: completedIds.includes(lessonId) ? "#34d399" : "#a78bfa",
              border: `1px solid ${completedIds.includes(lessonId) ? "rgba(52,211,153,0.3)" : "rgba(124,58,237,0.3)"}`,
            }}>
              {completedIds.includes(lessonId) ? "✓ Дүүргэсэн" : "Дүүргээгүй"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}