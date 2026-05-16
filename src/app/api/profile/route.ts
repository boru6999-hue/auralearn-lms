import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

async function getUser(session: any) {
  await connectDB();
  // Email-р хайна — хамгийн найдвартай
  const user = await User.findOne({ email: session.user.email });
  if (user) return user;
  // Байхгүй бол id-р хайна
  if (session.user.id) return await User.findById(session.user.id);
  return null;
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Email-р шууд update хийнэ
    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: body.name,
          role: body.role,
          ...(body.image && { image: body.image }),
          ...(body.coverImage && { coverImage: body.coverImage }),
        }
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    console.log("Saved image length:", updated.image?.length || 0);

    return NextResponse.json({
      name: updated.name,
      email: updated.email,
      role: updated.role,
      image: updated.image || "",
      coverImage: updated.coverImage || "",
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error.message);
    return NextResponse.json({ error: error.message || "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    await connectDB();

    // Email-р хайна
    const user = await User.findOne({ email: session.user.email });

    console.log("GET image length:", user?.image?.length || 0);

    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image || session.user.image || "",
      coverImage: user.coverImage || "",
    });
  } catch (error: any) {
    console.error("Profile GET error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
