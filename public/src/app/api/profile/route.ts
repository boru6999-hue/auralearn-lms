import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

async function getUser(session: any) {
  await connectDB();
  if (session.user.id) {
    const user = await User.findById(session.user.id);
    if (user) return user;
  }
  return await User.findOne({ email: session.user.email });
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    const user = await getUser(session);
    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    const body = await req.json();

    // Шууд set хийнэ
    user.name = body.name || user.name;
    user.email = body.email || user.email;
    user.role = body.role || user.role;
    if (body.image) user.image = body.image;
    if (body.coverImage) user.coverImage = body.coverImage;

    await user.save();

    console.log("Saved image length:", user.image?.length || 0);

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image || "",
      coverImage: user.coverImage || "",
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error.message);
    return NextResponse.json({ error: error.message || "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    const user = await getUser(session);
    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    console.log("GET image length:", user.image?.length || 0);

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
