import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("status");
  await connectDB();
  const query = filter && filter !== "all" ? { status: filter } : {};
  const payments = await Payment.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  const total = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, sum: { $sum: "$amount" } } }
  ]);
  const thisMonth = await Payment.aggregate([
    { $match: { status: "completed", createdAt: { $gte: new Date(new Date().setDate(1)) } } },
    { $group: { _id: null, sum: { $sum: "$amount" } } }
  ]);
  return NextResponse.json({
    payments,
    stats: {
      total: total[0]?.sum || 0,
      thisMonth: thisMonth[0]?.sum || 0,
      pending: await Payment.countDocuments({ status: "pending" }),
      refunded: await Payment.countDocuments({ status: "refunded" }),
    }
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id, status } = await req.json();
  await connectDB();
  const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
  return NextResponse.json(payment);
}
