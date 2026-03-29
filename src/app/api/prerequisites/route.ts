import { NextResponse } from "next/server";
import { nimJSON } from "@/lib/nvidia-ai";

export async function POST(req: Request) {
  try {
    const { skill, proficiency } = await req.json();

    if (!skill || !proficiency) {
      return NextResponse.json({ error: "Skill and proficiency required" }, { status: 400 });
    }

    const prompt = `You are a strict computer science academic advisor. 
The user wants to learn "${skill}" at a "${proficiency}" level.
Identify exactly 3 to 5 absolute foundational prerequisites required to learn this skill effectively.

CRITICAL RULE: Do NOT list prerequisites that are already part of the "${skill}" curriculum itself. 
For example:
- If the skill is "Java" at "Beginner" level, do NOT list "Java Syntax" or "Java Basics". instead, list EXTERNAL foundations like "Basic Logic", "Algorithmic Thinking", or "Variables & Data Types".
- If the skill is "React", prerequisites might be ["JavaScript", "HTML", "CSS", "DOM Manipulation"].

Focus on what knowledge is REQUIRED BEFORE starting "${skill}".

OUTPUT FORMAT:
Return ONLY a valid JSON array of strings mapping out these EXTERNAL required foundations. Do not include markdown formatting or extra text.`;

    const prerequisites = await nimJSON<string[]>(prompt);

    return NextResponse.json({ prerequisites });
  } catch (error) {
    console.error("Prerequisites Analyzer Error:", error);
    // Graceful fallback if NIM fails
    return NextResponse.json({ prerequisites: [] });
  }
}
