# Cognizance — Skill Retention & Decay Detection Platform

> **An AI-powered learning platform that scientifically tracks skill decay, generates personalized study materials, and uses gamification to help learners achieve mastery.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Philosophy](#2-core-philosophy)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Feature Deep Dive](#5-feature-deep-dive)
   - [5.1 Cognitive Command Center (Dashboard)](#51-cognitive-command-center-dashboard)
   - [5.2 Neural Roadmap (Learn)](#52-neural-roadmap-learn)
   - [5.3 Smart Notes & Master Manuals](#53-smart-notes--master-manuals)
   - [5.4 Neural Practice Lab (Quiz)](#54-neural-practice-lab-quiz)
   - [5.5 AI Oral Viva](#55-ai-oral-viva)
   - [5.6 Sage AI (Study Buddy)](#56-sage-ai-study-buddy)
   - [5.7 Weak Spots Analyzer](#57-weak-spots-analyzer)
   - [5.8 Neural Connections (Concept Graph)](#58-neural-connections-concept-graph)
   - [5.9 Skill Analytics & Tracking](#59-skill-analytics--tracking)
   - [5.10 Alerts & Notifications](#510-alerts--notifications)
   - [5.11 AI Recommendations Engine](#511-ai-recommendations-engine)
6. [AI Pipeline & Model Routing](#6-ai-pipeline--model-routing)
7. [Retention Science Engine](#7-retention-science-engine)
8. [Gamification System](#8-gamification-system)
9. [Web Content Aggregation](#9-web-content-aggregation)
10. [Data Persistence](#10-data-persistence)
11. [API Reference](#11-api-reference)
12. [Getting Started](#12-getting-started)

---

## 1. Project Overview

**Cognizance** is a full-stack AI learning platform built with Next.js 16 that solves a critical problem in education: **skill decay**. Based on the Ebbinghaus Forgetting Curve, the platform scientifically models how knowledge deteriorates over time and intervenes with personalized study plans, AI-generated notes, adversarial quizzes, and Socratic AI tutoring.

Unlike traditional learning platforms that only deliver content, Cognizance actively **monitors knowledge retention**, **predicts forgetting**, and **prescribes targeted interventions** — creating a closed-loop system where learning is continuously optimized.

### Key Differentiators

| Feature | Traditional LMS | Cognizance |
|---------|----------------|------------|
| Content Delivery | Static | AI-generated, proficiency-aware |
| Knowledge Assessment | Generic quizzes | Adversarial, targeting misconceptions |
| Retention Tracking | None | Ebbinghaus Forgetting Curve model |
| Study Planning | Manual | AI-generated 7-day micro-plans |
| Skill Management | Hardcoded catalogs | User-defined, unlimited skills |
| Export | None | PDF & Word downloads |
| Gamification | Basic badges | XP, levels, streaks, neural growth rewards |

---

## 2. Core Philosophy

Cognizance is built on three scientific principles:

1. **Ebbinghaus Forgetting Curve** — Memory retention decays exponentially. The formula `R = 0.5^(t/S)` predicts when you'll forget a concept, where `R` is retention, `t` is time since practice, and `S` is strength.

2. **Adversarial Learning** — Quizzes are designed to uncover deep misconceptions, not just test recall. Questions target your **weakest sub-concepts** and expose gaps in understanding.

3. **Spaced Repetition Feedback Loop** — The system creates a closed loop: Learn → Quiz → Analyze Weakness → Generate Targeted Notes → Quiz Again. Each cycle strengthens the neural pathways that need it most.

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, Tailwind CSS 4, Framer Motion |
| **Icons** | Lucide React |
| **AI Backend** | NVIDIA NIM API (Multi-model routing) |
| **Visualization** | react-force-graph-2d, d3-force |
| **PDF Export** | jsPDF |
| **Code Editor** | Monaco Editor (for coding problems) |
| **State Management** | React Context + localStorage |
| **Validation** | Zod |
| **Animations** | Framer Motion |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │  Learn   │  │  Notes   │  │  Quiz   │ │
│  │  /page   │  │  /learn  │  │  /notes  │  │  /quiz  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │     │
│  ┌────▼──────────────▼──────────────▼──────────────▼───┐ │
│  │              SkillContext.tsx (Global State)         │ │
│  │   Skills • XP • Levels • Badges • Quiz History      │ │
│  │   Notes • Weakness Profiles • Streaks               │ │
│  └────┬────────────────────────────────────────────────┘ │
│       │                                                  │
│  ┌────▼────────────────────────────────────────────────┐ │
│  │              RetentionEngine                        │ │
│  │   Ebbinghaus R = 0.5^(t/S) • Decay Risk • Review   │ │
│  └─────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ API Routes
┌────────────────────────▼────────────────────────────────┐
│                    BACKEND (API Layer)                   │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │generate-notes│  │generate-roadmap│  │analyze-weakness│ │
│  │  /api/...    │  │    /api/...   │  │   /api/...   │  │
│  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────▼──────────────────▼──────────────────▼───────┐  │
│  │            NVIDIA NIM Multi-Model Router           │  │
│  │  DeepSeek-V3 • Qwen3-Coder • Phi-4 • Mistral      │  │
│  │  + High-quality mock fallbacks for 100% uptime     │  │
│  └──────┬─────────────────────────────────────────────┘  │
│         │                                                │
│  ┌──────▼─────────────────────────────────────────────┐  │
│  │         Web Content Aggregation Engine             │  │
│  │ Wikipedia • DEV.to • StackOverflow • GitHub        │  │
│  │ DuckDuckGo • Open Library (6 APIs, parallel)       │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Feature Deep Dive

### 5.1 Cognitive Command Center (Dashboard)

**Route:** `/`

The dashboard is the nerve center of Cognizance, providing a bird's-eye view of all tracked skills and their health.

**What it shows:**
- **Total Skills** — Number of skills being tracked
- **Average Retention** — Weighted average across all skills (percentage)
- **High Risk Count** — Skills with retention below 60% (decaying status)
- **Day Streak** — Consecutive days of learning activity
- **AI Recommendations** — System-generated suggestions for what to study next, fetched from `/api/recommendations`
- **Failure Forecast** — Skills predicted to drop below critical retention thresholds soon

**How it works:**
On mount, the dashboard fetches AI-powered recommendations based on your current skill profile. Each skill card displays its status (`healthy`, `review`, or `decaying`), current retention score, and last reviewed timestamp.

---

### 5.2 Neural Roadmap (Learn)

**Route:** `/learn`

The centerpiece learning experience. Users enter **any skill** and their proficiency level, and the system generates a structured, phased learning roadmap.

**How it works:**
1. User enters a skill (e.g., "Java", "Machine Learning", "Docker")
2. Selects proficiency: **Beginner**, **Intermediate**, or **Expert**
3. System calls `/api/generate-roadmap` → AI generates a 3-phase curriculum:
   - **Foundations** — Core essentials and mental models
   - **Core Mastery** — Intermediate patterns and real-world application
   - **Advanced Frontiers** — Expert-level architecture and optimization
4. Each phase contains 3-4 steps with estimated hours, level tags, and concept lists
5. Clicking any step navigates to `/notes` to generate detailed study material

**Master Manual Generation:**
A "Master Manual (PDF)" button synthesizes the **entire skill domain** into a single comprehensive document (8 sections, 4 code examples, 10 key takeaways, 6 practice questions) that can be downloaded as a professional PDF.

**Gamification:**
Completing roadmap steps awards **XP** with a "Neural Growth" toast animation.

---

### 5.3 Smart Notes & Master Manuals

**Route:** `/notes`

An AI-powered note generation system that pulls real-time content from 6 web sources and synthesizes it into structured, exportable study material.

**Features:**
- **Skill + Concept Input** — Enter any skill and optional sub-concept
- **Category Selection** — General, DSA, Web Dev, System Design, Cloud/AWS, Database, OS/Networking, ML/AI
- **Depth Mode** — Quick (summary) or Deep Dive (comprehensive)
- **Three Content Tabs:**
  - **Notes** — Structured sections with headings, content, and subsections
  - **Code** — Language-specific code examples with explanations
  - **Quiz** — Practice questions (MCQ, short answer, code challenges)
- **TL;DR Summary** — AI-generated one-line summary at the top
- **Key Points** — Bullet list of critical takeaways
- **Common Mistakes** — Pitfalls to avoid
- **Source Attribution** — Wikipedia, DEV.to, StackOverflow, GitHub badges with links

**Master Manual Mode (`isFullManual=true`):**
When triggered from the Learn page, generates a comprehensive 45-minute read covering:
1. Introduction & audience
2. History & evolution with key milestones
3. Core concepts with 3 sub-topics (OOP, Type System, Exception Handling for Java)
4. Architecture & design patterns (MVC, Singleton, Factory, Observer, Builder)
5. Data structures & algorithms (Collections Framework, Big-O)
6. Best practices (coding standards, testing strategies, performance)
7. Ecosystem & tools (build tools, frameworks, IDE setup)
8. Career roadmap (certifications, advanced topics)

**Export Options:**
- **PDF Download** — Professional multi-page document with numbered sections, formatted code blocks (monospace), key takeaways, and automatic page breaks
- **Word Download** — HTML-based .doc export with full structure

**Technology Disambiguation:**
The system enforces strict disambiguation (e.g., "Java" generates Java-specific content with `public static void main`, never JavaScript's `console.log`).

---

### 5.4 Neural Practice Lab (Quiz)

**Route:** `/quiz`

An adversarial quiz system designed to expose misconceptions, not just test recall.

**How it works:**
1. Select a tracked skill from the dropdown
2. System generates concept-targeted questions
3. Each question includes:
   - 4 options (one correct, three plausible distractors)
   - Concept tag (e.g., "Memory Management", "Concurrency")
   - Explanation shown after answering
   - **Adversarial Insight** — When wrong, explains *why* the misconception exists
4. Response time is tracked per question
5. Results are saved to `SkillContext` → `quizHistory` for weakness analysis

**Key Design:**
- Questions are designed to test **deep understanding**, not surface memorization
- The "adversarial" design means wrong options are intentionally plausible
- Each attempt feeds into the Weakness Analyzer for continuous improvement

---

### 5.5 AI Oral Viva

**Route:** `/viva`

A simulated oral examination where an AI evaluator asks probing, Socratic-style questions to test true conceptual mastery.

**How it works:**
1. Select a skill and "Enter Viva Room"
2. AI opens with a challenging conceptual question (e.g., "How does Java handle state transitions at scale?")
3. Student types responses in natural language
4. AI evaluates each response and provides:
   - Follow-up questions based on gaps in the answer
   - **Neural Evaluation** — A qualitative assessment of understanding depth
5. Conversation continues dynamically, probing deeper based on responses

**Architecture:**
- Frontend: Chat-style interface with auto-scroll
- Backend: `/api/viva` endpoint using full conversation history for context-aware follow-ups
- Model: Uses the SYNTHESIS model (DeepSeek-V3.2) for complex multi-turn dialogue

---

### 5.6 Sage AI (Study Buddy)

**Route:** `/study-buddy`

A personal, Socratic AI tutor named **Sage** that helps students understand concepts through guided questioning, analogies, and code examples.

**Features:**
- **Skill Context Selector** — Focus Sage on a specific skill for domain-targeted responses
- **128k Context Window** — Can hold long technical discussions without losing context
- **Quick Prompts:**
  - "Explain this to me like I'm 5"
  - "What are the common pitfalls?"
  - "Can you give me a code example?"
  - "Quiz me on this concept"
- **Socratic Method** — Won't just give answers; guides the student to discover understanding

**Backend:** `/api/study-buddy` using Kimi-K2 model for long-context processing.

---

### 5.7 Weak Spots Analyzer

**Route:** `/weakness`

AI-driven weakness detection that analyzes quiz history to identify specific sub-concept gaps and generates targeted 7-day study plans.

**How it works:**
1. Select a skill → Click "Analyze"
2. System sends quiz history (per-concept accuracy, response times, recent wrong answers) to `/api/analyze-weakness`
3. AI (Phi-4 reasoning model) returns:
   - **Weak Concepts** — Each with severity (critical/moderate/mild), accuracy %, description, and suggested resources
   - **Strong Concepts** — Areas that don't need review
   - **Study Priority Order** — Prerequisites-first ordering
4. A **7-Day Micro Study Plan** is generated with daily focus areas, actions, and estimated minutes

**Each weak concept card includes:**
- Severity badge (Critical = red, Moderate = orange, Mild = yellow)
- Accuracy percentage
- Suggested resources (GeeksForGeeks, MDN, YouTube, LeetCode, etc.)
- "Generate Notes" link → jumps to `/notes` pre-filled for that concept

---

### 5.8 Neural Connections (Concept Graph)

**Route:** `/graph`

An interactive force-directed graph that visualizes the relationships between concepts within a skill domain.

**Features:**
- **Force-directed layout** using d3-force physics simulation
- **Node colors** based on concept mastery level
- **Interactive** — Nodes can be dragged, zoomed, and inspected
- **Dynamic generation** — Calls `/api/concept-graph` to generate concept relationships from AI

**Tech:** Uses `react-force-graph-2d` with dynamic import (no SSR) for client-side rendering.

---

### 5.9 Skill Analytics & Tracking

**Route:** `/analytics`

Deep dive into retention metrics with visual display of the decay formula.

**Displayed Formula:**
```
R = w₁(Recency) + w₂(Accuracy) + w₃(Proficiency) − Δ(Decay)
```

**Weights:**
- w₁ = 0.40 (Time since last review)
- w₂ = 0.30 (Quiz performance)
- w₃ = 0.20 (Difficulty level)
- Δ  = 0.10 (Temporal decay factor)

---

### 5.10 Alerts & Notifications

**Route:** `/alerts`

System notifications about skill health and learning milestones.

**Alert Types:**
- **High Decay Warning** (red) — When a skill's retention drops below critical threshold (e.g., 45%)
- **Weekly Report** (blue) — Summary of learning streaks and overall performance
- **Review Reminders** — Actionable "Review Now" buttons linked to relevant study material

---

### 5.11 AI Recommendations Engine

**API:** `POST /api/recommendations`

Generates personalized study recommendations based on the user's complete skill profile.

**Input:** Current skill array with scores, statuses, and proficiency levels
**Output:** Prioritized list of actions (e.g., "Review PostgreSQL Indexing — retention dropping", "Take Java Concurrency quiz")

---

## 6. AI Pipeline & Model Routing

Cognizance uses **NVIDIA NIM** as its AI backbone with a multi-model routing architecture.

### Model Catalogue

| Model Key | Model | Use Case |
|-----------|-------|----------|
| `NOTES` | Meta Llama 3.1 8B | Note generation, explanations |
| `LONG_CONTEXT` | Meta Llama 3.1 8B | Web content ingestion & structuring |
| `CODER` | Meta Llama 3.1 8B | Code/DSA/programming concepts |
| `FAST_REASON` | Meta Llama 3.1 8B | Quiz analysis, weakness detection |
| `RECOMMEND` | Meta Llama 3.1 8B | Recommendations, study plans |
| `SYNTHESIS` | Meta Llama 3.1 8B | Multi-concept synthesis, viva dialogue |
| `EMBED` | NVIDIA NV-EmbedQA-E5-V5 | Embeddings |

### Central AI Router (`AIRouter`)

The `AIRouter` class standardizes all NIM calls:
- Routes tasks to optimal models based on `TaskType` (NOTES, CODER, REASONING, RECOMMEND, SYNTHESIS, VIVA, DEBUG)
- Handles automatic fallback with high-quality mock data when the API is unavailable
- Provides consistent error handling and response formatting

### Mock Fallback System

Every API endpoint includes a comprehensive mock fallback that activates when the NVIDIA NIM API returns errors (e.g., 403 Forbidden). This ensures **100% uptime** for demonstrations and development. Mock data is:
- Skill-specific (Java vs. JavaScript disambiguation)
- Proficiency-aware (Beginner/Intermediate/Expert)
- Content-rich (not placeholder data)

---

## 7. Retention Science Engine

### File: `src/lib/retention-engine.ts`

Implements the **Ebbinghaus Forgetting Curve** model:

```
R = 0.5^(t / S)
```

Where:
- **R** = Current retention probability (0 to 1)
- **t** = Hours since last practice
- **S** = Retention strength (half-life in hours)

### Methods

| Method | Description |
|--------|-------------|
| `predictRetention(mastery)` | Returns current retention as 0-100 based on time elapsed and strength |
| `calculateDecayRisk(mastery)` | Returns 0-1 risk score (1.0 = very likely to forget) |
| `predictNextReview(mastery)` | Calculates optimal next review date (when retention drops to 75%) |

### Half-Life Model
- Half-life = `24 hours × retention_strength`
- A strength of 1 means 50% retention after 24 hours
- A strength of 5 means 50% retention after 5 days
- Strength increases with each successful review cycle

---

## 8. Gamification System

### File: `src/lib/SkillContext.tsx`

**XP & Leveling:**
- Every action (completing roadmap steps, generating notes, taking quizzes) awards XP
- Visual "Neural Growth" toast with `+XP` animation
- Level progression based on accumulated XP

**Skill Tracking:**
- Each skill tracks: `score`, `status`, `streak`, `quizHistory`, `weaknessProfile`, `notes`, `xp`, `level`, `badges`
- Status auto-computed: `healthy` (≥80), `review` (60-79), `decaying` (<60)

**Streaks:**
- Day streak counter for consecutive learning activity
- Displayed on the dashboard as a motivational metric

**Badges:**
- Achievable badges tied to milestones (stored in `badges: string[]`)

---

## 9. Web Content Aggregation

### File: `src/lib/web-content.ts`

The platform aggregates educational content from **6 free public APIs** in parallel:

| Source | API | Data |
|--------|-----|------|
| **Wikipedia** | REST API | Concept summaries and introductions |
| **DEV.to** | Public API | Technical articles by tag |
| **Stack Overflow** | Stack Exchange API | Top-voted Q&A with accepted answers |
| **GitHub** | Search API | Tutorial repositories by stars |
| **DuckDuckGo** | Instant Answer API | Quick definitions and related topics |
| **Open Library** | Open Library API | Relevant book recommendations |

**Architecture:**
- All 6 APIs are called in parallel using `Promise.allSettled()`
- Results are merged into a single `rawText` string for AI ingestion
- Each source is tagged with origin for source attribution in the UI
- 1-hour cache (`revalidate: 3600`) to reduce API calls
- Graceful degradation — individual API failures don't break the system

---

## 10. Data Persistence

All data is persisted via **localStorage** through the `SkillContext` provider:

| Key | Data | Description |
|-----|------|-------------|
| `cognizance_skills` | `Skill[]` | All tracked skills with full state |
| `cognizance_notes` | `GeneratedNote[]` | Saved study notes (max 20) |
| `plan_{skillId}` | `StudyPlan[]` | 7-day study plans per skill |

**No backend database required** — the entire application runs client-side with API routes for AI generation only.

---

## 11. API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-notes` | POST | Generate AI study notes (regular or Master Manual) |
| `/api/generate-roadmap` | POST | Create a phased learning roadmap for any skill |
| `/api/analyze-weakness` | POST | Analyze quiz history to find sub-concept gaps |
| `/api/recommendations` | POST | Generate personalized study recommendations |
| `/api/study-buddy` | POST | Sage AI chat with conversation history |
| `/api/viva` | POST | AI oral examination with evaluation |
| `/api/concept-graph` | POST | Generate concept relationship data for visualization |
| `/api/generate` | POST | General AI content generation |
| `/api/problems` | POST | Coding problem generation |
| `/api/submit` | POST | Code submission and evaluation |
| `/api/debug` | POST | Debug assistance |

---

## 12. Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd cognizance-next

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your NVIDIA_API_KEY to .env.local
```

### Environment Variables

```env
NVIDIA_API_KEY=your_nvidia_nim_api_key_here
```

> **Note:** The platform works fully without an API key — all AI features have high-quality mock fallbacks.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
cognizance-next/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard (Cognitive Command Center)
│   │   ├── learn/page.tsx      # Neural Roadmap
│   │   ├── notes/page.tsx      # Smart Notes & Master Manuals
│   │   ├── quiz/page.tsx       # Neural Practice Lab
│   │   ├── viva/page.tsx       # AI Oral Viva
│   │   ├── study-buddy/page.tsx # Sage AI Tutor
│   │   ├── weakness/page.tsx   # Weak Spots Analyzer
│   │   ├── graph/page.tsx      # Neural Connections Graph
│   │   ├── analytics/page.tsx  # Skill Analytics
│   │   ├── alerts/page.tsx     # Alerts & Notifications
│   │   └── api/                # 11 API endpoints
│   ├── lib/
│   │   ├── SkillContext.tsx     # Global state (skills, XP, badges)
│   │   ├── retention-engine.ts # Ebbinghaus forgetting curve
│   │   ├── concept-analyzer.ts # AI weakness detection
│   │   ├── nvidia-ai.ts        # NVIDIA NIM multi-model router
│   │   ├── web-content.ts      # 6-API content aggregator
│   │   └── ai/router.ts        # Central AI task router
│   └── components/
│       ├── layout/Topbar.tsx    # Shared navigation header
│       └── coding/             # Monaco editor components
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

*Built with ❤️ using Next.js 16, React 19, NVIDIA NIM, and the Ebbinghaus Forgetting Curve.*
