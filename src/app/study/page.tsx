"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSkills } from "@/lib/SkillContext";
import { useChat, type ChatMessage } from "@/lib/ChatContext";
import type { GeneratedNotes } from "@/lib/types";
import { Loader2, BookOpen, Send, Bot, User, Sparkles, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatedAIChat } from "@/components/ui/AnimatedAIChat";

function StudyWorkspaceContent() {
  const searchParams = useSearchParams();
  const { skills, getSkill, markPracticed, saveRevision } = useSkills();
  const { getChat, saveChat, loading: chatsLoading } = useChat();
  const [selectedSkillId, setSelectedSkillId] = useState(searchParams.get("skill") || "");
  const [notes, setNotes] = useState<GeneratedNotes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Synchronize chat with the cloud when skill selection changes
  useEffect(() => {
    if (!chatsLoading) {
      setChatMessages(getChat(selectedSkillId, "study"));
    }
  }, [selectedSkillId, chatsLoading, getChat]);

  const selectedSkill = selectedSkillId ? getSkill(selectedSkillId) : undefined;

  const generateNotes = async () => {
    if (!selectedSkill) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          skill: selectedSkill.name, 
          proficiency: selectedSkill.proficiency,
          weakTopics: selectedSkill.weakTopics,
          quizHistory: selectedSkill.quizHistory
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotes(data.notes);
      saveRevision(selectedSkill.id, {
        type: "notes",
        title: `Study Notes: ${selectedSkill.name}`,
        content: data.notes
      });
      setActiveChapter(0);
      markPracticed(selectedSkill.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate notes");
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async (text: string) => {
    const msg = text;
    if (!msg.trim() || chatLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/study-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          skillContext: selectedSkill ? {
            skill: selectedSkill.name,
            proficiency: selectedSkill.proficiency,
            weakAreas: selectedSkill.weakTopics,
          } : undefined,
        }),
      });
      const data = await res.json();
      const finalMessages: ChatMessage[] = [...newMessages, { role: "assistant", content: data.message }];
      setChatMessages(finalMessages);
      // Save updated conversation to the cloud
      await saveChat(selectedSkillId, "study", finalMessages);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      {/* Left: Notes Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-6 pb-0">
          <h1 className="text-xl font-bold mb-1">Study Workspace</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">Generate structured study material for any skill</p>

          <div className="flex items-center gap-3 mb-4">
            <select
              value={selectedSkillId}
              onChange={(e) => { setSelectedSkillId(e.target.value); setNotes(null); }}
              className="flex-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">Select a skill...</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.proficiency})</option>)}
            </select>
            <button
              onClick={generateNotes}
              disabled={!selectedSkillId || loading}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Generate Notes
            </button>
          </div>
        </div>

        {/* Notes Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {!notes && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="w-10 h-10 text-[var(--color-text-muted)] mb-4" />
              <h3 className="text-base font-semibold mb-1">No notes generated yet</h3>
              <p className="text-sm text-[var(--color-text-muted)] max-w-sm">Select a skill and click Generate Notes to create structured study material.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin mb-4" />
              <p className="text-sm text-[var(--color-text-secondary)]">Generating comprehensive study notes...</p>
            </div>
          )}

          {error && (
            <div className="bg-[var(--color-red-muted)] border border-[rgba(239,68,68,0.2)] rounded-lg p-4 text-sm text-[var(--color-red)]">{error}</div>
          )}

          {notes && !loading && (
            <div className="space-y-6">
              {/* Overview */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                <h2 className="text-lg font-bold mb-2">{notes.skill} — Study Guide</h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{notes.overview}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">{notes.proficiency}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-card2)] text-[var(--color-text-muted)]">{notes.model}</span>
                </div>
              </div>

              {/* Prerequisites */}
              {notes.prerequisites.length > 0 && (
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Prerequisites</h3>
                  <ul className="space-y-1.5">
                    {notes.prerequisites.map((p, i) => (
                      <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--color-accent)] mt-0.5">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chapters */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                {/* Chapter Nav */}
                <div className="flex border-b border-[var(--color-border)] overflow-x-auto">
                  {notes.chapters.map((ch, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveChapter(i)}
                      className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                        activeChapter === i
                          ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                          : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {i + 1}. {ch.title}
                    </button>
                  ))}
                </div>

                {/* Active Chapter */}
                {notes.chapters[activeChapter] && (
                  <div className="p-5">
                    <h3 className="text-base font-bold mb-3">{notes.chapters[activeChapter].title}</h3>
                    <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line mb-4">
                      {notes.chapters[activeChapter].content}
                    </div>

                    {/* Examples */}
                    {notes.chapters[activeChapter].examples.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Examples</h4>
                        {notes.chapters[activeChapter].examples.map((ex, i) => (
                          <div key={i} className="bg-[var(--color-bg-card2)] rounded-lg p-3 mb-2 text-sm text-[var(--color-text-secondary)] font-mono text-[13px]">
                            {ex}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key Points */}
                    {notes.chapters[activeChapter].keyPoints.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Key Points</h4>
                        <ul className="space-y-1">
                          {notes.chapters[activeChapter].keyPoints.map((kp, i) => (
                            <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                              <span className="text-[var(--color-green)] mt-0.5">✓</span> {kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Common Mistakes */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Common Mistakes to Avoid</h3>
                <ul className="space-y-2">
                  {notes.commonMistakes.map((m, i) => (
                    <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--color-red)]">⚠</span> {m}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Study Guide */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">How to Study {notes.skill}</h3>
                <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <div>
                    <span className="font-medium text-[var(--color-text-primary)]">Study Order:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {notes.studyGuide.studyOrder.map((s, i) => (
                        <span key={i} className="text-[11px] bg-[var(--color-bg-card2)] px-2 py-1 rounded">{i + 1}. {s}</span>
                      ))}
                    </div>
                  </div>
                  <p><span className="font-medium text-[var(--color-text-primary)]">Depth:</span> {notes.studyGuide.depthAdvice}</p>
                  <p><span className="font-medium text-[var(--color-text-primary)]">Practice:</span> {notes.studyGuide.practiceAfterEachTopic}</p>
                  <p><span className="font-medium text-[var(--color-text-primary)]">Mastery Path:</span> {notes.studyGuide.beginnerToMastery}</p>
                  <p><span className="font-medium text-[var(--color-text-primary)]">Revision:</span> {notes.studyGuide.revisionStrategy}</p>
                </div>
              </div>

              {/* Mastery Roadmap */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Mastery Roadmap</h3>
                <div className="space-y-3">
                  {notes.masteryRoadmap.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)] shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{step.level}</div>
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">{step.goal}</p>
                        <div className="flex flex-wrap gap-1">
                          {step.topics.map((t, j) => (
                            <span key={j} className="text-[10px] bg-[var(--color-bg-card2)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revision Summary + Exercises + Interview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
                  <h4 className="text-xs font-semibold mb-2">Quick Revision</h4>
                  <ul className="space-y-1">
                    {notes.revisionSummary.map((r, i) => (
                      <li key={i} className="text-[12px] text-[var(--color-text-secondary)]">• {r}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
                  <h4 className="text-xs font-semibold mb-2">Mini Exercises</h4>
                  <ul className="space-y-1">
                    {notes.miniExercises.map((e, i) => (
                      <li key={i} className="text-[12px] text-[var(--color-text-secondary)]">{i + 1}. {e}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
                  <h4 className="text-xs font-semibold mb-2">Interview Points</h4>
                  <ul className="space-y-1">
                    {notes.interviewPoints.map((p, i) => (
                      <li key={i} className="text-[12px] text-[var(--color-text-secondary)]">• {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* References */}
              {notes.references && notes.references.length > 0 && (
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent)]" /> Web References
                  </h3>
                  <div className="space-y-3">
                    {notes.references.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card2)] hover:border-[var(--color-accent-border)] transition-colors">
                        <div className="text-sm font-medium text-[var(--color-accent)] mb-1">{r.title}</div>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{r.snippet}</p>
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-1.5 truncate">{r.url}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Chatbot Panel */}
      <div className={`border-l border-white/5 flex flex-col bg-zinc-950/80 backdrop-blur-3xl transition-all w-[350px] lg:w-[450px]`}>
          <AnimatedAIChat
            messages={chatMessages}
            isTyping={chatLoading}
            onSendMessage={sendChat}
            contextSkill={selectedSkill?.name}
          />
      </div>
    </div>
  );
}

export default function StudyWorkspace() {
  return (
    <Suspense fallback={null}>
      <StudyWorkspaceContent />
    </Suspense>
  );
}
