import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await connectDB();
  const users = await User.find({})
    .select("name email role image createdAt status")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id, role, status } = await req.json();
  await connectDB();
  const update: any = {};
  if (role) update.role = role;
  if (status) update.status = status;
  const user = await User.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await req.json();
  await connectDB();
  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
