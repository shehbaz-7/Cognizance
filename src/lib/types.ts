// ─── Cognizance — Central Type Definitions ──────────────────────────────────

export interface SavedRevision {
  id: string;
  type: "flashcards" | "scenario" | "notes" | "quiz";
  title: string;
  content: any; // Raw JSON payload returned from AI
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Master";
  lastPracticed: string;
  confidence: number;       // 1-5
  retentionScore: number;   // 0-100
  decayRisk: number;        // 0-1
  revisionCount: number;
  quizHistory: QuizAttempt[];
  savedRevisions: SavedRevision[]; // Archival storage for generated materials
  weakTopics: string[];
  subskills: Subskill[];
  nextReviewDate: string;    // Exact timestamp of next critical decay (75%)
  forecast24h: number;      // Predicted retention in 24h
  forecast7d: number;       // Predicted retention in 7d
  status: SkillStatus;
  notes: string;
  prerequisites: string[];   // Foundational knowledge required
  missingPrerequisites: string[]; // Prerequisites the user doesn't have yet
  createdAt: string;
}

export interface Subskill {
  name: string;
  strength: number;         // 0-100 independently computed
  lastTested: string;       // Timestamp
}

export type SkillStatus = "healthy" | "review" | "decaying";

export interface CognitiveProfile {
  learningSpeed: number;    // 0-100 (combination of accuracy + response time)
  forgettingSpeed: number;  // 0-100 (aggregate decay rate)
  globalStrengths: string[];
  globalWeaknesses: string[];
}

export interface QuizAttempt {
  id: string;
  question: string;
  correct: boolean;
  concept: string;
  subskill: string;         // Link to specific subskill
  responseTimeMs: number;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  concept: string;
  subskill: string;
}

export interface GeneratedNotes {
  id: string;
  skill: string;
  proficiency: string;
  overview: string;
  prerequisites: string[];
  chapters: NoteChapter[];
  commonMistakes: string[];
  studyGuide: StudyGuide;
  masteryRoadmap: RoadmapStep[];
  revisionSummary: string[];
  miniExercises: string[];
  interviewPoints: string[];
  references?: { title: string; url: string; snippet: string }[];
  generatedAt: string;
  model: string;
}

export interface NoteChapter {
  title: string;
  content: string;
  examples: string[];
  keyPoints: string[];
}

export interface StudyGuide {
  studyOrder: string[];
  depthAdvice: string;
  practiceAfterEachTopic: string;
  beginnerToMastery: string;
  revisionStrategy: string;
}

export interface RoadmapStep {
  level: string;
  topics: string[];
  goal: string;
}

export interface WeakConcept {
  name: string;
  severity: "critical" | "moderate" | "mild";
  accuracy: number;
  suggestion: string;
}

export interface RevisionTask {
  skillId: string;
  skillName: string;
  retentionScore: number;
  status: SkillStatus;
  action: "quiz" | "review";
  estimatedMinutes: number;
}
