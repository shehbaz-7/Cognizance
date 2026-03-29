import { NextResponse } from "next/server";
import { nimJSON, nimChat } from "@/lib/nvidia-ai";

export async function POST(req: Request) {
  try {
    const { skills, messages } = await req.json();

    // ─── Mode 1: Conversational Chat (when messages are provided) ───────────
    if (messages && messages.length > 0) {
      // Build skill context summary for the AI
      const skillSummary = skills && skills.length > 0
        ? skills.map((s: any) => `• ${s.name} (${s.proficiency || "Beginner"}, Retention: ${Math.round(s.retentionScore ?? 100)}%, Risk: ${Math.round((s.decayRisk ?? 0) * 100)}%)`).join("\n")
        : "No skills tracked yet.";

      const systemPrompt = `You are "Cognizance AI Mentor", a knowledgeable, friendly, and highly capable AI study mentor.

Your primary role is to HELP THE USER with whatever they ask — whether it's explaining concepts, giving study advice, answering technical questions, or having a general conversation about learning.

CONTEXT — The user is tracking these skills on Cognizance:
${skillSummary}

RULES:
1. ALWAYS answer the user's actual question directly and helpfully. Never ignore what they asked.
2. If they ask about a topic (e.g. "what is Java?", "explain recursion"), give a clear, accurate, and concise answer.
3. If they ask for study advice, use their skill data (retention scores, decay risks) to personalize your recommendations.
4. Keep responses concise but complete — aim for 2-4 sentences for simple questions, more for complex ones.
5. Be warm and encouraging, but professional.
6. Do NOT repeatedly talk about retention/decay unless the user specifically asks about it.
7. Use plain text only — no markdown formatting, no bullet points with *, no bold with **.`;

      // Build the message array for the AI
      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      try {
        const reply = await nimChat(chatMessages, { maxTokens: 500, temperature: 0.7 });
        return NextResponse.json({ message: reply.trim() });
      } catch {
        return NextResponse.json({ 
          message: "I'm having trouble connecting right now. Please try again in a moment." 
        });
      }
    }

    // ─── Mode 2: Daily Briefing (no messages, just skills) ──────────────────
    if (!skills || skills.length === 0) {
      return NextResponse.json({ 
        briefing: "Welcome to Cognizance. Add some skills to your library so I can start analyzing your cognitive patterns.", 
        recommendedAction: { type: "add_skill" } 
      });
    }

    const highRisk = skills.filter((s: any) => s.status === "decaying" || s.decayRisk > 0.7)
      .map((s: any) => `${s.name} (Risk: ${Math.round(s.decayRisk * 100)}%)`);
    
    const allWeaknesses = skills.map((s: any) => s.weakTopics?.join(", ")).filter(Boolean).join(" | ");

    const prompt = `You are a strict, highly analytical AI Study Mentor.
Analyze the following cognitive telemetry for the user:
- Total Skills Tracked: ${skills.length}
- High Memory Decay Risk: ${highRisk.length > 0 ? highRisk.join(", ") : "None. Retention is highly stable."}
- Known Structural Weaknesses: ${allWeaknesses || "None detected yet."}

Based strictly on this data, provide a highly personalized, proactive daily intel briefing.
Address the user directly. Be concise, professional, and actionable (maximum 3 sentences).

Return EXACTLY this JSON format (no markdown):
{
  "briefing": "The daily intel string",
  "recommendedAction": {
    "type": "quiz" | "study" | "review",
    "targetSkill": "Name of the single most critical skill to address today (or 'None')"
  }
}`;

    let data;
    try {
      data = await nimJSON<{ briefing: string, recommendedAction: { type: string, targetSkill: string } }>(prompt, { maxTokens: 400, temperature: 0.3 });
    } catch {
      data = {
        briefing: "Memory telemetry analyzed. Prioritize reviewing your highest risk subjects today to prevent structural forgetting.",
        recommendedAction: { type: "review", targetSkill: skills[0]?.name || "None" }
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Mentor error:", error);
    return NextResponse.json({ error: "Failed to generate mentor response" }, { status: 500 });
  }
}
