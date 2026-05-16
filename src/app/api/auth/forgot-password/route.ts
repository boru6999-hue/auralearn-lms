import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { sendPasswordResetEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Хэрэв бүртгэлтэй бол имэйл илгээгдэнэ" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordReset.create({ email, token, expiresAt });
    await sendPasswordResetEmail(email, token);
    return NextResponse.json({ message: "Имэйл илгээгдлээ" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
