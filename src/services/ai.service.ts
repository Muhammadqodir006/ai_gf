import "dotenv/config";
import { buildProactiveInstruction } from "../prompts/proactive.prompt";
import { buildSystemPrompt } from "../prompts/system.prompt";
import type { AiReply, HistoryItem } from "../types/ai.types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

