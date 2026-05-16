import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const course = await Course.findOne({
      $or: [{ slug: params.slug }, { _id: params.slug.length === 24 ? params.slug : null }]
    }).lean();
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
