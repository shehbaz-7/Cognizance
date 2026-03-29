"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Target, Zap, Clock, ChevronRight } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface RoadmapPhase {
  name: string;
  goal: string;
  milestones: string[];
  estimatedWeeks: number;
}

interface RoadmapData {
  title: string;
  description: string;
  phases: RoadmapPhase[];
  mentorAdvice: string;
}

interface RoadmapModalProps {
  open: boolean;
  onClose: () => void;
  data: RoadmapData | null;
  loading: boolean;
}

export function RoadmapModal({ open, onClose, data, loading }: RoadmapModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-indigo-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">AI Neural Roadmap</h2>
                  <p className="text-sm text-zinc-500 font-medium">Synthesized from global mastery telemetry</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full border-2 border-indigo-500/20 animate-ping absolute inset-0" />
                    <div className="w-20 h-20 rounded-full border-t-2 border-indigo-500 animate-spin relative" />
                    <Sparkles className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Architecting Your Path...</h3>
                  <p className="text-sm text-zinc-500 max-w-sm">Generating a high-fidelity mastery sequence using the Neuro-Architect engine.</p>
                </div>
              ) : data ? (
                <div className="space-y-10">
                  {/* Overview */}
                  <section>
                    <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{data.title}</h3>
                    <p className="text-lg text-zinc-400 leading-relaxed max-w-3xl">{data.description}</p>
                  </section>

                  {/* Phases */}
                  <div className="space-y-6">
                     <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Mastery Sequence</h4>
                     {data.phases.map((phase, i) => (
                       <GlassCard key={i} color="rgba(99, 102, 241, 0.05)" className="p-8 border-white/5 relative group hover:border-indigo-500/30 transition-all">
                         <div className="flex flex-col md:flex-row gap-8">
                           <div className="shrink-0 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-[0_0_20px_rgba(79,70,229,0.5)] mb-4">
                                {i + 1}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> {phase.estimatedWeeks}W
                              </div>
                           </div>
                           <div className="flex-1">
                              <h5 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{phase.name}</h5>
                              <p className="text-sm text-indigo-200/60 mb-6 font-medium tracking-wide italic">Goal: {phase.goal}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {phase.milestones.map((ms, j) => (
                                  <div key={j} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <Target className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs text-zinc-300 font-medium">{ms}</span>
                                  </div>
                                ))}
                              </div>
                           </div>
                         </div>
                       </GlassCard>
                     ))}
                  </div>

                  {/* Mentor Advice */}
                  <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                     <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-4">
                       <Zap className="w-4 h-4" /> Mentor Parting Counsel
                     </h4>
                     <p className="text-lg text-white/90 leading-relaxed font-medium italic">
                       "{data.mentorAdvice}"
                     </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-zinc-950/50 flex justify-end shrink-0">
               <button
                 onClick={onClose}
                 className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
               >
                 Acknowledge Roadmap
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
