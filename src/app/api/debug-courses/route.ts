import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();
    const all = await Course.find({}).lean();
    return NextResponse.json({ 
      count: all.length,
      courses: all.map((c:any) => ({ 
        id: c._id, 
        title: c.title, 
        status: c.status,
        category: c.category
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
