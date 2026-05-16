import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { answers, lang } = await req.json();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `Recommend 3 courses. Respond ONLY with valid JSON:
[{"title":"...","description":"...","level":"...","duration":"...","emoji":"...","category":"..."}]
Language: ${lang === "mn" ? "Mongolian" : lang === "ja" ? "Japanese" : lang === "ko" ? "Korean" : "English"}` }]
          },
          contents: [{
            role: "user",
            parts: [{ text: `User wants: ${answers[0]}, level: ${answers[1]}, time: ${answers[2]}, goal: ${answers[3]}` }]
          }],
          generationConfig: { maxOutputTokens: 800 }
        }),
      }
    );

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const recs = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(recs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
