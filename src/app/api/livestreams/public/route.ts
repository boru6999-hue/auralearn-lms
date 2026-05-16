import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

const LiveStreamSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  host:      { type: String, required: true },
  scheduled: { type: String },
  seats:     { type: Number, default: 20 },
  enrolled:  { type: Number, default: 0 },
  status:    { type: String, enum: ["scheduled","live","ended"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now },
});
const LiveStream = mongoose.models.LiveStream || mongoose.model("LiveStream", LiveStreamSchema);

// Public - get live and scheduled streams
export async function GET() {
  try {
    await connectDB();
    const streams = await LiveStream.find({
      status: { $in: ["live", "scheduled"] }
    }).sort({ status: -1, createdAt: -1 }).lean();
    return NextResponse.json(streams);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
