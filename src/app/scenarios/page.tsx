"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSkills } from "@/lib/SkillContext";
import type { QuizQuestion, QuizAttempt } from "@/lib/types";
import { Loader2, Route as RouteIcon, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

function ScenariosContent() {
  const searchParams = useSearchParams();
  const { skills, addQuizResult, saveRevision, isSyncing } = useSkills();
  const [selectedSkillId, setSelectedSkillId] = useState(searchParams.get("skill") || "");
  const [scenarios, setScenarios] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [startTime, setStartTime] = useState(0);

  const selectedSkill = selectedSkillId ? skills.find(s => s.id === selectedSkillId) : undefined;

  const startScenarios = async () => {
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
          mode: "Scenario",
        }),
      });
      const data = await res.json();
      setScenarios(data.questions);
      saveRevision(selectedSkill.id, {
        type: "scenario",
        title: `Scenario: ${selectedSkill.name}`,
        content: data.questions
      });
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setAttempts([]);
      setSelectedOption(null);
      setStartTime(Date.now());
    } catch {
      // Handled by API fallback
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (option: string) => {
    if (selectedOption !== null) return;
    const q = scenarios[currentIndex];
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
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setStartTime(Date.now());
    } else {
      if (selectedSkillId) {
        addQuizResult(selectedSkillId, attempts);
      }
      setShowResult(true);
    }
  };

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
      <div className="flex flex-col mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 backdrop-blur-md">
            <RouteIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Situational Scenarios</h1>
        </div>
        <p className="text-sm text-white/50 uppercase tracking-widest font-medium ml-1">Deep-focus architectural logic problems</p>
      </div>

      {scenarios.length === 0 && !showResult && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full mix-blend-screen blur-[80px] pointer-events-none" />
          
          <RouteIcon className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Begin Scenario Drill</h2>
          <p className="text-base text-white/50 mb-8 max-w-lg mx-auto leading-relaxed">
            Select a skill to generate deep-focus logic paths. You will be presented with real-world architectural and situational problems requiring analytical synthesis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-medium outline-none focus:border-emerald-500 text-white"
            >
              <option value="">Select skill architecture...</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.proficiency})</option>)}
            </select>
            
            <button
              onClick={startScenarios}
              disabled={!selectedSkillId || loading}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Protocol"}
            </button>
          </div>
        </div>
      )}

      {scenarios.length > 0 && !showResult && (() => {
        const q = scenarios[currentIndex];
        const isScenario = q.question.includes("CONTEXT:");
        
        // Parsing logic for high-fidelity scenarios
        let context = "", crisis = "", blockers = "", mission = q.question;
        if (isScenario) {
          try {
            const parts = q.question.split(/\n\n/);
            context = parts.find(p => p.startsWith("CONTEXT:"))?.replace("CONTEXT:", "").trim() || "";
            crisis = parts.find(p => p.startsWith("CRISIS:"))?.replace("CRISIS:", "").trim() || "";
            blockers = parts.find(p => p.startsWith("BLOCKERS:"))?.replace("BLOCKERS:", "").trim() || "";
            mission = parts.find(p => p.startsWith("MISSION:"))?.replace("MISSION:", "").trim() || crisis;
          } catch (e) {
            console.error("Parse error", e);
          }
        }

        return (
          <div className="flex flex-col gap-8">
            {/* Progress Tracker */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white/50 uppercase tracking-widest">
                Mission {currentIndex + 1} of {scenarios.length}
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
                {q.concept}
              </span>
            </div>

            <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden border border-white/10">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
              />
            </div>

            {/* High-Fidelity Tactical Briefing */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Mission Dossier */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Deployment Briefing</span>
                  </div>

                  {isScenario ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Project Context</label>
                        <p className="text-sm text-white/80 leading-relaxed font-medium">{context}</p>
                      </div>
                      <div className="space-y-2 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.15em]">Situational Crisis</label>
                        <p className="text-lg font-semibold text-white leading-snug">{crisis}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-red-400/50 uppercase tracking-[0.15em]">System Constraints</label>
                          <div className="text-xs text-white/50 font-mono space-y-1">
                            {blockers.split(/\d\./).filter(b => b.trim()).map((b, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="text-red-500">◈</span> {b.trim()}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.15em]">Active Mission</label>
                          <p className="text-xs text-cyan-400 font-bold leading-relaxed">{mission}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm md:text-base text-white/80 leading-relaxed font-medium mb-8">
                      {q.question}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Resolution Paths */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Strategic Decision Matrix</span>
                </div>
                <div className="space-y-3">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === q.answer;
                    const showStatus = selectedOption !== null;

                    let btnClass = "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-emerald-500/30";
                    let statusLabel = `Path 0${i+1}`;

                    if (showStatus) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]";
                        statusLabel = "Optimal Path Verified";
                      } else if (isSelected) {
                        btnClass = "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]";
                        statusLabel = "Critical System Failure";
                      } else {
                        btnClass = "bg-white/5 border border-white/10 text-white/40 opacity-40";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => submitAnswer(opt)}
                        disabled={showStatus}
                        className={`w-full text-left p-5 rounded-2xl transition-all flex flex-col gap-1 group/btn backdrop-blur-sm ${btnClass}`}
                      >
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-50 group-hover/btn:opacity-100 transition-opacity">{statusLabel}</span>
                        <span className="text-[13px] leading-snug font-medium pr-2">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Explanation Post-Answer */}
            {selectedOption !== null && (
              <div className="mt-4">
                <div className="bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                   <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                     </div>
                     <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Post-Resolution Architectural Post-Mortem</span>
                   </div>
                  <p className="text-sm md:text-base text-white/70 leading-relaxed font-medium mb-8 pl-11">
                    {q.explanation}
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                    >
                      {currentIndex + 1 < scenarios.length ? "Deploy Next Simulation" : "View Structural Impact"} <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {showResult && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="text-5xl font-extrabold mb-4 text-white drop-shadow-xl">{score}<span className="text-white/30 text-3xl">/{scenarios.length}</span></div>
            <p className="text-base font-bold text-white/50 uppercase tracking-widest mb-2">
              {Math.round((score / scenarios.length) * 100)}% structural integrity
            </p>
            <p className="text-sm font-medium text-emerald-400">{score === scenarios.length ? "Flawless Execution" : "Requires further optimization"}</p>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => { setScenarios([]); setShowResult(false); setSelectedOption(null); }}
              className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-8 py-4 rounded-xl text-sm font-bold hover:bg-white/10 hover:border-white/20 transition-all text-white"
            >
              <RotateCcw className="w-5 h-5" /> Generate New Topology
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense fallback={null}>
      <ScenariosContent />
    </Suspense>
  );
}
