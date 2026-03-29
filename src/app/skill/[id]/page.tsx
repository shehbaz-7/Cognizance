"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSkills } from "@/lib/SkillContext";
import { RetentionEngine } from "@/lib/retention-engine";
import { formatDate, formatFutureDate } from "@/lib/utils";
import { ArrowLeft, BookOpen, PenTool, RefreshCw, Trash2, BrainCircuit, Goal, Clock, CheckCircle2, TrendingDown, Archive, X, AlertTriangle, ArrowDownRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/lib/ToastContext";
import { useEffect } from "react";

function RetentionGraph({ skill }: { skill: any }) {
  const points = RetentionEngine.getRetentionCurve(skill);
  if (!points.length) return null;

  // Map to SVG coordinates: X: -48 to 168 -> 0 to 100%, Y: 0 to 100 -> 100 to 0%
  const width = 400;
  const height = 100;
  const minX = -48;
  const maxX = 168;
  const rangeX = maxX - minX;

  const getX = (x: number) => ((x - minX) / rangeX) * width;
  const getY = (y: number) => height - (y / 100) * height;

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.x)} ${getY(p.y)}`).join(" ");
  const nowX = getX(0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      {/* Grid Lines */}
      <line x1={nowX} y1="0" x2={nowX} y2={height} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
      
      {/* The Curve */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#curveGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Threshold markers */}
      <line x1="0" y1={getY(70)} x2={width} y2={getY(70)} stroke="rgba(34,197,94,0.1)" strokeWidth="1" />
      <line x1="0" y1={getY(50)} x2={width} y2={getY(50)} stroke="rgba(239,68,68,0.1)" strokeWidth="1" />

      {/* Gradient */}
      <defs>
        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
          <stop offset={`${(Math.abs(minX) / rangeX) * 100}%`} stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* Dots for key moments */}
      <circle cx={getX(0)} cy={getY(points.find(p => p.x === 0)?.y || 0)} r="4" fill="#6366f1" className="animate-pulse" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_CONFIG = [
  { name: "Beginner", threshold: 0 },
  { name: "Intermediate", threshold: 40 },
  { name: "Advanced", threshold: 70 },
  { name: "Master", threshold: 90 },
];

/**
 * Utility to strip markdown formatting for 'pure text' preference.
 */
function stripMarkdown(text: string): string {
  if (typeof text !== "string") return text;
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1")     // Italic
    .replace(/__(.*?)__/g, "$1")     // Bold alt
    .replace(/_(.*?)_/g, " ")      // Italic alt
    .replace(/`(.*?)`/g, "$1")      // Code
    .replace(/#/g, "")               // Headers
    .trim();
}

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getSkill, markPracticed, removeSkill, graduateSkill, removeRevision, isSyncing } = useSkills();
  const { warning, success } = useToast();
  const skill = getSkill(params.id as string);
  const [viewingRevision, setViewingRevision] = useState<any | null>(null);

  useEffect(() => {
    if (skill && skill.status === "decaying") {
      warning(`Structural Decay Detected: ${skill.name} requires immediate review.`, 6000);
    }
  }, [skill?.id, skill?.status, warning]);

  if (!skill) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Skill not found</h2>
          <Link href="/" className="text-sm text-[var(--color-accent)] hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const weakTopics = RetentionEngine.getWeakTopics(skill);
  const quizCount = skill.quizHistory.length;
  const avgAccuracy = quizCount > 0
    ? Math.round((skill.quizHistory.filter(q => q.correct).length / quizCount) * 100)
    : 0;

  const statusColors: Record<string, { ring: string; label: string; bg: string }> = {
    healthy: { ring: "stroke-[var(--color-green)]", label: "Healthy", bg: "bg-[var(--color-green-muted)] text-[var(--color-green)]" },
    review: { ring: "stroke-[var(--color-yellow)]", label: "Review Soon", bg: "bg-[var(--color-yellow-muted)] text-[var(--color-yellow)]" },
    decaying: { ring: "stroke-[var(--color-red)]", label: "Decaying", bg: "bg-[var(--color-red-muted)] text-[var(--color-red)]" },
  };

  const sc = statusColors[skill.status];
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (skill.retentionScore / 100) * circumference;

  // Timeline Logic
  const levels = ["Beginner", "Intermediate", "Advanced", "Master"];
  const currentIdx = levels.indexOf(skill.proficiency) !== -1 ? levels.indexOf(skill.proficiency) : 0;
  const isMaster = skill.proficiency === "Master";
  const canGraduate = (skill.subskills?.length || 0) > 0 && skill.subskills.every(s => s.strength > 80) && skill.retentionScore >= 85;

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[900px] mx-auto w-full relative">
      {/* Cloud Sync Status Indicator */}
      {isSyncing && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Neural Link Syncing...</span>
          </div>
        </div>
      )}
      
      {/* Back */}
      <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{skill.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{skill.category}</span>
            <span className="text-zinc-800">•</span>
            <span className="text-xs font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400">{skill.proficiency}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${skill.name}? This cannot be undone.`)) {
                removeSkill(skill.id);
                router.push("/");
              }
            }}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Skill
          </button>
          <button onClick={() => markPracticed(skill.id)} className="flex items-center gap-2 bg-[var(--color-accent-muted)] hover:bg-[var(--color-accent-border)] border border-[var(--color-accent-border)] text-[var(--color-accent)] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <CheckCircle2 className="w-4 h-4" /> Finalize Revision
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Retention Ring + Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6 text-center mb-4">
            <svg width="120" height="120" className="mx-auto mb-4">
              <circle cx="60" cy="60" r="45" fill="none" stroke="var(--color-bg-card2)" strokeWidth="8" />
              <circle cx="60" cy="60" r="45" fill="none" className={sc.ring} strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
              <text x="60" y="56" textAnchor="middle" className="fill-[var(--color-text-primary)] text-2xl font-bold" style={{ fontSize: "24px" }}>
                {skill.retentionScore}%
              </text>
              <text x="60" y="72" textAnchor="middle" className="fill-[var(--color-text-muted)]" style={{ fontSize: "10px" }}>
                retention
              </text>
            </svg>
            <div className="text-xs text-[var(--color-text-muted)]">
              Decay Risk: <span className="font-semibold text-[var(--color-text-secondary)]">{Math.round(skill.decayRisk * 100)}%</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Last Practiced</span>
              <span className="font-medium">{formatDate(skill.lastPracticed)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Next Review</span>
              <span className="font-medium">{formatFutureDate(skill.nextReviewDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Revisions</span>
              <span className="font-medium">{skill.revisionCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Quizzes Taken</span>
              <span className="font-medium">{quizCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Avg Accuracy</span>
              <span className="font-medium">{avgAccuracy}%</span>
            </div>
          </div>

          {/* Mastery Timeline */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 mt-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Goal className="w-4 h-4 text-[var(--color-accent)]" /> Mastery Timeline
            </h3>
            <div className="relative pl-3 space-y-4">
              <div className="absolute top-2 bottom-2 left-[15px] w-[2px] bg-[var(--color-border)]" />
              {levels.map((lvl, i) => {
                const isActive = i === currentIdx;
                const isPast = i < currentIdx;
                return (
                  <div key={lvl} className={`relative flex items-center gap-3 ${isPast ? 'opacity-50' : ''}`}>
                    <div className={`w-3 h-3 rounded-full z-10 shrink-0 ${
                      isActive ? "bg-[var(--color-accent)] shadow-[0_0_0_4px_rgba(99,102,241,0.2)]" : 
                      isPast ? "bg-[var(--color-green)]" : "bg-[var(--color-bg-card2)] border-2 border-[var(--color-text-muted)]"
                    }`} />
                    <span className={`text-sm ${isActive ? 'font-bold text-[var(--color-text-primary)]' : 'font-medium text-[var(--color-text-secondary)]'}`}>
                      {lvl}
                    </span>
                  </div>
                );
              })}
            </div>
            {canGraduate && !isMaster && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Threshold Achieved!</p>
                <button 
                  onClick={() => graduateSkill(skill.id)}
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Graduate to {levels[currentIdx + 1]}
                </button>
              </div>
            )}
            {!canGraduate && !isMaster && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-4 leading-relaxed">
                Reach 90% retention and 85% strength across all subskills to graduate.
              </p>
            )}
          </div>
        </div>

        {/* Right: Weak Topics + Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Link href={`/study?skill=${skill.id}`}
              className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 hover:border-[var(--color-accent-border)] transition-colors">
              <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-xs font-medium">Study Notes</span>
            </Link>
            <Link href={`/quiz?skill=${skill.id}`}
              className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 hover:border-[var(--color-accent-border)] transition-colors">
              <PenTool className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-xs font-medium">Take Quiz</span>
            </Link>
            <button onClick={() => markPracticed(skill.id)}
              className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 hover:border-[var(--color-green)] hover:border-opacity-40 transition-colors">
              <RefreshCw className="w-5 h-5 text-[var(--color-green)]" />
              <span className="text-xs font-medium">Mark Practiced</span>
            </button>
          </div>

          {/* Predictive Decay Forecast */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5">
             <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
               <TrendingDown className="w-4 h-4 text-[var(--color-text-secondary)]" /> Decay Forecast
             </h3>
             <div className="flex gap-4">
               <div className="flex-1 bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg p-3">
                 <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">In 24 Hours</div>
                 <div className="text-lg font-semibold flex items-baseline gap-1">
                   {skill.forecast24h}% <span className="text-xs font-normal text-[var(--color-text-secondary)]">retention</span>
                 </div>
               </div>
               <div className="flex-1 bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg p-3">
                 <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">In 7 Days</div>
                 <div className="text-lg font-semibold flex items-baseline gap-1 text-[var(--color-red)]">
                   {skill.forecast7d}% <span className="text-xs font-normal text-[var(--color-text-secondary)]">retention</span>
                 </div>
               </div>
             </div>
             
             {/* Alert if critical decay in next 48 hours */}
             {new Date(skill.nextReviewDate).getTime() < Date.now() + 48*60*60*1000 && (
               <div className="mt-3 text-xs bg-[var(--color-yellow-muted)] text-[var(--color-yellow)] px-3 py-2 rounded-lg flex gap-2 items-center">
                 <Clock className="w-3.5 h-3.5" /> Core structural decay predicted within 48 hours. Reactivate pathways via Quiz.
               </div>
             )}
          </div>

          {/* Subskill Memory Map */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[var(--color-accent)]" /> Subskill Memory Map
            </h3>
            {skill.subskills.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
                Take intelligent quizzes to automatically map your localized subskill strengths.
              </p>
            ) : (
              <div className="space-y-3">
                {skill.subskills.map((sub, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-[120px] truncate">{sub.name}</span>
                    <div className="flex-1 h-2 bg-[var(--color-bg-card2)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${sub.strength >= 80 ? "bg-[var(--color-green)]" : sub.strength >= 50 ? "bg-[var(--color-accent)]" : "bg-[var(--color-red)]"}`} style={{ width: `${sub.strength}%` }} />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] w-8 text-right">{sub.strength}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak Topics */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cyan-500" /> Learning Curve & Decay
            </h3>
            
            <div className="relative h-[120px] w-full mb-6">
               <RetentionGraph skill={skill} />
               <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-white/20 uppercase tracking-widest pt-2 border-t border-white/5">
                  <span>Past 48h</span>
                  <span>Now</span>
                  <span>7 Day Forecast</span>
               </div>
            </div>

            <div className="space-y-3 mt-8">
               <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">AI Implementation Strategy</h4>
               {(() => {
                 const advice = RetentionEngine.getPersonalizedAdvice(skill);
                 const colors = {
                   success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
                   warning: "border-red-500/20 bg-red-500/5 text-red-400",
                   info: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
                 };
                 return (
                   <div className={`p-4 rounded-xl border ${colors[advice.type]} space-y-2`}>
                      <div className="flex items-start gap-3">
                         <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                         <p className="text-xs leading-relaxed font-medium">{advice.text}</p>
                      </div>
                      <div className="pl-7">
                         <button className="text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1 group">
                            {advice.action} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                         </button>
                      </div>
                   </div>
                 );
               })()}
            </div>
            
            <h3 className="text-sm font-semibold mb-4 mt-8">Weak Areas</h3>
            {weakTopics.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
                {quizCount === 0 ? "Take a quiz to identify weak areas." : "No weaknesses detected. Keep it up!"}
              </p>
            ) : (
              <div className="space-y-2">
                {weakTopics.map((w, i) => {
                  const sevColors = {
                    critical: "bg-[var(--color-red-muted)] text-[var(--color-red)]",
                    moderate: "bg-[var(--color-yellow-muted)] text-[var(--color-yellow)]",
                    mild: "bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
                  };
                  return (
                    <div key={i} className="flex items-center justify-between bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{w.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sevColors[w.severity]}`}>
                          {w.severity}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">{w.accuracy}% accuracy</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Revision Vault */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 mt-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Archive className="w-4 h-4 text-[var(--color-accent)]" /> Revision Vault
            </h3>
            {skill.savedRevisions && skill.savedRevisions.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {skill.savedRevisions.map((rev) => (
                  <div key={rev.id} className="relative group overflow-hidden rounded-lg">
                    <button 
                      onClick={() => setViewingRevision(rev)}
                      className="w-full text-left bg-black/20 border border-white/5 rounded-lg p-3 pr-14 flex justify-between items-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all outline-none"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="text-sm font-semibold text-white/90 truncate">{rev.title}</div>
                        <div className="text-[10px] text-white/40 mt-1">{formatDate(rev.createdAt)}</div>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded-full text-white/70">{rev.type}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeRevision(skill.id, rev.id);
                        success("Revision deleted from vault.");
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-3 text-white/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                      title="Delete Revision"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30 py-4 text-center">
                Generate study notes, flashcards, or scenarios to automatically store them here for future revision.
              </p>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => { removeSkill(skill.id); router.push("/"); }}
            className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors mt-4"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove this skill
          </button>
        </div>
      </div>

      {/* Basic Revision Viewer Modal */}
      {viewingRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div id="printable-content" className="bg-zinc-900 border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{viewingRevision.title}</h3>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{formatDate(viewingRevision.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const content = document.getElementById('printable-content-inner');
                    if (!content) return;
                    const printWindow = window.open('', '_blank', 'width=900,height=700');
                    if (!printWindow) return;
                    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${viewingRevision.title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: white; padding: 40px; font-size: 12pt; line-height: 1.7; }
  h1 { font-size: 22pt; margin-bottom: 6px; color: #111; }
  h2 { font-size: 16pt; margin-bottom: 4px; color: #111; }
  h3, h4 { font-size: 13pt; color: #0e7490; margin-top: 28px; margin-bottom: 10px; page-break-after: avoid; }
  p { margin-bottom: 12px; }
  .header { text-align: center; border-bottom: 2px solid #0e7490; padding-bottom: 16px; margin-bottom: 30px; }
  .header small { color: #888; font-size: 9pt; }
  .chapter { margin-bottom: 32px; page-break-inside: avoid; }
  .chapter-body { padding-left: 16px; border-left: 3px solid #e5e7eb; }
  .case-study { background: #f8fafb; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 12px 0; font-style: italic; color: #475569; font-size: 10pt; }
  .case-study-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0e7490; margin-bottom: 4px; font-style: normal; }
  .key-point { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; font-size: 11pt; }
  .key-point::before { content: '✓'; color: #0e7490; font-weight: bold; flex-shrink: 0; }
  pre, code { font-family: 'Courier New', monospace; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; font-size: 9pt; white-space: pre-wrap; word-wrap: break-word; display: block; margin: 8px 0; }
  @media print { body { padding: 0; } @page { margin: 0.6in; } .chapter { page-break-inside: auto; } }
</style></head><body>
<div class="header"><h1>${viewingRevision.title}</h1><small>Generated on ${formatDate(viewingRevision.createdAt)} — Cognizance AI</small></div>`);
                    // Parse and render clean content
                    let data = viewingRevision.content;
                    if (typeof data === 'string') { try { data = JSON.parse(data); } catch { /* keep as string */ } }
                    if (data && data.chapters) {
                      if (data.overview) {
                        printWindow.document.write(`<p style="font-style:italic;color:#64748b;margin-bottom:24px;">${data.overview.replace(/\*\*/g,'')}</p>`);
                      }
                      data.chapters.forEach((ch: any, i: number) => {
                        printWindow.document.write(`<div class="chapter"><h3>${String(i+1).padStart(2,'0')} — ${(ch.title||'').replace(/\*\*/g,'')}</h3><div class="chapter-body">`);
                        if (ch.content) printWindow.document.write(`<p>${(ch.content||'').replace(/\*\*/g,'')}</p>`);
                        if (ch.examples && Array.isArray(ch.examples) && ch.examples.length > 0) {
                          printWindow.document.write('<div class="case-study"><div class="case-study-label">Case Study / Example</div>');
                          ch.examples.forEach((ex: string) => { printWindow.document.write(`<div>${(ex||'').replace(/\*\*/g,'')}</div>`); });
                          printWindow.document.write('</div>');
                        }
                        if (ch.keyPoints && Array.isArray(ch.keyPoints) && ch.keyPoints.length > 0) {
                          ch.keyPoints.forEach((kp: string) => { printWindow.document.write(`<div class="key-point">${(kp||'').replace(/\*\*/g,'')}</div>`); });
                        }
                        printWindow.document.write('</div></div>');
                      });
                    } else if (Array.isArray(data)) {
                      data.forEach((q: any, i: number) => {
                        printWindow.document.write(`<div class="chapter"><h3>Question ${i+1} — ${(q.concept||'').replace(/\*\*/g,'')}</h3><div class="chapter-body">`);
                        printWindow.document.write(`<p><strong>${(q.question||'').replace(/SCENARIO:|PROBLEM:/g,'').replace(/\*\*/g,'')}</strong></p>`);
                        if (q.options) { q.options.forEach((opt: string) => { printWindow.document.write(`<div class="key-point" style="${opt===q.answer?'font-weight:bold;color:#0e7490':''}">${(opt||'').replace(/\*\*/g,'')}</div>`); }); }
                        if (q.explanation) printWindow.document.write(`<p style="color:#64748b;font-style:italic;margin-top:8px;">${(q.explanation||'').replace(/\*\*/g,'')}</p>`);
                        printWindow.document.write('</div></div>');
                      });
                    } else {
                      printWindow.document.write(`<pre>${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>`);
                    }
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 400);
                  }} 
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white/70 hover:text-white transition-all no-print"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button 
                  onClick={() => setViewingRevision(null)} 
                  className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full no-print"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div id="printable-content-inner" className="p-8 overflow-y-auto text-sm text-white/80 leading-relaxed bg-zinc-950/20 custom-scrollbar scroll-smooth">
              <RevisionContent content={viewingRevision.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RevisionContent({ content }: { content: any }) {
  // Parse if it's a string
  let data = content;
  if (typeof content === "string") {
    try {
      data = JSON.parse(content);
    } catch (e) {
      return <p className="whitespace-pre-wrap">{stripMarkdown(content)}</p>;
    }
  }

  // Handle Note-specific structure
  if (data.chapters) {
    return (
      <div className="space-y-8">
        {data.overview && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 italic text-zinc-400">
            {stripMarkdown(data.overview)}
          </div>
        )}
        
        {data.chapters.map((chapter: any, i: number) => (
          <div key={i} className="space-y-4">
            <h4 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <span className="opacity-30 text-sm">0{i+1}</span> {stripMarkdown(chapter.title)}
            </h4>
            <div className="pl-4 border-l border-white/10 space-y-4">
              <p className="text-zinc-200 leading-relaxed text-sm">
                {stripMarkdown(chapter.content)}
              </p>
              
              {chapter.examples && (Array.isArray(chapter.examples)) && chapter.examples.length > 0 && (
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 space-y-2">
                   <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                     <span className="w-1 h-1 bg-cyan-500 rounded-full" /> Case Study / Context
                   </div>
                   {chapter.examples.map((ex: string, j: number) => (
                     <div key={j} className="text-[13px] text-zinc-400 italic font-mono pl-3 border-l border-cyan-500/20 py-0.5">
                        {stripMarkdown(ex)}
                     </div>
                   ))}
                </div>
              )}

              {chapter.keyPoints && (Array.isArray(chapter.keyPoints)) && chapter.keyPoints.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {chapter.keyPoints.map((point: string, j: number) => (
                    <div key={j} className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/5 group-hover:border-cyan-500/20 transition-all">
                       <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                       <span className="text-[13px] text-zinc-300 leading-snug">{stripMarkdown(point)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle Practice/Quiz/Scenario questions
  if (Array.isArray(data)) {
    return (
      <div className="space-y-6">
        {data.map((q: any, i: number) => {
          const isScenario = q.question.includes("SCENARIO:");
          const isFlashcard = !q.options || q.options.length === 0;
          let context = "";
          let problem = q.question;
          
          if (isScenario) {
            const parts = q.question.split("PROBLEM:");
            context = parts[0].replace("SCENARIO:", "").trim();
            problem = parts[1]?.trim() || problem;
          }

          if (isFlashcard) {
            return <FlashcardItem key={i} question={q} index={i} />;
          }

          return (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Question {i+1}</span>
                <span className="text-[10px] font-medium bg-white/10 px-2 py-0.5 rounded uppercase">{q.concept}</span>
              </div>
              
              {isScenario && (
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-4 text-[13px] text-zinc-300 italic leading-relaxed">
                   <div className="text-[9px] font-bold text-cyan-500 uppercase mb-2">Case Study Context</div>
                   {stripMarkdown(context)}
                </div>
              )}

              <h4 className="text-sm font-semibold text-white/90 leading-relaxed font-sans">
                {stripMarkdown(problem)}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {q.options.map((opt: string, j: number) => (
                  <div key={j} className={`text-xs p-3 rounded-lg border flex items-center gap-3 ${opt === q.answer ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' : 'bg-white/5 border-white/5 text-white/40'}`}>
                    {opt === q.answer ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-white/10" />}
                    {stripMarkdown(opt)}
                  </div>
                ))}
              </div>

              {q.explanation && (
                 <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40 leading-relaxed italic">
                    <span className="font-bold text-white/60">Explanation:</span> {stripMarkdown(q.explanation)}
                 </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ...
  return (
    <pre className="whitespace-pre-wrap font-sans text-zinc-400 text-sm leading-relaxed p-4 bg-black/20 rounded-xl border border-white/5">
      {stripMarkdown(typeof data === "string" ? data : JSON.stringify(data, null, 2))}
    </pre>
  );
}

function FlashcardItem({ question, index }: { question: any, index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer group perspective-1000"
    >
      <motion.div 
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full min-h-[140px] preserve-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-50">
            <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-500">Flashcard {index + 1}</span>
            <span className="text-[9px] font-medium uppercase tracking-widest">Front</span>
          </div>
          <h4 className="text-sm font-semibold text-center py-4">{stripMarkdown(question.question)}</h4>
          <div className="text-[8px] text-center uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">Click to Reveal Answer</div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 flex flex-col justify-between"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between opacity-50">
             <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-500">Concept: {question.concept}</span>
             <span className="text-[9px] font-medium uppercase tracking-widest text-cyan-500">Back</span>
          </div>
          <p className="text-sm font-bold text-center text-cyan-400 py-4 leading-relaxed">
            {stripMarkdown(question.answer)}
          </p>
          <div className="text-[8px] text-center uppercase tracking-widest text-cyan-500/50">Recalled? Click to Reset</div>
        </div>
      </motion.div>
    </div>
  );
}

