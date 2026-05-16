import { connectDB } from "@/lib/db";
import Progress from "@/models/Progress";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    await connectDB();
    const { lessonId, courseId, completed } = await req.json();
    const progress = await Progress.findOneAndUpdate(
      { userId: session.user.id, lessonId },
      { userId: session.user.id, lessonId, courseId, completed, completedAt: completed ? new Date() : null },
      { upsert: true, new: true }
    );
    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const progress = await Progress.find({ userId: session.user.id, courseId });
    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}