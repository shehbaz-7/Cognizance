"use client";

import { useState } from "react";
import { useSkills } from "@/lib/SkillContext";
import { RetentionEngine } from "@/lib/retention-engine";
import { AddSkillModal } from "@/components/AddSkillModal";
import { formatDate, formatFutureDate } from "@/lib/utils";
import { Plus, Target, AlertTriangle, ChevronRight, Zap, Activity, TrendingDown, ArrowDownRight, Lightbulb, Trash2 } from "lucide-react";
import Link from "next/link";
import { HeroSection } from "@/components/ui/HeroSection";
import { TiltCard } from "@/components/ui/TiltCard";
import { useRouter } from "next/navigation";
import { RoadmapModal } from "@/components/ui/RoadmapModal";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/lib/ToastContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { skills, removeSkill, markPracticed, isSyncing } = useSkills();
  const [user] = useAuthState(auth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const router = useRouter();
  const { success, warning, info } = useToast();

  useEffect(() => {
    const decayingSkills = skills.filter(s => s.status === "decaying");
    if (decayingSkills.length > 0) {
      warning(`Structural Decay Detected: ${decayingSkills.length} skill(s) require immediate neural reinforcement.`, 6000);
    }
  }, [skills.length, warning]);

  const profile = RetentionEngine.getCognitiveProfile(skills);
  const { today } = RetentionEngine.getRevisionTasks(skills);
  
  // Filter missing prerequisites to only show for High-Proficiency targets (as requested by user)
  const missingPrereqs = skills
    .filter(s => s.proficiency === "Advanced" || s.proficiency === "Master")
    .flatMap(s => (s.missingPrerequisites || []).map(p => ({ skillName: s.name, prereq: p })));

  const handleGenerateRoadmap = async () => {
    if (skills.length === 0) return;
    setShowRoadmapModal(true);
    setRoadmapLoading(true);
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, profile }),
      });
      const data = await res.json();
      setRoadmapData(data.roadmap);
    } catch (e) {
      console.error("Roadmap error", e);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleStartLearning = () => {
    document.getElementById("dashboard-content")?.scrollIntoView({ behavior: 'smooth' });
  };

  const userName = user?.displayName?.split(" ")[0] || "Architect";

  return (
    <div className="w-full flex-1 overflow-x-hidden relative">
      <HeroSection />

      {/* Cloud Sync Status Indicator */}
      {isSyncing && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Neural Link Syncing...</span>
          </div>
        </div>
      )}

      <div id="dashboard-content" className="p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col gap-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
               <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
               <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Neural Mastery Dashboard</span>
             </div>
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Welcome, {userName}</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>

        {/* Missing Prerequisites Alert */}
        {missingPrereqs.length > 0 && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-500 mb-1">Missing Foundational Knowledge</h3>
                <p className="text-xs text-yellow-500/70 mb-4 leading-relaxed max-w-2xl">
                  AI detected attempts to learn advanced topics without requisite foundations. Your projected velocity will suffer. Address these immediately:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingPrereqs.slice(0, 5).map((p, i) => (
                    <div key={i} className="text-[11px] font-medium bg-black/60 border border-yellow-500/20 px-4 py-2 rounded-lg text-white/90 shadow-sm">
                      <span className="text-yellow-500/60 mr-1">{p.skillName} requires:</span> {p.prereq}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BENTO GRID: Dashboard Core */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-12">
          
          {/* Main Analytics Container */}
          <TiltCard className="col-span-1 md:col-span-6 lg:col-span-8 flex flex-col justify-between p-8 group overflow-hidden">
             <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none mix-blend-screen" />
            <div className="flex justify-between items-start mb-10">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Retention Analytics</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Neural Link Stable</h3>
                  <p className="text-sm text-zinc-400 max-w-sm">
                    {skills.length} skills tracked. Active cognitive decay models running autonomously across {profile.globalWeaknesses.length + profile.globalStrengths.length} neural nodes.
                  </p>
               </div>
               <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Global Health</div>
                  <div className="text-2xl font-bold text-green-400">Excellent</div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                 <div>
                   <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 hover:text-cyan-400 transition-colors">Learning Velocity</div>
                   <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                     {profile.learningSpeed > 0 ? profile.learningSpeed : "--"}
                     <span className="text-xs text-zinc-500 font-medium">/ 100</span>
                   </div>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                   <Activity className="w-4 h-4 text-cyan-400" />
                 </div>
               </div>
               <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                 <div>
                   <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 hover:text-rose-400 transition-colors">Forgetting Rate</div>
                   <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                     {profile.forgettingSpeed > 0 ? profile.forgettingSpeed : "--"}
                     <span className="text-xs text-zinc-500 font-medium">%</span>
                   </div>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                   <TrendingDown className="w-4 h-4 text-rose-400" />
                 </div>
               </div>
            </div>
          </TiltCard>

          {/* AI Mentor Suggestion Card */}
          <TiltCard className="col-span-1 md:col-span-6 lg:col-span-4 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 p-8 flex flex-col justify-between">
             <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-500/30 mb-4">
                  <Lightbulb className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">AI Mentor Insight</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                   {profile.globalWeaknesses.length > 0 
                    ? `Your structural decay in ${profile.globalWeaknesses[0]} requires immediate scenario simulation. Generate a diagnostic quiz to reinforce this pathway.`
                    : "Your retention curves are highly optimal. Consider adding more advanced prerequisite algorithms to push your boundaries."}
                </p>
             </div>
              <button 
                onClick={handleGenerateRoadmap}
                disabled={skills.length === 0}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
              >
                Generate Roadmap
              </button>
          </TiltCard>

          {/* Tasks Due Today Bento Row */}
          <TiltCard className="col-span-1 md:col-span-6 lg:col-span-5 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Action Required Today</h3>
              {today.length > 0 && (
                <span className="ml-auto bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full">
                  {today.length} Due
                </span>
              )}
            </div>
            {today.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-center">
                 <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center mb-3">
                   <Target className="w-5 h-5 text-zinc-600" />
                 </div>
                 <p className="text-sm text-zinc-500">All neural pathways are fully reinforced.</p>
               </div>
            ) : (
               <div className="flex flex-col gap-3 overflow-y-auto max-h-48 pr-2">
                 {today.map(task => (
                    <div key={task.skillId} className="group/task bg-black/40 border border-yellow-500/20 backdrop-blur rounded-xl p-4 flex items-center justify-between transition-colors hover:border-yellow-500/50 cursor-pointer" onClick={() => router.push(task.action === "quiz" ? `/quiz?skill=${task.skillId}` : `/study?skill=${task.skillId}`)}>
                      <div>
                        <div className="text-sm font-bold text-white group-hover/task:text-yellow-400 transition-colors">{task.skillName}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Retention: <span className="text-yellow-500">{task.retentionScore}%</span></div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover/task:text-yellow-400 transition-colors" />
                    </div>
                 ))}
               </div>
            )}
          </TiltCard>

          {/* Weak Skills Bento */}
          <TiltCard className="col-span-1 md:col-span-6 lg:col-span-7 bg-gradient-to-br from-rose-950/20 to-black p-8 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex items-center gap-3 mb-6">
                  <ArrowDownRight className="w-5 h-5 text-rose-400" />
                  <h3 className="text-lg font-bold text-white">Critical Weaknesses</h3>
               </div>
               
               {profile.globalWeaknesses.length === 0 ? (
                 <p className="text-sm text-zinc-500 my-auto">No major weaknesses detected! Keep taking diagnostic quizzes to let AI map your boundaries.</p>
               ) : (
                 <div className="flex flex-wrap gap-2 mt-auto">
                   {profile.globalWeaknesses.map((wk, i) => (
                      <span key={i} className="text-xs font-bold text-rose-200 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                        {wk}
                      </span>
                   ))}
                 </div>
               )}
            </div>
          </TiltCard>
        </div>

        {/* Empty State */}
        {skills.length === 0 && (
          <div className="col-span-12">
            <TiltCard className="w-full border-dashed border-2 border-zinc-800 bg-transparent flex flex-col items-center justify-center py-20 cursor-pointer group" onClick={() => setShowAddModal(true)}>
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 transition-all shadow-2xl">
                <Target className="w-8 h-8 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Initialize Cognitive Tracking</h3>
              <p className="text-sm text-zinc-500 max-w-md text-center">
                Add your first skill to start tracking neural retention and automatically generate immersive revision methodologies.
              </p>
            </TiltCard>
          </div>
        )}

        <AddSkillModal open={showAddModal} onClose={() => setShowAddModal(false)} />
        <RoadmapModal 
          open={showRoadmapModal} 
          onClose={() => setShowRoadmapModal(false)} 
          data={roadmapData} 
          loading={roadmapLoading} 
        />
        
        {/* Your Skills Grid */}
        {skills.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-white mb-6">Your Neural Pathways</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map(skill => (
                <div key={skill.id} className="cursor-pointer group h-full">
                  <TiltCard className="h-full bg-black/40 border border-white/5 hover:border-cyan-500/30 p-6 flex flex-col justify-between" onClick={() => router.push(`/skill/${skill.id}`)}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{skill.name}</h3>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{skill.category} • {skill.proficiency}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                          skill.status === "healthy" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                          skill.status === "review" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {skill.status.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-zinc-500">Retention Link</span>
                          <span className="text-xs font-bold text-white">{skill.retentionScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-500 shadow-[0_0_10px_cyan]" style={{ width: `${skill.retentionScore}%` }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> Config
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            markPracticed(skill.id); 
                            success(`Practiced ${skill.name}. Neural link strengthened.`); 
                          }}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-green-500/20 flex items-center justify-center text-zinc-400 border border-white/5 hover:border-green-500/30 transition-all"
                          title="Mark Practiced"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            removeSkill(skill.id); 
                            info(`Deleted ${skill.name} from memory.`);
                          }}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-zinc-400 border border-white/5 hover:border-red-500/30 transition-all hover:text-red-400"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
