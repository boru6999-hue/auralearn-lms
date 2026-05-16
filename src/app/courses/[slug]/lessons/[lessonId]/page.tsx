import { connectDB } from "@/lib/db";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Progress from "@/models/Progress";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LessonContent from "@/components/course/LessonContent";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  await connectDB();

  const lesson = await Lesson.findById(params.lessonId).lean() as any;
  if (!lesson) notFound();

  const course = await Course.findOne({ slug: params.slug }).lean() as any;
  if (!course) notFound();

  if (!lesson.isFree && course.price > 0) {
    const enrollment = await Enrollment.findOne({ userId: session.user.id, courseId: course._id });
    if (!enrollment) redirect(`/courses/${params.slug}?needsEnrollment=1`);
  }

  const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 }).lean() as any[];
  const progress = await Progress.find({ userId: session.user.id, courseId: course._id }).lean() as any[];
  const completedIds = progress.filter((p) => p.completed).map((p) => p.lessonId.toString());

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ display: "flex", maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", gap: "2rem" }}>

        {/* Sidebar */}
        <aside style={{ width: "280px", shrink: 0, flexShrink: 0 }}>
          <Link href={`/courses/${params.slug}`} style={{ color: "#8b5cf6", textDecoration: "none", fontSize: "0.85rem", display: "block", marginBottom: "1rem" }}>
            ← Буцах
          </Link>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f0ff", fontFamily: "var(--font-orbitron)", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            {course.title}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {lessons.map((l, index) => {
              const isActive = l._id.toString() === params.lessonId;
              const isDone = completedIds.includes(l._id.toString());
              return (
                <Link key={l._id.toString()} href={`/courses/${params.slug}/lessons/${l._id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 0.75rem", borderRadius: "8px",
                    background: isActive ? "#7c3aed20" : "transparent",
                    border: isActive ? "1px solid #7c3aed50" : "1px solid transparent",
                    transition: "all 0.2s",
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "var(--font-orbitron)", color: "#f1f0ff", marginBottom: "1.5rem" }}>
            {lesson.title}
          </h1>

          {lesson.videoType === "youtube" ? (
            <div style={{ aspectRatio: "16/9", width: "100%", marginBottom: "1.5rem", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e1e3a" }}>
              <iframe
                src={`https://www.youtube.com/embed/${lesson.videoUrl}`}
                style={{ width: "100%", height: "100%" }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              />
            </div>
          ) : (
            <video src={lesson.videoUrl} controls style={{ width: "100%", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #1e1e3a" }} />
          )}

          <LessonContent
            lessonId={params.lessonId}
            courseId={course._id.toString()}
            isCompleted={completedIds.includes(params.lessonId)}
          />
        </div>
      </div>
    </div>
  );
}