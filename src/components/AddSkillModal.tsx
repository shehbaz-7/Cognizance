"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useSkills } from "@/lib/SkillContext";

const CATEGORIES = ["Programming", "Database", "OS", "Cloud", "Web Dev", "ML/AI", "DSA", "Other"];
const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced"] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddSkillModal({ open, onClose }: Props) {
  const { skills, addSkill } = useSkills();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Programming");
  const [proficiency, setProficiency] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);

    try {
      // Fetch prerequisites from NIM AI
      const res = await fetch("/api/prerequisites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: name.trim(), proficiency }),
      });
      const data = await res.json();
      const prerequisites: string[] = data.prerequisites || [];

      // Calculate missing prerequisites by cross-referencing user's existing skills (fuzzy match simple lowercase)
      const existingSkillNames = skills.map(s => s.name.toLowerCase());
      const missingPrerequisites = prerequisites.filter(p => !existingSkillNames.includes(p.toLowerCase()));

      addSkill({
        name: name.trim(),
        category,
        proficiency,
        lastPracticed: new Date().toISOString(),
        confidence,
        notes,
        prerequisites,
        missingPrerequisites,
      });

      // Reset
      setName("");
      setCategory("Programming");
      setProficiency("Beginner");
      setConfidence(3);
      setNotes("");
      onClose();
    } catch (err) {
      console.error(err);
      // Fallback
      addSkill({
        name: name.trim(),
        category,
        proficiency,
        lastPracticed: new Date().toISOString(),
        confidence,
        notes,
        prerequisites: [],
        missingPrerequisites: [],
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add New Skill</h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-bg-hover)] rounded-md transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Skill Name */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Skill Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Java, Python, DBMS, Cloud..."
              className="w-full bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Proficiency */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Proficiency Level</label>
            <div className="grid grid-cols-3 gap-2">
              {PROFICIENCIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProficiency(p)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors border ${
                    proficiency === p
                      ? "bg-[var(--color-accent-muted)] border-[var(--color-accent-border)] text-[var(--color-accent-hover)]"
                      : "bg-[var(--color-bg-card2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Self-Confidence: <span className="text-[var(--color-text-primary)]">{confidence}/5</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context about your current level..."
              rows={2}
              className="w-full bg-[var(--color-bg-card2)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors resize-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Foundations...</> : "Start Tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}
