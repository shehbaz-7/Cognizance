import { NextResponse } from "next/server";
import { nimChat } from "@/lib/nvidia-ai";

export async function POST(req: Request) {
  try {
    const { skill, quizHistory } = await req.json();
    if (!skill) return NextResponse.json({ error: "Skill is required" }, { status: 400 });

    // Compute concept stats
    const conceptStats: Record<string, { correct: number; total: number }> = {};
    for (const attempt of (quizHistory || [])) {
      const c = attempt.concept || "general";
      if (!conceptStats[c]) conceptStats[c] = { correct: 0, total: 0 };
      conceptStats[c].total++;
      if (attempt.correct) conceptStats[c].correct++;
    }

    const prompt = `Analyze weakness for skill "${skill}".

Quiz performance:
${Object.entries(conceptStats).map(([c, s]) => `- ${c}: ${Math.round((s.correct / s.total) * 100)}% accuracy (${s.total} attempts)`).join("\n")}

Return ONLY valid JSON:
{
  "weakConcepts": [
    { "name": "concept", "severity": "critical|moderate|mild", "accuracy": 0-100, "suggestion": "what to study" }
  ],
  "strongConcepts": ["concept1"],
  "revisionPlan": [
    { "day": 1, "focus": "topic", "action": "what to do", "minutes": 15 }
  ]
}

Only include concepts with accuracy < 70%.`;

    try {
      const raw = await nimChat([{ role: "user", content: prompt }], { maxTokens: 1500, temperature: 0.2 });
      const cleaned = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
      const result = JSON.parse(cleaned);
      return NextResponse.json(result);
    } catch {
      // Mock fallback
      const weakConcepts = Object.entries(conceptStats)
        .map(([name, stats]) => {
          const accuracy = Math.round((stats.correct / stats.total) * 100);
          return { name, accuracy, severity: accuracy < 40 ? "critical" : accuracy < 60 ? "moderate" : "mild" as const, suggestion: `Review ${name} fundamentals and practice with examples` };
        })
        .filter(c => c.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy);

      const strongConcepts = Object.entries(conceptStats)
        .filter(([, stats]) => Math.round((stats.correct / stats.total) * 100) >= 70)
        .map(([name]) => name);

      return NextResponse.json({
        weakConcepts,
        strongConcepts,
        revisionPlan: weakConcepts.slice(0, 5).map((wc, i) => ({
          day: i + 1,
          focus: wc.name,
          action: wc.suggestion,
          minutes: 15,
        })),
      });
    }
  } catch (error) {
    console.error("Analyze weakness error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
