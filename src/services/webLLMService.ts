/**
 * WebLLM Service - Manages the WebLLM engine and chat functionality
 * Handles model downloading, initialization, and chat completions
 */

import * as webllm from "@mlc-ai/web-llm";
import { contextManager } from "./contextManager";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InitProgress {
  progress: number;
  text: string;
  timeElapsed: number;
}

export type InitProgressCallback = (progress: InitProgress) => void;

export type StreamCallback = (delta: string, isDone: boolean) => void;

/**
 * WebLLM Service class
 */
export class WebLLMService {
  private engine: webllm.MLCEngineInterface | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private initError: string | null = null;

  // Using a smaller, efficient model suitable for web deployment
  private readonly modelId = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

  // System prompt for AK-style responses
  private readonly systemPrompt = `You are AK, an AI assistant for Aakash Khepar's portfolio website.

You should:
- Be professional yet conversational
- Provide accurate information about Aakash's skills, projects, work experience, education, and achievements
- Keep responses concise and engaging (2-4 sentences max unless details requested)
- Use the provided portfolio data to answer questions accurately
- If information isn't in the data, politely say you don't have that specific information
- Suggest related portfolio sections when relevant
- Never make up information not present in the data

Personality:
- Sophisticated and helpful
- Slightly formal but approachable
- Efficient and to-the-point

When users greet you, respond warmly and offer to help explore the portfolio.`;

  constructor() {}

  /**
   * Initialize the WebLLM engine with progress tracking
   * Uses IndexedDB caching to avoid re-downloading models
   */
  async initialize(
    progressCallback?: InitProgressCallback,
  ): Promise<{ success: boolean; error?: string }> {
    if (this.isInitialized) {
      return { success: true };
    }

    if (this.isInitializing) {
      return {
        success: false,
        error: "Initialization already in progress",
      };
    }

    this.isInitializing = true;
    this.initError = null;

    try {
      // Create engine with progress callback and IndexedDB cache enabled
      // WebLLM automatically uses IndexedDB to cache the model
      // This means the model is only downloaded once, then loaded from cache
      this.engine = await webllm.CreateMLCEngine(this.modelId, {
        initProgressCallback: (report: webllm.InitProgressReport) => {
          if (progressCallback) {
            progressCallback({
              progress: report.progress,
              text: report.text,
              timeElapsed: report.timeElapsed,
            });
          }
        },
        // appConfig with cache enabled (default behavior)
        // The model will be cached in IndexedDB after first download
      });

      this.isInitialized = true;
      this.isInitializing = false;

      console.log(
        "WebLLM engine initialized successfully (cached models will load faster)",
      );
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.initError = errorMessage;
      this.isInitializing = false;

      console.error("Failed to initialize WebLLM:", error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if engine is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.engine !== null;
  }

  /**
   * Get initialization status
   */
  getStatus(): {
    initialized: boolean;
    initializing: boolean;
    error: string | null;
  } {
    return {
      initialized: this.isInitialized,
      initializing: this.isInitializing,
      error: this.initError,
    };
  }

  /**
   * Generate chat completion with streaming
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[],
    streamCallback?: StreamCallback,
  ): Promise<string> {
    if (!this.isReady()) {
      throw new Error(
        "WebLLM engine not initialized. Please wait for initialization to complete.",
      );
    }

    try {
      // Get relevant context based on user query
      const relevantContext = contextManager.getRelevantContext(userMessage, 2);

      // Build messages array
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `${this.systemPrompt}\n\n${relevantContext}`,
        },
        // Include last 4 messages for context (to keep context window manageable)
        ...conversationHistory.slice(-4),
        {
          role: "user",
          content: userMessage,
        },
      ];

      // Generate completion with streaming
      if (streamCallback) {
        let fullResponse = "";

        const completion = await this.engine!.chat.completions.create({
          messages,
          temperature: 0.7,
          max_tokens: 300,
          stream: true,
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullResponse += delta;
            streamCallback(delta, false);
          }
        }

        streamCallback("", true); // Signal completion
        return fullResponse;
      } else {
        // Non-streaming completion
        const completion = await this.engine!.chat.completions.create({
          messages,
          temperature: 0.7,
          max_tokens: 300,
        });

        return completion.choices[0]?.message?.content || "";
      }
    } catch (error) {
      console.error("Chat completion error:", error);
      throw new Error(
        `Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Reset chat history (if needed)
   */
  async resetChat(): Promise<void> {
    if (this.engine) {
      await this.engine.resetChat();
    }
  }

  /**
   * Cleanup and unload model
   */
  async unload(): Promise<void> {
    if (this.engine) {
      // WebLLM doesn't have explicit unload in newer versions
      // The engine will be garbage collected
      this.engine = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const webLLMService = new WebLLMService();
