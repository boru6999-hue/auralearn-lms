import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    await connectDB();
    const { courseId } = await req.json();
    const existing = await Enrollment.findOne({ userId: session.user.id, courseId });
    if (existing) return NextResponse.json({ error: "Аль хэдийн бүртгүүлсэн" }, { status: 400 });
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ error: "Course олдсонгүй" }, { status: 404 });
    if (course.price > 0) return NextResponse.json({ error: "Төлбөртэй course" }, { status: 400 });
    const enrollment = await Enrollment.create({ userId: session.user.id, courseId });
    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}