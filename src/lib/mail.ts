import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL
    || process.env.NEXTAUTH_URL
    || process.env.AUTH_URL
    || "https://auralearn-lms.vercel.app";

  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "AuraLearn <onboarding@resend.dev>",
    to: email,
    subject: "AuraLearn — Нууц үг сэргээх",
    html: `
      <div style="background:#0a0a0f;padding:40px;font-family:Arial,sans-serif;color:#fff;max-width:500px;margin:0 auto;border-radius:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
          <div style="width:32px;height:32px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:14px;">A</div>
          <span style="font-size:18px;font-weight:600;color:#fff;">AuraLearn</span>
        </div>
        <h2 style="color:#fff;font-size:22px;font-weight:300;margin-bottom:8px;letter-spacing:-0.5px;">Нууц үг сэргээх</h2>
        <p style="color:rgba(255,255,255,0.5);margin-bottom:28px;font-size:14px;line-height:1.6;">
          Та нууц үг сэргээх хүсэлт илгээсэн байна. Доорх товч дарж нууц үгээ шинэчилнэ үү.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#fff;color:#000;padding:12px 28px;border-radius:100px;text-decoration:none;font-weight:500;font-size:14px;margin-bottom:28px;">
          Нууц үг сэргээх →
        </a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;line-height:1.6;">
          Энэ линк <strong style="color:rgba(255,255,255,0.5);">1 цагийн</strong> дараа хүчингүй болно.<br/>
          Хэрэв та энэ хүсэлт илгээгээгүй бол энэ имэйлийг үл тооморлоно уу.
        </p>
        <p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:12px;">auralearn-lms.vercel.app</p>
      </div>
    `,
  });
}
