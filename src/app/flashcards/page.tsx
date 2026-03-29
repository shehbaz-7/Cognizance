"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSkills } from "@/lib/SkillContext";
import type { QuizQuestion } from "@/lib/types";
import { Loader2, Layers, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function FlashcardsPage() {
  const searchParams = useSearchParams();
  const { skills, saveRevision } = useSkills();
  const [selectedSkillId, setSelectedSkillId] = useState(searchParams.get("skill") || "");
  const [flashcards, setFlashcards] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedSkill = selectedSkillId ? skills.find(s => s.id === selectedSkillId) : undefined;

  const startFlashcards = async () => {
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
          mode: "Flashcard",
        }),
      });
      const data = await res.json();
      setFlashcards(data.questions);
      saveRevision(selectedSkill.id, {
        type: "flashcards",
        title: `Flashcards: ${selectedSkill.name}`,
        content: data.questions
      });
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch {
      // API has fallback handling
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, 150);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[900px] mx-auto w-full pt-8">
      <div className="flex flex-col mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 backdrop-blur-md">
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Combat Flashcards</h1>
        </div>
        <p className="text-sm text-white/50 uppercase tracking-widest font-medium ml-1">Master discrete concepts through high-speed repetition</p>
      </div>

      {flashcards.length === 0 && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-screen blur-[80px] pointer-events-none" />
          
          <Layers className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Initialize Flashcard Deck</h2>
          <p className="text-base text-white/50 mb-8 max-w-md mx-auto">
            Select a targeted skill to instantly generate a custom deck tailored exclusively to your weak cognitive points.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-medium outline-none focus:border-indigo-500 text-white"
            >
              <option value="">Select skill architecture...</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.proficiency})</option>)}
            </select>
            
            <button
              onClick={startFlashcards}
              disabled={!selectedSkillId || loading}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(79,70,229,0.4)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Protocol"}
            </button>
          </div>
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl flex justify-between items-center mb-8 text-sm font-bold text-white/50 uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/5">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span className="text-indigo-400 tracking-wider">[{flashcards[currentIndex].concept}]</span>
          </div>

          <div
            className="relative w-full aspect-[4/2.5] max-w-3xl cursor-pointer [perspective:1200px]"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="w-full h-full relative [transform-style:preserve-3d]"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Front Face */}
              <div className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl [backface-visibility:hidden]">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent rounded-[2rem] pointer-events-none" />
                <span className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest mb-8 border border-indigo-500/30 px-4 py-1.5 rounded-full bg-indigo-500/10">Front side</span>
                <p className="text-3xl font-bold text-white leading-relaxed">{flashcards[currentIndex].question}</p>
                <div className="absolute bottom-8 text-xs font-semibold text-white/30 tracking-widest uppercase flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Click anywhere to flip
                </div>
              </div>

              {/* Back Face */}
              <div className="absolute inset-0 bg-zinc-900 border border-indigo-500/40 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_0_80px_rgba(79,70,229,0.15)] [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6 border border-emerald-500/30 px-4 py-1.5 rounded-full bg-emerald-500/10">Back side - Solution</span>
                
                <p className="text-2xl font-bold text-white mb-6 leading-relaxed">{flashcards[currentIndex].answer}</p>
                
                {flashcards[currentIndex].explanation && (
                  <div className="bg-white/5 rounded-xl block p-5 border border-white/5">
                    <p className="text-sm text-white/60 leading-relaxed font-medium">
                      {flashcards[currentIndex].explanation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="flex w-full max-w-3xl items-center justify-between mt-12">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="p-5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5 group"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => { setFlashcards([]); setIsFlipped(false); setCurrentIndex(0); }}
              className="px-6 py-3 rounded-full text-xs font-bold text-white/50 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
            >
               End Review
            </button>
            <button
              onClick={nextCard}
              disabled={currentIndex === flashcards.length - 1}
              className="p-5 bg-indigo-600 border border-indigo-500/50 rounded-full hover:bg-indigo-500 transition-all hover:scale-110 disabled:opacity-30 disabled:scale-100 shadow-[0_0_20px_rgba(79,70,229,0.4)] group"
            >
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
