import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "И-мэйл аль хэдийн бүртгэлтэй" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    return NextResponse.json({ id: user._id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}