import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Payment from "@/models/Payment";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await connectDB();

  const [totalUsers, totalCourses, totalRevenue, monthlyRevenue] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, sum: { $sum: "$amount" } } }
    ]),
    // Last 12 months revenue
    Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ])
  ]);

  // Monthly user signups
  const monthlyUsers = await User.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 }
  ]);

  return NextResponse.json({
    totalUsers,
    totalCourses,
    totalRevenue: totalRevenue[0]?.sum || 0,
    monthlyRevenue,
    monthlyUsers,
  });
}
