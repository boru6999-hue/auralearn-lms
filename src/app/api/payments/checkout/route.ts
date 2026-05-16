import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Payment from "@/models/Payment";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    await connectDB();
    const { courseId } = await req.json();
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ error: "Course олдсонгүй" }, { status: 404 });
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: course.price * 100,
          product_data: { name: course.title },
        },
        quantity: 1,
      }],
      metadata: { courseId, userId: session.user.id },
      success_url: `${process.env.NEXT_PUBLIC_URL}/courses/${course.slug}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/courses/${course.slug}`,
    });
    await Payment.create({ userId: session.user.id, courseId, stripeSessionId: checkout.id, amount: course.price, status: "pending" });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}