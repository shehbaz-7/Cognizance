import { NextResponse } from "next/server";
import { nimChat, type LocalChatMessage } from "@/lib/nvidia-ai";

export async function POST(req: Request) {
  try {
    const { messages, skillContext } = await req.json();

    const systemPrompt = skillContext
      ? `You are Cognizance AI, a focused study assistant. You are helping a student study "${skillContext.skill}" at the ${skillContext.proficiency} level.${
          skillContext.weakAreas?.length > 0 ? ` Their weak areas are: ${skillContext.weakAreas.join(", ")}.` : ""
        }
        
Rules:
- Keep responses concise and educational
- Use examples specific to ${skillContext.skill}
- If asked to explain, use simple language first then add depth
- If asked for practice, generate one targeted question
- Stay focused on ${skillContext.skill} — don't drift to other topics
- Format code examples clearly`
      : `You are Cognizance AI, a helpful study assistant. Keep responses concise and educational. Use examples when explaining concepts.`;

    const chatMessages: LocalChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    try {
      const response = await nimChat(chatMessages, { maxTokens: 1024, temperature: 0.5 });
      return NextResponse.json({ message: response });
    } catch {
      // Smart mock fallback
      const skill = skillContext?.skill || "this topic";
      const allMsgs = messages || [];
      const lastMsg = allMsgs[allMsgs.length - 1]?.content?.toLowerCase() || "";
      const prevMsg = allMsgs.length >= 2 ? allMsgs[allMsgs.length - 2]?.content?.toLowerCase() || "" : "";
      const msgCount = allMsgs.filter((m: {role: string}) => m.role === "user").length;

      let reply: string;

      if (lastMsg.includes("explain") && lastMsg.includes("simpl")) {
        reply = `Let me explain ${skill} in simple terms.\n\nThink of ${skill} as a toolkit. Just like a carpenter has specific tools for specific jobs, ${skill} gives you specific tools (functions, patterns, structures) for building software.\n\n**The 3 things to remember:**\n1. Every concept in ${skill} exists to solve a specific problem\n2. You don't need to memorize everything — understand the patterns\n3. Practice with small examples before tackling big projects\n\nWhat specific part of ${skill} would you like me to break down further?`;
      } else if (lastMsg.includes("explain")) {
        reply = `Great question about ${skill}!\n\n**Core Idea:** ${skill} is built around the concept of structured problem-solving. Every feature and pattern you learn serves a specific purpose in making your code more reliable, readable, and efficient.\n\n**Why it matters:** Understanding the fundamentals deeply is more valuable than knowing many topics superficially. When you truly grasp a concept, you can apply it in situations you've never seen before.\n\n**Key insight:** The best way to understand ${skill} is to ask "why does this exist?" for every concept you encounter. Every feature was created to solve a real problem.\n\nWant me to dive into a specific concept, give you an example, or test you with a practice question?`;
      } else if (lastMsg.includes("example") || lastMsg.includes("code") || lastMsg.includes("show")) {
        reply = `Here's a practical ${skill} example:\n\n\`\`\`\n// Pattern: Input → Process → Output\n// This is the most fundamental pattern in ${skill}\n\n// Step 1: Define your data\nlet data = [10, 25, 30, 45, 50];\n\n// Step 2: Process it\nlet filtered = data.filter(x => x > 20);\nlet total = filtered.reduce((sum, x) => sum + x, 0);\n\n// Step 3: Use the result\nconsole.log("Sum of values > 20:", total); // 150\n\`\`\`\n\n**Key takeaway:** Most ${skill} programs follow this pattern: get data, transform it, output results. Master this pattern and everything else becomes variations of it.\n\nWant me to show a more advanced example or explain any part of this?`;
      } else if (lastMsg.includes("mistake") || lastMsg.includes("common") || lastMsg.includes("avoid") || lastMsg.includes("wrong")) {
        reply = `Here are the most common ${skill} mistakes:\n\n❌ **Mistake 1: Not handling errors**\nNever assume your code will always work. Always add error handling.\n\n❌ **Mistake 2: Copy-pasting without understanding**\nCode from Stack Overflow works, but if you don't understand it, you can't debug it.\n\n❌ **Mistake 3: Over-complicating solutions**\nThe simplest solution that works is usually the best. Don't add complexity unless needed.\n\n❌ **Mistake 4: Skipping documentation**\n"I'll remember what this does" — you won't. Comment your code.\n\n❌ **Mistake 5: Not testing edge cases**\nWhat happens with empty input? Null values? Very large numbers?\n\nWhich of these do you want me to explain with a real example?`;
      } else if (lastMsg.includes("quiz") || lastMsg.includes("practice") || lastMsg.includes("test me")) {
        reply = `Here's a practice question for ${skill}:\n\n**Question:** You have a function that needs to process a list of items and return only the unique ones. Which approach is most efficient?\n\nA) Use two nested loops to compare every item\nB) Sort the list first, then remove adjacent duplicates\nC) Use a Set/HashSet data structure\nD) Create a new list and check each item before adding\n\n🤔 Think about it...\n\n**Answer: C** — Using a Set gives O(n) time complexity. Option A is O(n²), B is O(n log n), and D is O(n²) in the worst case.\n\n**Why this matters in ${skill}:** Choosing the right data structure can make your code 100x faster. Always think about performance characteristics before coding.\n\nWant another question or should I explain this concept deeper?`;
      } else if (lastMsg.includes("compare") || lastMsg.includes("difference") || lastMsg.includes("vs")) {
        reply = `Great comparison question about ${skill}!\n\n| Aspect | Approach A | Approach B |\n|--------|-----------|----------|\n| **Speed** | Faster for small data | Faster for large data |\n| **Memory** | Uses less memory | Uses more memory |\n| **Readability** | More verbose | More concise |\n| **When to use** | Simple cases, prototyping | Production, performance-critical |\n\n**Rule of thumb:** Start with the simpler approach. Only optimize when you have evidence that performance is a problem. Premature optimization causes more bugs than it solves.\n\nWant me to compare specific concepts in ${skill}?`;
      } else if (lastMsg.includes("yes") || lastMsg.includes("sure") || lastMsg.includes("go ahead") || lastMsg.includes("please") || lastMsg.includes("ok") || lastMsg.includes("yeah")) {
        // Follow-up to previous context
        if (prevMsg.includes("practice") || prevMsg.includes("quiz") || prevMsg.includes("question")) {
          reply = `Here's another practice question for ${skill}:\n\n**Question:** What is the time complexity of searching for an element in a balanced binary search tree?\n\nA) O(1)\nB) O(log n)\nC) O(n)\nD) O(n log n)\n\n**Answer: B — O(log n)**\n\nA balanced BST eliminates half the remaining nodes at each step. With 1,000,000 nodes, you need at most ~20 comparisons. That's the power of logarithmic algorithms!\n\nWant to try another one, or should I explain a concept instead?`;
        } else if (prevMsg.includes("deeper") || prevMsg.includes("explain") || prevMsg.includes("break")) {
          reply = `Let me go deeper into ${skill}.\n\n**Level 2 Understanding:**\n\n${skill} isn't just about syntax — it's about thinking patterns. Here are the 3 mental models that separate beginners from experts:\n\n**1. Abstraction:** Break complex problems into smaller, manageable pieces. Each piece should do one thing well.\n\n**2. State Management:** Track what data changes and when. Most bugs come from unexpected state changes.\n\n**3. Trade-offs:** Every design decision has a cost. Faster code uses more memory. Readable code might be slower. Know what to optimize for.\n\nMastering these mental models will make you effective in ${skill} and every other technology you learn.\n\nShall I give you a concrete example of any of these?`;
        } else {
          reply = `Continuing with ${skill}...\n\n**Here's an important concept most learners miss:**\n\nThe best ${skill} developers don't memorize everything. Instead, they understand **patterns** that repeat across the entire field:\n\n1. **CRUD** — Create, Read, Update, Delete (applies to databases, APIs, UIs)\n2. **DRY** — Don't Repeat Yourself (extract reusable functions)\n3. **Separation of Concerns** — Each module handles one responsibility\n\nThese three principles apply whether you're writing a simple script or building a complex system.\n\n**Action item:** Pick any project you've built and check if it follows these principles. Refactoring to follow them will teach you more than building something new.\n\nWhat would you like to explore next?`;
        }
      } else if (lastMsg.includes("buzz") || lastMsg.includes("keyword") || lastMsg.includes("term") || lastMsg.includes("jargon")) {
        reply = `Here are the key buzzwords and terms for ${skill}:\n\n**Core Terms:**\n• **API** — Application Programming Interface (how different software talks to each other)\n• **Algorithm** — A step-by-step procedure for solving a problem\n• **Data Structure** — A way to organize and store data efficiently\n• **OOP** — Object-Oriented Programming (organizing code into objects)\n• **Design Pattern** — A reusable solution to a common problem\n\n**Advanced Terms:**\n• **Concurrency** — Running multiple tasks simultaneously\n• **Latency** — The delay before a transfer of data begins\n• **Scalability** — The ability to handle growing amounts of work\n• **Microservices** — Breaking an app into small, independent services\n• **CI/CD** — Continuous Integration/Continuous Deployment\n\nUnderstanding these terms will help you read documentation and communicate with other developers. Want me to explain any of them in detail?`;
      } else if (lastMsg.includes("help") || lastMsg.includes("stuck") || lastMsg.includes("don't understand") || lastMsg.includes("confused")) {
        reply = `No worries — let's figure this out together!\n\n**When you're stuck in ${skill}, try this 4-step process:**\n\n1. **Restate the problem** in your own words. If you can't explain it simply, you haven't understood it yet.\n\n2. **Break it down** into the smallest possible pieces. What's the ONE thing you don't understand?\n\n3. **Find a simpler example.** Complex code is just many simple pieces combined.\n\n4. **Rubber duck it.** Explain your thinking out loud (or type it here). Often the act of explaining reveals the gap.\n\nTell me exactly what concept or problem is confusing you, and I'll walk you through it step by step.`;
      } else if (msgCount <= 1) {
        reply = `Welcome! I'm your ${skill} study assistant. I can help you with:\n\n• **Explain concepts** — Ask me about any ${skill} topic\n• **Give examples** — Real code and practical scenarios\n• **Practice questions** — Test your understanding\n• **Compare concepts** — Understand differences between approaches\n• **Common mistakes** — What to avoid and why\n\nWhat would you like to start with?`;
      } else {
        // Generic knowledge response for any other input
        reply = `That's a great area to explore in ${skill}!\n\n**Here's what you should know:**\n\nIn ${skill}, "${lastMsg}" relates to how we structure and organize our approach to problem-solving. The key principles are:\n\n1. **Start with understanding the problem** before writing any code\n2. **Choose the right tools** — ${skill} has built-in features for most common tasks\n3. **Test your assumptions** — write small experiments to verify your understanding\n\n**Pro tip:** The best way to learn any concept in ${skill} is the "build-break-fix" cycle:\n- Build something small\n- Intentionally break it\n- Fix it and understand why it broke\n\nThis teaches deeper understanding than reading alone.\n\nWant me to explain this concept more specifically, or give you a hands-on example?`;
      }

      return NextResponse.json({ message: reply });
    }
  } catch (error) {
    console.error("Study buddy error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
