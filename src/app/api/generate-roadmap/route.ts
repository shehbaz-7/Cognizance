import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills, profile } = await req.json();

    const prompt = `
      You are the Cognizance AI Neuro-Architect. 
      Based on the following user cognitive data, generate a high-fidelity 3-phase Mastery Roadmap.
      
      User Skills: ${JSON.stringify(skills.map((s: any) => ({ name: s.name, proficiency: s.proficiency, weaknesses: s.weakTopics })))}
      Cognitive Profile: ${JSON.stringify(profile)}

      Structure your response as JSON:
      {
        "title": "Example: Full-Stack Neural Optimization",
        "description": "A brief strategic overview of the roadmap.",
        "phases": [
          {
            "name": "Phase 1: Foundation",
            "goal": "What is the primary objective?",
            "milestones": ["Milestone 1", "Milestone 2"],
            "estimatedWeeks": 2
          }
        ],
        "mentorAdvice": "A final piece of deep-focus advice."
      }
    `;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-405b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const roadmap = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
