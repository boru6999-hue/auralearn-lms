import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await connectDB();
    const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(courses);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await req.json();
    await connectDB();
    const slug = (body.title || "course")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      + "-" + Date.now();
    const course = await Course.create({
      title:       body.title || "Untitled",
      slug,
      description: body.description || "",
      category:    body.category || "development",
      level:       body.level || "beginner",
      price:       0,
      status:      body.status || "draft",
      featured:    body.featured || false,
      instructor:  body.instructor || "AuraLearn",
      thumbnail:   body.thumbnail || "",
      sections:    [],
    });
    return NextResponse.json(course);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id, ...update } = await req.json();
    await connectDB();

    // If title changed, update slug too
    if (update.title) {
      update.slug = update.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        + "-" + Date.now();
    }

    // Use $set to avoid triggering pre-save middleware
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: false }
    ).lean();

    return NextResponse.json(course);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await req.json();
    await connectDB();
    await Course.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
