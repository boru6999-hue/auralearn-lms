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
    const { name, email, role } = body;
    
    // image болон coverImage-г тусад нь шалгана
    const updateData: any = { name, email, role };
    if (body.image !== undefined) updateData.image = body.image;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      name: updated.name,
      email: updated.email,
      role: updated.role,
      image: updated.image || "",
      coverImage: updated.coverImage || "",
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
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

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image || session.user.image || "",
      coverImage: user.coverImage || "",
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
