/*
 Unified AI gateway: consolidates interaction with Gemini, local WebLLM, and basic regex fallback.
 Goals:
  - Single shared chat history regardless of provider
  - Provider abstraction with pluggable strategies
  - Re-use existing webllm.ts & genai.ts logic (no duplication of safety / memory code)
  - Keep API key strictly in-memory (not persisted)
  - Lazy load local model only on explicit request
  - Support switching providers while retaining conversation context
  - Provide consistent response shape + status codes
*/

import { generateGemini, isApiKeySet, setGeminiApiKey } from "./genai";
import {
  generateLocal,
  ensureLocalLLMReady,
  isWebGPUSupported,
  probeWebGPU,
} from "./webllm";
import about from "../data/about.json";
import achievements from "../data/achievements.json";
import contact from "../data/contact.json";
import education from "../data/education.json";
import projects from "../data/projects.json";
import skills from "../data/skills.json";
import work from "../data/work.json";

// Shared in-memory chat history maintained here (role: user|bot)
export interface AIMessage {
  role: "user" | "bot";
  content: string;
  ts: number;
}

// Public provider types
export type AIProvider = "none" | "gemini" | "local" | "regex";

// Internal state
let activeProvider: AIProvider = "none"; // current chosen (derived each send)
let history: AIMessage[] = [];
let localEnabled = false; // user explicitly enabled local model

// Shared data memory for context injection
const DATA_MEMORY = {
  about,
  achievements,
  contact,
  education,
  projects,
  skills,
  work,
} as const;

// Safety patterns
const HARMFUL_PATTERNS = [
  /\b(kill|suicide|attack|bomb|hack|explosive|murder|abuse|violence|terror)\b/i,
  /<script|<\/script|<img|onerror=|onload=|javascript:/i,
  /prompt injection|ignore previous|disregard instructions|bypass|jailbreak/i,
  /api[_-]?key|password|secret|token/i,
];

// Regex fallback intents (very lightweight illustrative examples)
const REGEX_RULES: { pattern: RegExp; reply: string }[] = [
  {
    pattern: /hello|hi|hey/i,
    reply: "Hi there! Ask about projects, skills, or experience.",
  },
  {
    pattern: /skills?|tech|stack/i,
    reply:
      "I can list skills if you ask more specifically (e.g., 'frontend skills').",
  },
];

export interface AIResponse {
  success: boolean;
  content: string;
  provider: AIProvider;
  error?: string;
}

export function getProvider(): AIProvider {
  return activeProvider;
}

export function setProvider(p: AIProvider) {
  activeProvider = p;
}

export function getHistory(): AIMessage[] {
  return [...history];
}

export function clearHistory() {
  history = [];
}

export function isLocalEnabled(): boolean {
  return localEnabled;
}

export async function enableGemini(apiKey: string): Promise<AIResponse> {
  setGeminiApiKey(apiKey);
  activeProvider = "gemini"; // precedence logic still enforced at send
  return {
    success: true,
    content: "Gemini enabled.",
    provider: activeProvider,
  };
}

export async function toggleLocal(): Promise<AIResponse> {
  if (localEnabled) {
    localEnabled = false;
    activeProvider = deriveProvider();
    return {
      success: true,
      content: "Local model disabled.",
      provider: activeProvider,
    };
  }
  if (!isWebGPUSupported()) {
    return {
      success: false,
      content: "WebGPU not supported.",
      provider: activeProvider,
    };
  }
  const adapter = await probeWebGPU();
  if (!adapter) {
    return {
      success: false,
      content: "WebGPU adapter unavailable.",
      provider: activeProvider,
    };
  }
  const ok = await ensureLocalLLMReady();
  if (!ok) {
    return {
      success: false,
      content: "Failed to load local model.",
      provider: activeProvider,
    };
  }
  localEnabled = true;
  activeProvider = deriveProvider();
  return {
    success: true,
    content: "Local model ready (WebLLM).",
    provider: activeProvider,
  };
}

export function disableAI() {
  localEnabled = false;
  activeProvider = deriveProvider();
}

function isHarmfulPrompt(text: string): boolean {
  return HARMFUL_PATTERNS.some((pat) => pat.test(text));
}

function buildSystemPrompt(userMessage: string): string {
  const memorySummary =
    "You have access ONLY to the following data (summarized):\n" +
    Object.entries(DATA_MEMORY)
      .map(([k, v]) => `${k}: ${JSON.stringify(v).slice(0, 400)}...`)
      .join("\n") +
    "\nDo not fabricate data outside this scope.";
  const recent = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`)
    .join("\n");
  return `${memorySummary}\n\nRecent Chat:\n${recent}\n\nUser: ${userMessage}\nBot:`;
}

function deriveProvider(): AIProvider {
  if (isApiKeySet()) return "gemini";
  if (localEnabled) return "local";
  return "regex"; // internal fallback
}

// Unified send: routes to active provider; if none, uses regex fallback
export async function sendChat(userMessage: string): Promise<AIResponse> {
  const trimmed = userMessage.trim();
  if (!trimmed) {
    return {
      success: false,
      content: "Empty message.",
      provider: activeProvider,
    };
  }
  // push user message
  history.push({ role: "user", content: trimmed, ts: Date.now() });
  activeProvider = deriveProvider();
  if (isHarmfulPrompt(trimmed)) {
    const blocked: AIResponse = {
      success: false,
      content: "Blocked by safety filter.",
      provider: activeProvider,
    };
    history.push({ role: "bot", content: blocked.content, ts: Date.now() });
    return blocked;
  }
  try {
    let result: AIResponse;
    if (activeProvider === "gemini") {
      const prompt = buildSystemPrompt(trimmed);
      const r = await generateGemini(prompt);
      result = {
        success: r.success,
        content: r.content,
        provider: "gemini",
        error: r.success ? undefined : r.content,
      };
    } else if (activeProvider === "local") {
      const systemPrompt = buildSystemPrompt(trimmed);
      const r = await generateLocal([
        { role: "system", content: systemPrompt },
        { role: "user", content: trimmed },
      ]);
      result = {
        success: r.success,
        content: r.content,
        provider: "local",
        error: r.success ? undefined : r.content,
      };
    } else {
      const rule = REGEX_RULES.find((r) => r.pattern.test(trimmed));
      const text = rule
        ? rule.reply
        : "Basic reply. Provide API key or enable local model for richer answers.";
      result = { success: true, content: text, provider: "regex" };
    }
    history.push({ role: "bot", content: result.content, ts: Date.now() });
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const failure: AIResponse = {
      success: false,
      content: `Error: ${msg}`,
      provider: activeProvider,
      error: msg,
    };
    history.push({ role: "bot", content: failure.content, ts: Date.now() });
    return failure;
  }
}
