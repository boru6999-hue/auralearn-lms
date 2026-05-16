import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({ status: "published" })
      .select("title slug category description thumbnail featured studentsCount rating level instructor")
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(courses);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
