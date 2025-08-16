import { GoogleGenAI } from "@google/genai";

// In-memory API key (not persisted & only accessible in this module)
let geminiApiKey: string | null = null;

export function isApiKeySet() {
  return !!geminiApiKey;
}

export function setGeminiApiKey(key: string) {
  geminiApiKey = key.trim();
}

export function clearGeminiApiKey() {
  geminiApiKey = null;
}

export function getGeminiApiKey() {
  return geminiApiKey;
}

// Low-level single-shot generation using a fully-prepared prompt string.
export async function generateGemini(
  prompt: string,
): Promise<{ success: boolean; content: string }> {
  if (!geminiApiKey) return { success: false, content: "API key not set." };
  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });
    const content = (response.text || "").trim();
    return { success: true, content };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return { success: false, content: "Error: " + errorMessage };
  }
}
