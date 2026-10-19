import "dotenv/config";
import { buildSystemPrompt } from "../prompts/system.prompt";
import { buildProactiveInstruction } from "../prompts/proactive.prompt";
import type { AiReply, HistoryItem } from "../types/ai.types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

type GroqResponse = {
  choices?: { message?: { content?: string } }[];
};

type Ctx = {
  mood: { mood: string; affection: number; anger: number; jealousy: number };
  facts: { key: string; value: string }[];
  history: HistoryItem[];
  gapMs: number;
};

export function formatGap(ms: number) {
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${Math.max(min, 1)} daqiqa`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h} soat`;
  return `${Math.floor(h / 24)} kun`;
}

async function callGroq(
  messages: { role: string; content: string }[]
): Promise<AiReply> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`Groq xatosi ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as GroqResponse;
  const raw = data.choices?.[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.reply === "string" && parsed.reply.trim()) {
      return parsed as AiReply;
    }
  } catch {
    // JSON bo'lmasa, quyida oddiy matn sifatida ishlatamiz
  }

  // Zaxira: mood va faktlar o'zgarmaydi
  return { reply: raw.trim() || "Hmm, nima deding?" };
}

// Oddiy suhbat
export async function chat(ctx: Ctx & { userMessage: string }) {
  const system = buildSystemPrompt({
    mood: ctx.mood,
    facts: ctx.facts,
    gapText: formatGap(ctx.gapMs),
  });

  return callGroq([
    { role: "system", content: system },
    ...ctx.history,
    { role: "user", content: ctx.userMessage },
  ]);
}

// U birinchi yozadigan holat
export async function proactive(ctx: Ctx) {
  const gapText = formatGap(ctx.gapMs);
  const system = buildSystemPrompt({
    mood: ctx.mood,
    facts: ctx.facts,
    gapText,
  });

  return callGroq([
    { role: "system", content: system },
    ...ctx.history,
    { role: "user", content: buildProactiveInstruction(gapText) },
  ]);
}