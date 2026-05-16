import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const lessonId = searchParams.get("lessonId") || "";
    await connectDB();
    const comments = await Comment.find({ courseId, lessonId }).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json(comments);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { courseId, lessonId, content } = await req.json();
    await connectDB();
    const comment = await Comment.create({
      courseId, lessonId: lessonId||"",
      userId: (session.user as any).id,
      userName: session.user.name || session.user.email,
      userImage: session.user.image || "",
      content,
    });
    return NextResponse.json(comment);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
