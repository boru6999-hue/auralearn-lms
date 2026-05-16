import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Enrollment from "@/models/Enrollment";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourseActions from "@/components/course/CourseActions";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  await connectDB();
  const course = await Course.findOne({ slug: params.slug }).lean() as any;
  if (!course) notFound();

  const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 }).lean() as any[];
  const session = await auth();
  let isEnrolled = false;

  if (session) {
    const enrollment = await Enrollment.findOne({ userId: session.user.id, courseId: course._id });
    isEnrolled = !!enrollment;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "12px", marginBottom: "2rem" }} />
        )}

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-orbitron)", background: "linear-gradient(135deg, #f1f0ff, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1rem" }}>
              {course.title}
            </h1>
            <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: "1.5rem" }}>{course.description}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              {course.price === 0 ? (
                <span style={{ color: "#34d399", fontWeight: 700, fontSize: "1.2rem" }}>✦ ҮНЭГҮЙ</span>
              ) : (
                <span style={{ color: "#8b5cf6", fontWeight: 700, fontSize: "1.2rem" }}>${course.price}</span>
              )}
              <CourseActions
                courseId={course._id.toString()}
                price={course.price}
                isEnrolled={isEnrolled}
                isLoggedIn={!!session}
              />
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-orbitron)", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
          ХИЧЭЭЛҮҮД
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {lessons.map((lesson, index) => (
            <div key={lesson._id.toString()} style={{
              background: "#13131f", border: "1px solid #1e1e3a", borderRadius: "10px",
              padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ color: "#8b5cf6", fontWeight: 700, fontFamily: "var(--font-orbitron)", fontSize: "0.8rem" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span style={{ color: "#f1f0ff", fontSize: "0.95rem" }}>{lesson.title}</span>
                {lesson.isFree && (
                  <span style={{ background: "#34d39920", color: "#34d399", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>
                    ҮНЭГҮЙ
                  </span>
                )}
              </div>
              {isEnrolled || lesson.isFree ? (
                <Link href={`/courses/${params.slug}/lessons/${lesson._id}`} style={{
                  background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff",
                  padding: "6px 14px", borderRadius: "6px", textDecoration: "none",
                  fontSize: "0.8rem", fontWeight: 600,
                }}>
                  Үзэх →
                </Link>
              ) : (
                <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>🔒 Түгжигдсэн</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}