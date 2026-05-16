import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  await connectDB();
  
  const allUsers = await User.find({}).select("name email image role _id").lean();
  
  return NextResponse.json({
    session: {
      id: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name,
    },
    users: allUsers.map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      imageLength: (u.image || "").length,
      role: u.role,
    }))
  });
}
