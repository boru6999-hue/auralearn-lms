import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, lang } = await req.json();

    const langName =
      lang === "mn" ? "Mongolian (Монгол)" :
      lang === "ja" ? "Japanese (日本語)" :
      lang === "ko" ? "Korean (한국어)" :
      lang === "fr" ? "French (Français)" :
      lang === "de" ? "German (Deutsch)" :
      lang === "zh" ? "Chinese (中文)" : "English";

    const systemPrompt = `Та AuraLearn онлайн сургалтын платформын AI туслагч юм.
Хэрэглэгчийн асуултад ЗААВАЛ ${langName} хэлээр хариулна уу.
Хэрэв хэрэглэгч Монгол хэлээр бичвэл Монгол хэлээр хариул.
Хэрэв хэрэглэгч Англи хэлээр бичвэл Англи хэлээр хариул.
Хэрэглэгчийн бичсэн хэлийг таньж, тэр хэлээр нь хариулна уу.

Та дараах чиглэлээр тусалдаг:
- Хэл сурах (Англи, Япон, Солонгос, Хятад, Франц, Герман)
- Программчлал (Web, React, Next.js, Python гэх мэт)
- Сургалтын зөвлөгөө
- Курсийн агуулга тайлбарлах

Найрсаг, тодорхой, богино хариулт өг. Код бол backtick ашигла.`;

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Алдаа гарлаа";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
