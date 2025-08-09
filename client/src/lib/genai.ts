
import { GoogleGenAI } from '@google/genai';
import achievements from '../data/achievements.json';
import contact from '../data/contact.json';
import education from '../data/education.json';
import projects from '../data/projects.json';
import skills from '../data/skills.json';
import work from '../data/work.json';

// In-memory API key (not persisted)
let geminiApiKey: string | null = null;

// In-memory chat history (not persisted)
let chatHistory: { role: 'user' | 'bot'; content: string }[] = [];

// Data memory (read-only)
const DATA_MEMORY = {
	achievements,
	contact,
	education,
	projects,
	skills,
	work,
};

// Harmful prompt filter (basic, can be extended)
const HARMFUL_PATTERNS = [
	/\b(kill|suicide|attack|bomb|hack|explosive|murder|abuse|violence|terror)\b/i,
	/<script|<\/script|<img|onerror=|onload=|javascript:/i, // XSS
	/prompt injection|ignore previous|disregard instructions|bypass|jailbreak/i,
	/api[_-]?key|password|secret|token/i,
];

export function isApiKeySet() {
	return !!geminiApiKey;
}

export function setGeminiApiKey(key: string) {
	geminiApiKey = key.trim();
}

export function clearGeminiApiKey() {
	geminiApiKey = null;
}

export function getChatHistory() {
	return chatHistory.slice();
}

export function clearChatHistory() {
	chatHistory = [];
}

function isHarmfulPrompt(text: string): boolean {
	return HARMFUL_PATTERNS.some((pat) => pat.test(text));
}

// Only allow LLM to access DATA_MEMORY
function buildPrompt(userMessage: string, lastMessages: { role: string; content: string }[]) {
	// Add relevant data from memory (simple, can be improved with semantic search)
	const memorySummary =
		'You have access ONLY to the following data (summarized):\n' +
		Object.entries(DATA_MEMORY)
			.map(([k, v]) => `${k}: ${JSON.stringify(v).slice(0, 500)}...`)
			.join('\n') +
		'\nDo not answer questions about anything outside this data.';
	const context = lastMessages
		.map((m) => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`)
		.join('\n');
	return `${memorySummary}\n\nChat context:\n${context}\n\nUser: ${userMessage}\nBot:`;
}

export async function sendMessageToGemini(userMessage: string): Promise<{ success: boolean; content: string }> {
	if (!geminiApiKey) {
		return { success: false, content: 'API key not set.' };
	}
	if (isHarmfulPrompt(userMessage)) {
		return { success: false, content: 'Your message was blocked for safety reasons.' };
	}
	// Only last 3 exchanges (user+bot)
	const lastMessages = chatHistory.slice(-6);
	const prompt = buildPrompt(userMessage, lastMessages);
	try {
		const ai = new GoogleGenAI({ apiKey: geminiApiKey });
		const response = await ai.models.generateContent({
			model: 'gemini-2.0-flash-001',
			contents: prompt,
		});
		const content = (response.text || '').trim();
		// Save to chat history
		chatHistory.push({ role: 'user', content: userMessage });
		chatHistory.push({ role: 'bot', content });
		return { success: true, content };
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : 'Unknown error';
		return { success: false, content: 'Error: ' + errorMessage };
	}
}
