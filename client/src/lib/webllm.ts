import {
  CreateMLCEngine,
  // type MLCEngineInterface,
  type ChatCompletionMessageParam,
  MLCEngine,
} from "@mlc-ai/web-llm";
// In-memory model selection (configurable)
let selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
let engine: MLCEngine | null = null;

export function isModelLoaded() {
  return !!engine;
}

// Access underlying engine (read-only). Mutations should be performed via provided helper functions.
export function getLocalEngine(): MLCEngine | null {
  return engine;
}

export async function loadModel(
  modelId?: string,
  progressCallback?: (p: number) => void,
) {
  if (engine) return true;
  selectedModel = modelId || selectedModel;
  try {
    engine = await CreateMLCEngine(selectedModel, {
      initProgressCallback: progressCallback
        ? (report: { progress?: number }) => {
            if (typeof report.progress === "number") {
              progressCallback(report.progress);
            }
          }
        : undefined,
    });
    return true;
  } catch (error) {
    engine = null;
    return false;
  }
}

// Simple stateless generation call. Caller constructs any system/context messages.
export async function generateLocal(
  messages: ChatCompletionMessageParam[],
): Promise<{ success: boolean; content: string }> {
  if (!engine) {
    const loaded = await loadModel();
    if (!loaded) {
      return { success: false, content: "Model not loaded." };
    }
  }
  try {
    const reply = await engine!.chat.completions.create({
      messages,
      temperature: 0.8,
      stream: false,
    });
    const content = (reply.choices?.[0]?.message?.content || "").trim();
    return { success: true, content };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return { success: false, content: `Error: ${errorMessage}` };
  }
}

// Hardware acceleration helpers
export function isWebGPUSupported(): boolean {
  try {
    if (typeof navigator === "undefined") return false;
    // Use feature check via in operator to avoid any casts
    const n = navigator as unknown as { gpu?: unknown };
    return "gpu" in n && n.gpu != null;
  } catch {
    return false;
  }
}

export async function ensureLocalLLMReady(
  modelId?: string,
  progressCallback?: (p: number) => void,
): Promise<boolean> {
  if (!isWebGPUSupported()) return false;
  if (engine) return true;
  return await loadModel(modelId, progressCallback);
}

// Best-effort cache clear on full session end (used on page unload)
export async function clearLocalLLMCache(): Promise<void> {
  try {
    // Attempt engine unload without discarding cached weights (engine variable cleared)
    if (engine) {
      try {
        // Optional unload if supported by current engine implementation
        const maybeUnload = (
          engine as unknown as { unload?: () => Promise<void> }
        ).unload;
        if (maybeUnload) await maybeUnload();
      } catch {
        // ignore
      }
      engine = null;
    }
    // Remove any IndexedDB databases created by web-llm (heuristic match on name containing 'mlc')
    interface IDBDatabasesFunc {
      databases?: () => Promise<Array<{ name?: string }>>;
    }
    const idb = indexedDB as unknown as IDBDatabasesFunc;
    if (
      typeof indexedDB !== "undefined" &&
      typeof idb.databases === "function"
    ) {
      try {
        const dbs: { name?: string }[] = await idb.databases();
        for (const db of dbs) {
          if (db.name && /mlc/i.test(db.name)) {
            try {
              indexedDB.deleteDatabase(db.name);
            } catch {
              /* ignore individual delete failures */
            }
          }
        }
      } catch {
        // ignore feature unavailability
      }
    }
    // Clear any cache storage entries that appear related (names containing mlc)
    if ("caches" in globalThis) {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => /mlc/i.test(k))
            .map((k) => {
              try {
                return caches.delete(k);
              } catch {
                return Promise.resolve(false);
              }
            }),
        );
      } catch {
        // ignore
      }
    }
  } catch {
    // swallow all errors; cache clear is best-effort
  }
}

// Optional: probe WebGPU adapter availability (some environments report navigator.gpu but cannot create an adapter)
export async function probeWebGPU(): Promise<boolean> {
  try {
    if (!isWebGPUSupported()) return false;
    const navGpu = (navigator as unknown as { gpu?: unknown }).gpu as
      | {
          requestAdapter: (opts?: {
            powerPreference?: string;
          }) => Promise<unknown>;
        }
      | undefined;
    const adapter = await navGpu?.requestAdapter({
      powerPreference: "high-performance",
    });
    return adapter != null;
  } catch {
    return false;
  }
}
