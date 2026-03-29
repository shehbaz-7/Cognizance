"use client";

import { useEffect, useState, useCallback } from "react";
import { useSkills } from "@/lib/SkillContext";
import { RetentionEngine } from "@/lib/retention-engine";
import { Calendar, CheckCircle2, BookOpen, PenTool, Bot, Loader2, ArrowRight, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useChat, type ChatMessage } from "@/lib/ChatContext";
import { AnimatedAIChat } from "@/components/ui/AnimatedAIChat";

export default function PlannerPage() {
  const { skills, markPracticed } = useSkills();
  const { getChat, saveChat, loading: chatsLoading } = useChat();
  const { today, tomorrow, week } = RetentionEngine.getRevisionTasks(skills);
  const [briefing, setBriefing] = useState<{ briefing: string; recommendedAction: any } | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!chatsLoading) {
      setChatMessages(getChat("global", "mentor"));
    }
  }, [chatsLoading, getChat]);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await fetch("/api/mentor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills }),
        });
        const data = await res.json();
        if (res.ok) setBriefing(data);
      } catch (e) {
        console.error("Mentor fetch error", e);
      } finally {
        setLoadingContext(false);
      }
    };
    if (skills.length > 0) fetchMentor();
    else setLoadingContext(false);
  }, [skills]);

  const sendMentorChat = async (text: string) => {
    if (!text.trim() || chatLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          skills, 
          messages: newMessages 
        }),
      });
      const data = await res.json();
      const finalMessages: ChatMessage[] = [...newMessages, { role: "assistant", content: data.briefing || data.message }];
      setChatMessages(finalMessages);
      await saveChat("global", "mentor", finalMessages);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Apologies, my link is unstable. Please retry." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const TaskSection = ({ title, tasks, icon: Icon, emptyText }: {
    title: string;
    tasks: import("@/lib/types").RevisionTask[];
    icon: React.ComponentType<{ className?: string }>;
    emptyText: string;
  }) => (
    <GlassCard color="rgba(99, 102, 241, 0.2)" className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-[var(--color-accent)]" />
        <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
        {tasks.length > 0 && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] shadow-sm">
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-black/20 border border-white/5 rounded-xl p-6 text-center shadow-inner">
          <p className="text-sm text-white/50">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const statusColors: Record<string, string> = {
              healthy: "bg-[var(--color-green-muted)] text-[var(--color-green)] border border-[var(--color-green)]/20",
              review: "bg-[var(--color-yellow-muted)] text-[var(--color-yellow)] border border-[var(--color-yellow)]/20",
              decaying: "bg-[var(--color-red-muted)] text-[var(--color-red)] border border-[var(--color-red)]/20",
            };

            return (
              <div key={task.skillId} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                    {task.action === "quiz"
                      ? <PenTool className="w-4 h-4 text-[var(--color-accent)]" />
                      : <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
                    }
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{task.skillName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${statusColors[task.status]}`}>
                        {task.retentionScore}%
                      </span>
                      <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                        ~{task.estimatedMinutes} min • {task.action === "quiz" ? "Take Quiz" : "Review Notes"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={task.action === "quiz" ? `/quiz?skill=${task.skillId}` : `/study?skill=${task.skillId}`}
                    className="text-xs font-bold text-black bg-white hover:scale-105 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    {task.action === "quiz" ? "Quiz" : "Study"}
                  </Link>
                  <button
                    onClick={() => markPracticed(task.skillId)}
                    className="p-2 bg-white/5 border border-white/10 hover:bg-green-500/20 hover:border-green-500/30 rounded-lg transition-all hover:scale-105 group"
                    title="Mark complete"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white/50 group-hover:text-green-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1000px] mx-auto w-full pt-8">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[var(--color-accent)]/20 rounded-xl border border-[var(--color-accent)]/30 backdrop-blur-md">
            <Bot className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">AI Mentor Dashboard</h1>
        </div>
        <p className="text-sm text-white/50 uppercase tracking-widest font-medium ml-1">Proactive neural intel & schedule</p>
      </div>

      {/* Mentor Briefing Card */}
      <GlassCard color="rgba(168, 85, 247, 0.4)" className="mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-screen blur-[80px] pointer-events-none" />
        
        {loadingContext ? (
          <div className="flex items-center gap-3 text-white/50 text-sm py-8 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-fuchsia-500" /> 
            Synthesizing daily cognitive blueprint from neural data...
          </div>
        ) : (
          <div className="relative z-10 py-2">
            <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
               Daily Briefing
            </h3>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <p className="text-base leading-relaxed text-white/90 font-medium max-w-3xl">
                {briefing?.briefing || "Welcome to your Mentor Dashboard. Add skills to initiate neural tracking."}
              </p>
              <button 
                onClick={() => setShowChat(true)}
                className="shrink-0 flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <MessageSquare className="w-4 h-4" />
                Talk to Mentor
              </button>
            </div>
            {briefing?.recommendedAction && briefing.recommendedAction.targetSkill !== "None" && (
              <div className="flex items-center gap-3 mt-6 inline-flex bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-md">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Suggested Action:</span>
                <span className="text-xs font-bold text-fuchsia-300">{briefing.recommendedAction.type.toUpperCase()} — {briefing.recommendedAction.targetSkill}</span>
                <ArrowRight className="w-4 h-4 text-fuchsia-400 ml-2" />
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div>
          <TaskSection title="Action Required Today" tasks={today} icon={Calendar} emptyText="Neural pathways are stable. No critical decay predicted today." />
        </div>
        <div>
          <TaskSection title="Upcoming Forecast (Tomorrow)" tasks={tomorrow} icon={Calendar} emptyText="No immediate decay risk tomorrow." />
          <TaskSection title="Long-Term Forecast (This Week)" tasks={week} icon={Calendar} emptyText="No structural risks this week." />
        </div>
      </div>

      {skills.length === 0 && (
        <GlassCard color="rgba(99, 102, 241, 0.1)">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No skills to plan for</h3>
            <p className="text-sm text-white/50">Add skills from the dashboard to see your AI-generated revision plan.</p>
          </div>
        </GlassCard>
      )}

      {/* Persistent Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setShowChat(false)} />
          <div className="relative w-full max-w-2xl h-[80vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
             <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/30">
                    <Bot className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Neuro-Architect Mentor</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Active Semantic Link</p>
                  </div>
               </div>
               <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <div className="flex-1 overflow-hidden">
                <AnimatedAIChat 
                  messages={chatMessages}
                  isTyping={chatLoading}
                  onSendMessage={sendMentorChat}
                />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
