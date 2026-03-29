import { NextResponse } from "next/server";
import { nimJSON } from "@/lib/nvidia-ai";
import type { QuizQuestion } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { skill, proficiency, weakTopics, mode } = await req.json();
    if (!skill) return NextResponse.json({ error: "Skill is required" }, { status: 400 });

    const prof = proficiency || "Beginner";
    const practiceMode = mode || "MCQ";
    const weakContext = weakTopics?.length > 0
      ? `\nCRITICAL: The student has cognitive weak points in: ${weakTopics.join(", ")}. Dedicate at least 4 questions directly to these weaknesses to enforce spaced retrieval.`
      : "";

    let prompt: string;

    if (practiceMode === "Scenario") {
      prompt = `You are an expert professional scenario designer for "${skill}" at the ${prof} level.
${weakContext}

YOUR TASK: Generate 8 REAL-WORLD PROFESSIONAL SCENARIOS. Each scenario must describe a realistic workplace situation, software project, debugging crisis, or engineering decision that a ${prof}-level ${skill} developer would face on the job.

STRICT RULES FOR EVERY QUESTION:
1. The "question" field MUST be a CONCISE, real-world story. Describe a SITUATION and a PROBLEM in EXACTLY 2-3 short sentences. Do not write massive walls of text.
2. NEVER ask textbook-style questions like "What is X?" or "What does Y do?" or "What is the time complexity of Z?". Those are MCQ, NOT scenarios.
3. Each option must be a complete, detailed technical approach.
4. The scenario should feel like something from a real ${skill} job — a bug report, a code review, a system design decision, a production incident, etc.

EXAMPLE of a GOOD scenario question for Java:
"You are working on a banking application that processes thousands of transactions per second. During a load test, you notice that the application becomes unresponsive for 2-3 seconds every few minutes. The ops team confirms these pauses correlate with Full GC events in the JVM logs. Your team lead asks you to fix this without changing the hardware. What approach would you take?"

EXAMPLE of a BAD question (DO NOT DO THIS):
"What is the time complexity of binary search?" — This is a textbook MCQ, NOT a scenario.

Return ONLY a valid JSON array (no markdown, no backticks). Each object must have:
[
  {
    "id": "q1",
    "question": "The short real-world scenario story (exactly 2-3 sentences max)",
    "options": ["Detailed approach 1", "Detailed approach 2", "Detailed approach 3", "Detailed approach 4"],
    "answer": "The exact correct option string",
    "explanation": "Why this approach is best",
    "concept": "The specific technical concept",
    "subskill": "The broader category"
  }
]`;
    } else if (practiceMode === "Flashcard") {
      prompt = `You are an expert cognitive testing engine. Generate a targeted flashcard assessment for "${skill}" at the ${prof} level.
${weakContext}

Provide rapid-fire factual recall questions. The 'question' should be a concise prompt (Front) and 'answer' should be the definitive fact (Back).

CRITICAL: NEVER use single-letter placeholders like "A", "B", "C", or "D" for options. ALWAYS provide the full, descriptive text of each solution.

Return ONLY a valid JSON array of exactly 8 questions. No markdown.
[
  {
    "id": "q1",
    "question": "The flashcard front prompt",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "The exact correct option string",
    "explanation": "Concise rationale",
    "concept": "The micro-concept",
    "subskill": "The broader category"
  }
]`;
    } else {
      prompt = `You are an expert cognitive testing engine. Generate a targeted MCQ assessment for "${skill}" at the ${prof} level.
${weakContext}

Provide standard conceptual multiple-choice questions focusing on 'Why' over 'What'. Make questions that test deep understanding, not just recall.

CRITICAL: NEVER use single-letter placeholders like "A", "B", "C", or "D" for options. ALWAYS provide the full, descriptive text of each solution.

Return ONLY a valid JSON array of exactly 8 questions. No markdown.
[
  {
    "id": "q1",
    "question": "The conceptual question text",
    "options": ["Descriptive Solution 1", "Descriptive Solution 2", "Descriptive Solution 3", "Descriptive Solution 4"],
    "answer": "The exact correct option string",
    "explanation": "Deep logical rationale",
    "concept": "The specific micro-concept",
    "subskill": "The broader category"
  }
]`;
    }

    let questions: QuizQuestion[];

    try {
      questions = await nimJSON<QuizQuestion[]>(prompt, { maxTokens: 4096, temperature: 0.6 });
      questions = questions.map((q, i) => ({ ...q, id: `q${i + 1}` }));
    } catch {
      questions = practiceMode === "Scenario" 
        ? generateMockScenarios(skill, prof) 
        : generateMockMCQ(skill, prof);
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate quiz error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}

function generateMockScenarios(skill: string, proficiency: string): QuizQuestion[] {
  return [
    {
      id: "q1",
      question: `During a code review, you notice a massive 2000-line module handling product validation, pricing, and payments all together. Your lead asks you to refactor it before the next sprint. What is the most robust approach?`,
      options: [
        "Break the file into separate classes/modules for each responsibility: ProductValidator, PriceCalculator, and PaymentProcessor",
        "Add detailed comments throughout the 2000-line file so future developers can navigate it more easily",
        "Create one helper utility file and move all the smaller functions there, keeping the main logic in the original file",
        "Rewrite the entire module from scratch using a different framework to modernize the codebase"
      ],
      answer: "Break the file into separate classes/modules for each responsibility: ProductValidator, PriceCalculator, and PaymentProcessor",
      explanation: `Applying the Single Responsibility Principle by splitting the monolithic file into focused modules makes each piece independently testable and maintainable.`,
      concept: "Code Organization",
      subskill: "Architecture"
    },
    {
      id: "q2",
      question: `Your production web app is running smoothly, but the main JavaScript bundle has grown to 3.2MB, causing 8-second delays before the page becomes interactive. What is the most effective first step to fix this?`,
      options: [
        "Implement code splitting and lazy loading to break the large bundle into smaller chunks that load on demand",
        "Upgrade the server hardware to handle more concurrent connections and deliver files faster",
        "Minify all CSS files to reduce the overall page weight",
        "Switch to a CDN for all static assets without changing the bundle structure"
      ],
      answer: "Implement code splitting and lazy loading to break the large bundle into smaller chunks that load on demand",
      explanation: "Code splitting breaks massive JS bundles into smaller pieces loaded on demand, directly addressing the root cause of the UI stall.",
      concept: "Performance Optimization",
      subskill: "Frontend Architecture"
    },
    {
      id: "q3",
      question: `When two users try to register with the same username at exactly the same time, the check-then-insert logic fails and duplicates are created. How do you permanently eliminate this race condition?`,
      options: [
        "Add a unique constraint on the username column in the database and handle the constraint violation error",
        "Add a sleep/delay of 500ms between the check and the insert to prevent race conditions",
        "Use an in-memory cache to track which usernames are currently being registered",
        "Run the check and insert queries faster by optimizing the SQL indexes"
      ],
      answer: "Add a unique constraint on the username column in the database and handle the constraint violation error",
      explanation: "A database-level unique constraint guarantees that no duplicates can ever be inserted regardless of concurrent timing or race windows.",
      concept: "Race Conditions",
      subskill: "Concurrency"
    },
    {
      id: "q4",
      question: `A teammate accidentally pushed database credentials to a public repository. The keys have been rotated, but you've been tasked with securing the app so this never happens again. What should you recommend?`,
      options: [
        "Store secrets in environment variables managed through the hosting platform's secret manager, keeping them out of code",
        "Encrypt the credentials and store the encrypted versions in the source code with the decryption key in a separate file",
        "Create a private repository and move all the code there so the credentials are no longer public",
        "Store the credentials in a database table instead of in the source code, and query them at runtime"
      ],
      answer: "Store secrets in environment variables managed through the hosting platform's secret manager, keeping them out of code",
      explanation: "Environment variables are the standard for secret management. They keep credentials out of source code entirely and work safely across varying environments.",
      concept: "Security Best Practices",
      subskill: "DevOps"
    },
    {
      id: "q5",
      question: `Your app uses a third-party weather API. When the API goes down for maintenance, your entire application crashes because the network fetch fails. How do you prevent this single point of failure?`,
      options: [
        "Wrap the API calls in try-catch blocks and implement a fallback UI showing cached or default data",
        "Remove the weather feature entirely since it's causing stability issues",
        "Add a health check that pings the weather API every minute and disables the feature if it's down",
        "Increase the API request timeout to 60 seconds to give the weather service more time to respond"
      ],
      answer: "Wrap the API calls in try-catch blocks and implement a fallback UI showing cached or default data",
      explanation: "Graceful degradation is the correct approach. Try-catch prevents unhandled errors, and a fallback UI keeps the user experience intact even when external services fail.",
      concept: "Error Handling",
      subskill: "Resilience"
    },
    {
      id: "q6",
      question: `A new feature fetches related user details by running a separate database query inside a loop for 500 different items. It works in dev, but will bottleneck production. How should this be optimized?`,
      options: [
        "Replace the loop with a single batch query that fetches all related details at once using an IN clause or JOIN",
        "Add database connection pooling to handle more simultaneous queries efficiently",
        "Move the database to a faster server with more RAM and CPU",
        "Add caching on every individual query so repeated items are served from memory"
      ],
      answer: "Replace the loop with a single batch query that fetches all related details at once using an IN clause or JOIN",
      explanation: "This is the classic N+1 query problem. Making 500 individual queries creates massive network and connection overhead. A single batch query reduces this to 1 network call.",
      concept: "N+1 Query Problem",
      subskill: "Database Optimization"
    },
    {
      id: "q7",
      question: `In a real-time document editor, if two users type in the same paragraph simultaneously, the last person to save overwrites the other's changes. What architectural solution resolves this data loss?`,
      options: [
        "Implement Operational Transformation or Conflict-free Replicated Data Types (CRDTs) to merge concurrent edits automatically",
        "Lock the entire document when one user starts editing and show a 'document in use' message to others",
        "Auto-save every 2 seconds and always use the most recent version, notifying users when their version is outdated",
        "Give each user their own copy of the document and manually merge changes later"
      ],
      answer: "Implement Operational Transformation or Conflict-free Replicated Data Types (CRDTs) to merge concurrent edits automatically",
      explanation: "OT and CRDTs mathematically resolve concurrent edits without data loss, and are the industry-standard algorithms behind real-time collaboration tools like Google Docs.",
      concept: "Concurrent Data Editing",
      subskill: "System Design"
    },
    {
      id: "q8",
      question: `After continuous operation for 6 hours, your server crashes with an out-of-memory error. Restarting temporarily fixes it, but memory usage steadily climbs again. What is the most likely culprit?`,
      options: [
        "A memory leak caused by unclosed connections or growing arrays — use a memory profiler to identify the leaking objects",
        "The server lacks sufficient RAM and must be permanently upgraded to a larger instance",
        "The application is receiving too many concurrent HTTP requests and needs a load balancer",
        "The database is returning too much data per query, overloading the heap"
      ],
      answer: "A memory leak caused by unclosed connections or growing arrays — use a memory profiler to identify the leaking objects",
      explanation: "Steadily climbing memory that resets on restart is the signature of a memory leak (objects being allocated but never freed). Profilers will identify the exact retaining references.",
      concept: "Memory Leaks",
      subskill: "Debugging"
    },
  ];
}

function generateMockMCQ(skill: string, proficiency: string): QuizQuestion[] {
  return [
    {
      id: "q1",
      question: `Why is immutability considered important in ${skill} application architecture?`,
      options: [
        "It makes code run faster by avoiding garbage collection",
        "It prevents unintended side effects and makes state changes predictable and traceable",
        "It reduces the amount of code needed in a project",
        "It automatically handles concurrency without any additional code"
      ],
      answer: "It prevents unintended side effects and makes state changes predictable and traceable",
      explanation: "Immutability ensures that once data is created, it cannot be changed. This eliminates bugs caused by shared mutable state, makes debugging easier since you can track every change, and enables features like undo/redo and time-travel debugging.",
      concept: "Immutability",
      subskill: "Architecture"
    },
    {
      id: "q2",
      question: `What is the primary advantage of using dependency injection in ${skill}?`,
      options: [
        "It makes the application start up faster",
        "It allows components to be loosely coupled, making them independently testable and replaceable",
        "It reduces the total number of files in the project",
        "It automatically optimizes database queries"
      ],
      answer: "It allows components to be loosely coupled, making them independently testable and replaceable",
      explanation: "Dependency injection provides dependencies from outside rather than having components create them internally. This makes components modular, testable with mock objects, and swappable without changing the dependent code.",
      concept: "Dependency Injection",
      subskill: "Design Patterns"
    },
    {
      id: "q3",
      question: `Why should you prefer composition over inheritance in ${skill}?`,
      options: [
        "Composition is faster at runtime than inheritance",
        "Composition avoids tight coupling and the fragile base class problem, allowing more flexible code reuse",
        "Inheritance is deprecated in modern ${skill}",
        "Composition uses less memory than inheritance"
      ],
      answer: "Composition avoids tight coupling and the fragile base class problem, allowing more flexible code reuse",
      explanation: "Inheritance creates a rigid hierarchy where changes to a parent class can break child classes (fragile base class problem). Composition lets you build behavior by combining simple, independent pieces, giving you more flexibility to mix and match capabilities.",
      concept: "Composition vs Inheritance",
      subskill: "Object-Oriented Design"
    },
    {
      id: "q4",
      question: `What problem does the Observer pattern solve in ${skill}?`,
      options: [
        "It reduces the size of the compiled application",
        "It enables objects to be notified of state changes in other objects without tight coupling between them",
        "It speeds up database read operations",
        "It prevents all runtime errors in the application"
      ],
      answer: "It enables objects to be notified of state changes in other objects without tight coupling between them",
      explanation: "The Observer pattern establishes a one-to-many relationship where changes in a subject are automatically communicated to all registered observers. This decouples the publisher from subscribers, enabling scalable event-driven architectures.",
      concept: "Observer Pattern",
      subskill: "Design Patterns"
    },
    {
      id: "q5",
      question: `Why is input validation critical on the server side even if you already validate on the client side in ${skill}?`,
      options: [
        "Client-side validation is slower than server-side validation",
        "Because client-side validation can be bypassed — attackers can send requests directly to the server without using the UI",
        "Server-side validation produces better error messages",
        "Client-side validation doesn't work on mobile devices"
      ],
      answer: "Because client-side validation can be bypassed — attackers can send requests directly to the server without using the UI",
      explanation: "Client-side validation can always be circumvented by sending direct HTTP requests (via cURL, Postman, or scripts) that skip the UI entirely. Server-side validation is the last line of defense against malformed or malicious input, SQL injection, and other attacks.",
      concept: "Input Validation",
      subskill: "Security"
    },
    {
      id: "q6",
      question: `What is the main purpose of using an index on a database column in a ${skill} application?`,
      options: [
        "To encrypt the data in that column for security",
        "To dramatically speed up read queries that filter or sort by that column, at the cost of slightly slower writes",
        "To compress the data and save disk space",
        "To automatically back up the column's data"
      ],
      answer: "To dramatically speed up read queries that filter or sort by that column, at the cost of slightly slower writes",
      explanation: "A database index is like a book's index — it lets the database engine find rows quickly without scanning the entire table. The tradeoff is that inserts and updates become slightly slower because the index must also be updated.",
      concept: "Database Indexing",
      subskill: "Database Optimization"
    },
    {
      id: "q7",
      question: `Why are pure functions preferred in ${skill} for critical business logic?`,
      options: [
        "They execute faster than impure functions",
        "They always produce the same output for the same input, making them predictable, testable, and free of side effects",
        "They use less memory than impure functions",
        "They are automatically parallelized by the runtime"
      ],
      answer: "They always produce the same output for the same input, making them predictable, testable, and free of side effects",
      explanation: "Pure functions have no side effects and are deterministic. Given the same inputs, they always return the same result. This makes them trivially testable, easy to reason about, and safe to run in any order or concurrently.",
      concept: "Pure Functions",
      subskill: "Functional Programming"
    },
    {
      id: "q8",
      question: `What is the key difference between authentication and authorization in ${skill} applications?`,
      options: [
        "They are the same thing — both verify user identity",
        "Authentication verifies WHO the user is, while authorization determines WHAT they are allowed to do",
        "Authentication is for frontend and authorization is for backend",
        "Authentication uses passwords while authorization uses tokens"
      ],
      answer: "Authentication verifies WHO the user is, while authorization determines WHAT they are allowed to do",
      explanation: "Authentication (authn) confirms identity — proving you are who you claim to be (via password, OAuth, biometrics). Authorization (authz) determines permissions — what resources and actions are allowed for that verified identity. Both are required for secure applications.",
      concept: "Auth Concepts",
      subskill: "Security"
    },
  ];
}
