import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Link from "next/link";

export default async function CoursesPage() {
  await connectDB();
  const courses = await Course.find({ isPublished: true }).lean() as any[];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{
          fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-orbitron)",
          background: "linear-gradient(135deg, #f1f0ff, #8b5cf6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: "2rem",
        }}>
          СУРГАЛТУУД
        </h1>
        {courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "#13131f", borderRadius: "16px", border: "1px dashed #1e1e3a" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
            <p style={{ color: "#94a3b8" }}>Одоогоор сургалт байхгүй байна</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {courses.map((course) => (
              <Link key={course._id.toString()} href={`/courses/${course.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{ background: "#13131f", border: "1px solid #1e1e3a", borderRadius: "12px", overflow: "hidden", transition: "all 0.3s ease" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#8b5cf6";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px #8b5cf630";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#1e1e3a";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{ height: "160px", background: "linear-gradient(135deg, #1a1a2e, #7c3aed30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : "🎓"}
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f0ff", marginBottom: "0.5rem" }}>{course.title}</h2>
                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem"