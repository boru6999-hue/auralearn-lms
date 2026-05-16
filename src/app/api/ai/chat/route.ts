import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, lang } = await req.json();

    const systemPrompt = `You are AuraLearn's helpful AI tutor assistant. The platform teaches languages (English, Japanese, Korean, Chinese, French, German) and programming (Web Dev, React, Python, etc).
You help students with course questions, language tips, programming help, and study advice.
Current language: ${lang || "en"}. Respond in the same language the user writes in. Be friendly and educational. Format code with backtick blocks.`;

    // Convert messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 1000 }
        }),
      }
    );

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
