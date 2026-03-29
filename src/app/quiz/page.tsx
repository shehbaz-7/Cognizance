"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSkills } from "@/lib/SkillContext";
import type { QuizQuestion, QuizAttempt } from "@/lib/types";
import { Loader2, PenTool, CheckCircle2, XCircle, ArrowRight, RotateCcw, BarChart2 } from "lucide-react";
import Link from "next/link";

function QuizContent() {
  const searchParams = useSearchParams();
  const { skills, addQuizResult, saveRevision, isSyncing } = useSkills();
  const [selectedSkillId, setSelectedSkillId] = useState(searchParams.get("skill") || "");
  const [selectedMode, setSelectedMode] = useState<"MCQ" | "Scenario" | "Flashcard">("MCQ");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [startTime, setStartTime] = useState(0);

  const selectedSkill = selectedSkillId ? skills.find(s => s.id === selectedSkillId) : undefined;

  const startQuiz = async () => {
    if (!selectedSkill) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: selectedSkill.name,
          proficiency: selectedSkill.proficiency,
          weakTopics: selectedSkill.weakTopics,
          mode: selectedMode,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      saveRevision(selectedSkill.id, {
        type: selectedMode.toLowerCase() as any,
        title: `${selectedMode}: ${selectedSkill.name}`,
        content: data.questions
      });
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setAttempts([]);
      setSelectedOption(null);
      setStartTime(Date.now());
    } catch {
      // Silently handle — API has its own fallback
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (option: string) => {
    if (selectedOption !== null) return;
    const q = questions[currentIndex];
    const correct = option === q.answer;
    const elapsed = Date.now() - startTime;

    setSelectedOption(option);
    if (correct) setScore(prev => prev + 1);

    setAttempts(prev => [...prev, {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
      question: q.question,
      correct,
      concept: q.concept,
      subskill: q.subskill || "General",
      responseTimeMs: elapsed,
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setStartTime(Date.now());
    } else {
      // Submit all results
      if (selectedSkillId) {
        addQuizResult(selectedSkillId, attempts);
      }
      setShowResult(true);
    }
  };

  // Group attempts by concept for weakness display
  const conceptResults = attempts.reduce((acc, a) => {
    if (!acc[a.concept]) acc[a.concept] = { correct: 0, total: 0 };
    acc[a.concept].total++;
    if (a.correct) acc[a.concept].correct++;
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1000px] mx-auto w-full pt-8 relative">
      {/* Cloud Sync Status Indicator */}
      {isSyncing && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Neural Link Syncing...</span>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-1 text-white tracking-tight">Quiz & Practice</h1>
      <p className="text-sm text-zinc-400 mb-8 font-medium">Test your knowledge and strengthen retention curves</p>

      {/* Skill Select + Start */}
      {questions.length === 0 && !showResult && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-8 text-center">
          <PenTool className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Ready to test yourself?</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
            Select a skill to generate a targeted quiz based on your proficiency and weak areas.
          </p>

          <div className="flex flex-col gap-4 max-w-xl mx-auto">
            <div className="flex gap-3">
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="flex-1 bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
              >
                <option value="">Select skill...</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.proficiency})</option>)}
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as any)}
                className="w-[140px] bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
              >
                <option value="MCQ">MCQ</option>
                <option value="Scenario">Scenario</option>
                <option value="Flashcard">Flashcards</option>
              </select>
            </div>
            
            <button
              onClick={startQuiz}
              disabled={!selectedSkillId || loading}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Generate ${selectedMode}`}
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz */}
      {questions.length > 0 && !showResult && (
        <div>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
              {questions[currentIndex].concept}
            </span>
          </div>

          <div className="h-1 bg-[var(--color-bg-card2)] rounded-full mb-6">
            <div className="h-full bg-[var(--color-accent)] rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6 mb-4">
            <h3 className="text-base font-semibold mb-6 leading-relaxed whitespace-pre-wrap">{questions[currentIndex].question}</h3>

            <div className="space-y-2">
              {questions[currentIndex].options.map((option, i) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === questions[currentIndex].answer;
                const showFeedback = selectedOption !== null;

                return (
                  <button
                    key={i}
                    onClick={() => submitAnswer(option)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-4 rounded-lg border transition-colors flex items-center gap-3 ${
                      !showFeedback
                        ? "border-[var(--color-border)] bg-[var(--color-bg-card2)] hover:border-[var(--color-accent-border)]"
                        : isCorrect
                          ? "border-[var(--color-green)] bg-[var(--color-green-muted)]"
                          : isSelected
                            ? "border-[var(--color-red)] bg-[var(--color-red-muted)]"
                            : "border-[var(--color-border)] bg-[var(--color-bg-card2)] opacity-40"
                    }`}
                  >
                    {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-[var(--color-green)] shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-[var(--color-red)] shrink-0" />}
                    <span className="text-sm">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {selectedOption !== null && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 mb-4">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">{questions[currentIndex].explanation}</p>
              <button
                onClick={handleNext}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {currentIndex + 1 === questions.length ? "See Results" : "Next Question"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {showResult && (
        <div className="space-y-4">
          {/* Score Summary */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-8 text-center">
            <div className="text-4xl font-bold mb-2">{score}/{questions.length}</div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
              {Math.round((score / questions.length) * 100)}% accuracy
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Retention has been updated for {selectedSkill?.name}
            </p>
          </div>

          {/* Concept Breakdown */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Concept Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(conceptResults).map(([concept, stats]) => {
                const accuracy = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={concept} className="flex items-center justify-between bg-[var(--color-bg-card2)] rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      {accuracy >= 70 ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-green)]" /> : <XCircle className="w-3.5 h-3.5 text-[var(--color-red)]" />}
                      <span className="text-sm">{concept}</span>
                    </div>
                    <span className={`text-xs font-semibold ${accuracy >= 70 ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}>
                      {accuracy}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setQuestions([]); setShowResult(false); setSelectedOption(null); }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md py-3 rounded-lg text-sm font-medium hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Take Another Quiz
            </button>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white py-3 rounded-lg text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <BarChart2 className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizContent />
    </Suspense>
  );
}
