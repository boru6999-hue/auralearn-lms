import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, lang } = await req.json();

    const systemPrompt = `You are AuraLearn AI assistant for an online learning platform.
IMPORTANT: Always respond in the SAME language the user writes in.
- If user writes in Mongolian -> respond in Mongolian
- If user writes in English -> respond in English  
- If user writes in Japanese -> respond in Japanese
- If user writes in Korean -> respond in Korean

You help with:
- Language learning (English, Japanese, Korean, Chinese, French, German)
- Programming (Web, React, Next.js, Python, etc)
- Study advice and course content explanations

Be friendly, clear and concise. Use backticks for code.`;

    const contents = (messages || []).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || m.text || "" }],
    }));

    if (contents.length === 0) {
      return NextResponse.json({ text: "Hello! How can I help you?" });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    if (data.error) {
      console.error("Gemini error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error";
    return NextResponse.json({ text });

  } catch (e: any) {
    console.error("Chat route error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
