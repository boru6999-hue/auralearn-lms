import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const users = await User.find({}).select("name email role createdAt").lean();
  return NextResponse.json(users);
}
