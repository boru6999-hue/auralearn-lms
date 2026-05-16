import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import Lesson from "@/models/Lesson";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const userId = session.user.id;

    const dbUser = userId
      ? await User.findById(userId).lean() as any
      : await User.findOne({ email: session.user.email }).lean() as any;

    const enrollments = await Enrollment.find({ userId }).lean() as any[];
    const courseIds = enrollments.map(e => e.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } }).lean() as any[];

    const progressData = await Promise.all(
      courses.map(async (course: any) => {
        const totalLessons = await Lesson.countDocuments({ courseId: course._id });
        const completedLessons = await Progress.countDocuments({ userId, courseId: course._id, completed: true });
        const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        return { courseId: course._id.toString(), percent, completedLessons, totalLessons };
      })
    );

    return NextResponse.json({
      user: { name: dbUser?.name, image: dbUser?.image || "" },
      courses: courses.map((c: any) => ({ _id: c._id.toString(), title: c.title, slug: c.slug, thumbnail: c.thumbnail || "" })),
      progressData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
