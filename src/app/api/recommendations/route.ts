import { NextResponse } from "next/server";
import { RetentionEngine } from "@/lib/retention-engine";
import type { Skill } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { skills = [] }: { skills: Skill[] } = await req.json();

    if (skills.length === 0) {
      return NextResponse.json({ recommendations: [
        { type: "info", message: "Add your first skill to get personalized recommendations.", action: "add_skill" }
      ]});
    }

    const recommendations: { type: string; message: string; action: string; skillId?: string }[] = [];

    // Sort by retention score (lowest first)
    const sorted = [...skills].sort((a, b) => a.retentionScore - b.retentionScore);

    // Decaying skills get urgent warnings
    for (const skill of sorted.filter(s => s.status === "decaying")) {
      recommendations.push({
        type: "warning",
        message: `${skill.name} retention is at ${skill.retentionScore}%. Take a quiz or review notes now.`,
        action: "study",
        skillId: skill.id,
      });
    }

    // Review-needed skills
    for (const skill of sorted.filter(s => s.status === "review").slice(0, 2)) {
      recommendations.push({
        type: "suggestion",
        message: `${skill.name} needs review soon — retention at ${skill.retentionScore}%.`,
        action: "study",
        skillId: skill.id,
      });
    }

    // Skills without quizzes
    for (const skill of skills.filter(s => s.quizHistory.length === 0).slice(0, 2)) {
      recommendations.push({
        type: "info",
        message: `Take your first quiz for ${skill.name} to establish a retention baseline.`,
        action: "quiz",
        skillId: skill.id,
      });
    }

    // If all healthy, encourage continued practice
    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        message: "All skills are healthy! Keep up your revision streak.",
        action: "none",
      });
    }

    return NextResponse.json({ recommendations: recommendations.slice(0, 5) });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ recommendations: [] });
  }
}
