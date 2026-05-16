import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const userId = (session.user as any).id || session.user.email;

    // Get user info
    const dbUser = await User.findById(userId).lean() as any;

    // Get all progress records for this user
    const progressList = await Progress.find({ userId }).lean() as any[];

    if (progressList.length === 0) {
      return NextResponse.json({
        user: { name: dbUser?.name || session.user.name, image: dbUser?.image || "" },
        courses: [],
        progressData: [],
      });
    }

    // Get all courses user has progress in
    const courseIds = progressList.map((p: any) => p.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("title slug thumbnail sections")
      .lean() as any[];

    // Build progress data
    const progressData = progressList.map((prog: any) => {
      const course = courses.find((c: any) => c._id.toString() === prog.courseId.toString());
      const totalLessons = course?.sections?.reduce((a: number, s: any) => a + (s.lessons?.length || 0), 0) || prog.totalLessons || 0;
      const completedLessons = prog.completedCount || prog.lessons?.filter((l: any) => l.completed).length || 0;
      const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return {
        courseId: prog.courseId.toString(),
        percent,
        completedLessons,
        totalLessons,
        lastLessonId: prog.lastLessonId || "",
        certificateAt: prog.certificateAt || null,
      };
    });

    return NextResponse.json({
      user: { name: dbUser?.name || session.user.name, image: dbUser?.image || "" },
      courses: courses.map((c: any) => ({
        _id: c._id.toString(),
        title: c.title,
        slug: c.slug,
        thumbnail: c.thumbnail || "",
      })),
      progressData,
    });
  } catch (error: any) {
    console.error("Dashboard error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
