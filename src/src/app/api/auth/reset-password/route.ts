import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, password } = await req.json();
    const reset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (!reset) {
      return NextResponse.json({ error: "Token хүчингүй эсвэл хугацаа дууссан" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email: reset.email }, { passwordHash });
    await PasswordReset.findByIdAndUpdate(reset._id, { used: true });
    return NextResponse.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
