/**
 * Cognizance — Single-Provider AI Client (NVIDIA NIM)
 * Used for all core application intel.
 */
// Allow local interface since it's just local typing
export interface LocalChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

export async function nimChat(
  messages: LocalChatMessage[],
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NO_NVIDIA_KEY");

  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.3,
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NIM_ERROR_${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function nimJSON<T>(
  prompt: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<T> {
  const raw = await nimChat(
    [
      { 
        role: "system", 
        content: "You are a helpful AI that always responds with valid JSON. IMPORTANT: Use ONLY plain text for all values. No markdown, no bolding (**), no italicization (*), no bullet points, just clean string values. No explanation, just JSON." 
      },
      { role: "user", content: prompt },
    ],
    options
  );

  const cleaned = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}
