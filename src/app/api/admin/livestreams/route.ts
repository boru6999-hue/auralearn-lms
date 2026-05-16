import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";

// LiveStream model
const LiveStreamSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  host:      { type: String, required: true },
  scheduled: { type: String, required: true },
  seats:     { type: Number, default: 20 },
  enrolled:  { type: Number, default: 0 },
  status:    { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now },
});

const LiveStream = mongoose.models.LiveStream || mongoose.model("LiveStream", LiveStreamSchema);

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await connectDB();
  const streams = await LiveStream.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(streams);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  await connectDB();
  const stream = await LiveStream.create(body);
  return NextResponse.json(stream);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id, status } = await req.json();
  await connectDB();
  const stream = await LiveStream.findByIdAndUpdate(id, { status }, { new: true });
  return NextResponse.json(stream);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await req.json();
  await connectDB();
  await LiveStream.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
