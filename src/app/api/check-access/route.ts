import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ hasAccess: false, role: "guest" });

    const role = (session.user as any).role || "student";

    // Admin - full access
    if (role === "admin") {
      return NextResponse.json({ hasAccess: true, role: "admin", reason: "admin" });
    }

    // Premium - can view courses and live
    if (role === "premium") {
      return NextResponse.json({ hasAccess: true, role: "premium", reason: "premium" });
    }

    // Student - locked
    return NextResponse.json({ hasAccess: false, role: "student" });
  } catch (e: any) {
    return NextResponse.json({ hasAccess: false, role: "student", error: e.message });
  }
}
