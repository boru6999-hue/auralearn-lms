import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "AuraLearn <onboarding@resend.dev>",
    to: email,
    subject: "AuraLearn - Нууц үг сэргээх",
    html: `
      <div style="background:#0a0a0f;padding:40px;font-family:Arial,sans-serif;color:#f1f0ff;max-width:500px;margin:0 auto;border-radius:16px;">
        <h1 style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin-bottom:8px;font-weight:900;">AuraLearn</h1>
        <p style="color:#94a3b8;margin-bottom:24px;font-size:15px;">Нууц үг сэргээх хүсэлт илгээгдлээ</p>
        <p style="color:#f1f0ff;margin-bottom:24px;">Доорх товч дарж нууц үгээ сэргээнэ үү:</p>
        <a href="${resetUrl}" style="background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;font-size:15px;">
          🔐 Нууц үг сэргээх
        </a>
        <p style="color:#94a3b8;margin-top:28px;font-size:13px;border-top:1px solid #1e1e3a;padding-top:20px;">
          ⏰ Энэ линк <strong style="color:#f1f0ff;">1 цагийн</strong> дараа хүчингүй болно.<br/><br/>
          Хэрэв та энэ хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.
        </p>
      </div>
    `,
  });
}
