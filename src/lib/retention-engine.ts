/**
 * Cognizance — Retention Engine
 * 
 * Single Ebbinghaus Forgetting Curve model:
 *   R = e^(-t / S)
 * 
 * R = retention (0-1)
 * t = hours since last practice
 * S = strength (half-life in hours)
 */

import type { Skill, SkillStatus, RevisionTask, CognitiveProfile } from "./types";

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_HALF_LIFE: Record<string, number> = {
  Beginner: 48,      // 2 days
  Intermediate: 96,  // 4 days
  Advanced: 168,     // 7 days
};

const CONFIDENCE_MULTIPLIER: Record<number, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 1.2,
  5: 1.4,
};

const STATUS_THRESHOLDS = {
  healthy: 70,
  review: 50,
};

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Calculate the strength (half-life in hours) for a skill.
 */
function calculateStrength(skill: Skill): number {
  const base = BASE_HALF_LIFE[skill.proficiency] ?? 96;
  const revisionBoost = 1 + 0.1 * Math.min(skill.revisionCount, 20);
  const quizAccuracy = getAverageQuizAccuracy(skill);
  const accuracyBoost = 1 + 0.2 * (quizAccuracy / 100);
  const confMultiplier = CONFIDENCE_MULTIPLIER[skill.confidence] ?? 1.0;
  
  return base * revisionBoost * accuracyBoost * confMultiplier;
}

/**
 * Get average quiz accuracy for a skill (0-100).
 */
function getAverageQuizAccuracy(skill: Skill): number {
  if (skill.quizHistory.length === 0) return 50;
  const correct = skill.quizHistory.filter(q => q.correct).length;
  return Math.round((correct / skill.quizHistory.length) * 100);
}

/**
 * Compute hours since last practice.
 */
function hoursSinceLastPractice(skill: Skill): number {
  const now = new Date();
  const last = new Date(skill.lastPracticed);
  if (isNaN(last.getTime())) return 0;
  return Math.max(0, (now.getTime() - last.getTime()) / (1000 * 60 * 60));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const RetentionEngine = {
  /**
   * Compute full retention state for a skill.
   */
  compute(skill: Skill): { score: number; risk: number; status: SkillStatus; nextReviewDate: string; forecast24h: number; forecast7d: number } {
    const S = calculateStrength(skill);
    const t = hoursSinceLastPractice(skill);
    
    // R = e^(-t/S)
    const R = Math.exp(-t / S);
    const score = Math.round(R * 100);
    const risk = Math.round((1 - R) * 100) / 100;
    
    // Projections
    const t24 = t + 24;
    const t168 = t + 168; // 7 days
    const R24 = Math.exp(-t24 / S);
    const R168 = Math.exp(-t168 / S);
    
    let status: SkillStatus = "healthy";
    if (score < STATUS_THRESHOLDS.review) status = "decaying";
    else if (score < STATUS_THRESHOLDS.healthy) status = "review";
    
    // Next review = when retention drops to 75%
    const hoursUntil75 = S * Math.log(1 / 0.75);
    const lastDate = new Date(skill.lastPracticed);
    const nextReview = isNaN(lastDate.getTime())
      ? new Date(Date.now() + 48 * 60 * 60 * 1000)
      : new Date(lastDate.getTime() + hoursUntil75 * 60 * 60 * 1000);
    
    return {
      score: Math.max(0, Math.min(100, score)),
      risk: Math.max(0, Math.min(1, risk)),
      status,
      nextReviewDate: nextReview.toISOString(),
      forecast24h: Math.round(R24 * 100),
      forecast7d: Math.round(R168 * 100),
    };
  },

  /**
   * Get status label from retention score.
   */
  getStatus(score: number): SkillStatus {
    if (score >= STATUS_THRESHOLDS.healthy) return "healthy";
    if (score >= STATUS_THRESHOLDS.review) return "review";
    return "decaying";
  },

  /**
   * Update skill after quiz completion.
   */
  updateAfterQuiz(skill: Skill, accuracy: number): Partial<Skill> {
    const now = new Date().toISOString();
    const newRevisionCount = skill.revisionCount + 1;
    
    // Boost or penalize confidence slightly based on quiz performance
    let newConfidence = skill.confidence;
    if (accuracy >= 80) newConfidence = Math.min(5, skill.confidence + 1);
    else if (accuracy < 40) newConfidence = Math.max(1, skill.confidence - 1);
    
    return {
      lastPracticed: now,
      revisionCount: newRevisionCount,
      confidence: newConfidence,
    };
  },

  /**
   * Get revision tasks sorted by urgency.
   */
  getRevisionTasks(skills: Skill[]): { today: RevisionTask[]; tomorrow: RevisionTask[]; week: RevisionTask[] } {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const today: RevisionTask[] = [];
    const tomorrowTasks: RevisionTask[] = [];
    const week: RevisionTask[] = [];
    
    for (const skill of skills) {
      const { score, status, nextReviewDate } = this.compute(skill);
      const reviewDate = new Date(nextReviewDate);
      
      const task: RevisionTask = {
        skillId: skill.id,
        skillName: skill.name,
        retentionScore: score,
        status,
        action: skill.quizHistory.length < 2 ? "quiz" : "review",
        estimatedMinutes: skill.proficiency === "Beginner" ? 10 : skill.proficiency === "Intermediate" ? 15 : 20,
      };
      
      if (reviewDate <= now || status === "decaying") {
        today.push(task);
      } else if (reviewDate <= tomorrow) {
        tomorrowTasks.push(task);
      } else if (reviewDate <= weekEnd) {
        week.push(task);
      }
    }
    
    // Sort by retention score (lowest first = most urgent)
    const sortFn = (a: RevisionTask, b: RevisionTask) => a.retentionScore - b.retentionScore;
    return {
      today: today.sort(sortFn),
      tomorrow: tomorrowTasks.sort(sortFn),
      week: week.sort(sortFn),
    };
  },

  /**
   * Get weak concepts from quiz history.
   */
  getWeakTopics(skill: Skill): { name: string; accuracy: number; severity: "critical" | "moderate" | "mild" }[] {
    const conceptStats: Record<string, { correct: number; total: number }> = {};
    
    for (const attempt of skill.quizHistory) {
      const c = attempt.concept || "general";
      if (!conceptStats[c]) conceptStats[c] = { correct: 0, total: 0 };
      conceptStats[c].total++;
      if (attempt.correct) conceptStats[c].correct++;
    }
    
    return Object.entries(conceptStats)
      .map(([name, stats]) => {
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        const severity = accuracy < 40 ? "critical" as const : accuracy < 60 ? "moderate" as const : "mild" as const;
        return { name, accuracy, severity };
      })
      .filter(c => c.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);
  },

  /**
   * Aggregate all learning telemetry into a global Cognitive Profile.
   */
  getCognitiveProfile(skills: Skill[]): CognitiveProfile {
    let totalAttempts = 0;
    let totalCorrect = 0;
    let totalTime = 0;
    let totalRisk = 0;
    
    const conceptFreq: Record<string, { correct: number; total: number }> = {};

    for (const skill of skills) {
      const { risk } = this.compute(skill);
      totalRisk += risk;

      for (const attempt of skill.quizHistory) {
        totalAttempts++;
        if (attempt.correct) totalCorrect++;
        totalTime += attempt.responseTimeMs;

        const c = attempt.concept;
        if (!conceptFreq[c]) conceptFreq[c] = { correct: 0, total: 0 };
        conceptFreq[c].total++;
        if (attempt.correct) conceptFreq[c].correct++;
      }
    }

    // A fast learning speed is high accuracy + low response time.
    // Assuming 5000ms is an "average" fast response.
    const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0.5;
    const avgTime = totalAttempts > 0 ? totalTime / totalAttempts : 15000;
    // Map time to a 0-1 speed multiplier (faster = higher)
    const timeMultiplier = Math.max(0, 1 - (avgTime - 2000) / 20000); 
    const learningSpeed = Math.round((accuracy * 0.6 + timeMultiplier * 0.4) * 100);

    const forgettingSpeed = skills.length > 0 ? Math.round((totalRisk / skills.length) * 100) : 0;

    const sortedConcepts = Object.entries(conceptFreq).map(([name, stats]) => ({
      name,
      acc: stats.correct / stats.total,
      volume: stats.total
    })).sort((a, b) => b.acc - a.acc || b.volume - a.volume);

    const strengths = sortedConcepts.filter(c => c.acc >= 0.7 && c.volume > 1).map(c => c.name).slice(0, 3);
    const weaknesses = sortedConcepts.filter(c => c.acc < 0.6).sort((a, b) => a.acc - b.acc).map(c => c.name).slice(0, 3);

    return {
      learningSpeed: totalAttempts === 0 ? 0 : Math.max(1, Math.min(100, learningSpeed)),
      forgettingSpeed,
      globalStrengths: strengths.length ? strengths : ["Not enough data"],
      globalWeaknesses: weaknesses.length ? weaknesses : ["Not enough data"],
    };
  },

  /**
   * Get points for an SVG learning curve graph.
   */
  getRetentionCurve(skill: Skill): { x: number; y: number; isFuture: boolean }[] {
    const S = calculateStrength(skill);
    const lastPracticed = new Date(skill.lastPracticed).getTime();
    const now = Date.now();
    const points: { x: number; y: number; isFuture: boolean }[] = [];

    // Past 48 hours to now
    for (let i = -48; i <= 0; i += 6) {
      const tRelative = i; // hours relative to now
      const tSincePractice = (now - lastPracticed) / (1000 * 60 * 60) + tRelative;
      const R = Math.exp(-Math.max(0, tSincePractice) / S);
      points.push({ x: i, y: Math.round(R * 100), isFuture: false });
    }

    // Now to Future 7 days
    for (let i = 6; i <= 168; i += 12) {
      const tSincePractice = (now - lastPracticed) / (1000 * 60 * 60) + i;
      const R = Math.exp(-tSincePractice / S);
      points.push({ x: i, y: Math.round(R * 100), isFuture: true });
    }

    return points;
  },

  /**
   * Synthesize personalized advice based on telemetry.
   */
  getPersonalizedAdvice(skill: Skill): { type: "success" | "warning" | "info"; text: string; action: string } {
    const { score, status } = this.compute(skill);
    const accuracy = getAverageQuizAccuracy(skill);
    const quizCount = skill.quizHistory.length;

    if (score < 40) {
      return { 
        type: "warning", 
        text: "Critical cognitive decay detected. Pathways are destabilizing.", 
        action: "Take a Scenario-based Practice immediately." 
      };
    }

    if (quizCount > 0 && accuracy < 60) {
      return { 
        type: "info", 
        text: "Accuracy is lagging behind speed. Focus on 'Why' before 'How'.", 
        action: "Review Study Notes: Architecture chapter." 
      };
    }

    if (accuracy > 85 && score > 80) {
      return { 
        type: "success", 
        text: "Strong long-term synaptic consolidation. Ready for advanced abstractions.", 
        action: "Try an Advanced Level Quiz." 
      };
    }

    if (status === "review") {
      return { 
        type: "info", 
        text: "Optimal window for spaced repetition is open.", 
        action: "Practice now for 2x retention boost." 
      };
    }

    return { 
      type: "info", 
      text: "Maintain current practice velocity to reach Mastery.", 
      action: "Stay consistent." 
    };
  }
};
