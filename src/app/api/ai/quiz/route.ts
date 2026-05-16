import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, lang } = await req.json();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `Generate exactly 5 multiple choice quiz questions. Respond ONLY with valid JSON array:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]
Language: ${lang === "mn" ? "Mongolian" : lang === "ja" ? "Japanese" : lang === "ko" ? "Korean" : "English"}` }]
          },
          contents: [{ role: "user", parts: [{ text: `Topic: ${topic}` }] }],
          generationConfig: { maxOutputTokens: 1000 }
        }),
      }
    );

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const quizzes = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(quizzes);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
