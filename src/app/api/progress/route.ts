import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Progress from "@/models/Progress";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    await connectDB();
    const progress = await Progress.findOne({ userId: (session.user as any).id, courseId });
    return NextResponse.json(progress || { lessons: [], lastLessonId: "", completedCount: 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { courseId, lessonId, watchTime, completed, quizScore, bookmarked, notes, totalLessons } = await req.json();
    await connectDB();
    const userId = (session.user as any).id;

    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = await Progress.create({ userId, courseId, lessons: [], totalLessons: totalLessons || 0 });
    }

    const lessonIdx = progress.lessons.findIndex((l: any) => l.lessonId === lessonId);
    if (lessonIdx >= 0) {
      if (watchTime !== undefined) progress.lessons[lessonIdx].watchTime = watchTime;
      if (completed !== undefined) progress.lessons[lessonIdx].completed = completed;
      if (quizScore !== undefined) progress.lessons[lessonIdx].quizScore = quizScore;
      if (bookmarked !== undefined) progress.lessons[lessonIdx].bookmarked = bookmarked;
      if (notes !== undefined) progress.lessons[lessonIdx].notes = notes;
      progress.lessons[lessonIdx].lastWatched = new Date();
    } else {
      progress.lessons.push({ lessonId, watchTime: watchTime||0, completed: completed||false, quizScore: quizScore||-1, bookmarked: bookmarked||false, notes: notes||"" });
    }

    progress.lastLessonId = lessonId;
    progress.completedCount = progress.lessons.filter((l: any) => l.completed).length;
    if (totalLessons) progress.totalLessons = totalLessons;

    // Certificate
    if (progress.completedCount >= progress.totalLessons && progress.totalLessons > 0 && !progress.certificateAt) {
      progress.certificateAt = new Date();
    }

    await progress.save();
    return NextResponse.json(progress);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
