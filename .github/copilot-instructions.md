# GitHub Copilot Instructions

## Project Overview

This is an **Interactive Portfolio** application built with **React 19**, **TypeScript**, and **Vite**. It features a unique dual-mode interface:

1.  **Technical Mode**: A terminal-like interface for developers (`components/Terminal.tsx`).
2.  **Non-Technical Mode**: A visual, 3D-enhanced interface (`components/NonTechnical.tsx`).

## Architecture & Core Concepts

### State Management

- **Redux Toolkit** is the source of truth for global state (`client/src/store`).
- **Mode Switching**: The `mode` slice (`features/modeSlice`) controls the active view (`isTechnicalMode`) and theme.
- **Data Fetching**: `TanStack Query` is configured (`lib/queryClient.ts`) but static content is primarily loaded from JSON files in `client/src/data`.

### AI Integration

The project implements a hybrid AI approach:

- **Cloud AI**: Google Gemini via `@google/genai` in `client/src/lib/genai.ts`. API keys are managed in-memory.
- **Local AI**: WebLLM (`@mlc-ai/web-llm`) running in-browser via WebGPU in `client/src/lib/webllm.ts`.
- **Chat Interface**: Located in `client/src/components/chat`.

### Styling & UI

- **Tailwind CSS 4**: Used for all styling.
- **Shadcn/UI**: Reusable components are in `client/src/components/ui`.
- **Animations**: `framer-motion` for UI transitions and `react-three-fiber` for 3D elements (`components/intro`, `components/skills`).

## Development Workflows

### Commands

- **Start Dev Server**: `npm run dev` (Runs Express server with Vite middleware).
- **Linting**: `npm run lint` (ESLint).
- **Build**: `npm run build` (Builds both client and server).

### Key Conventions

- **Components**: Group components by feature (e.g., `components/games`, `components/chat`) unless they are generic UI elements (`components/ui`).
- **Data**: Do not hardcode content. Use JSON files in `client/src/data` (e.g., `projects.json`, `skills.json`).
- **Imports**: Use the `@/` alias to reference `client/src` (e.g., `import { Button } from "@/components/ui/button"`).
- **3D Performance**: When modifying 3D components, ensure they are optimized to prevent frame drops, especially for the `NonTechnical` view.

## Code Generation Guidelines

1.  **Mode Awareness**: When adding features, consider how they appear in both "Terminal" and "Visual" modes.
2.  **AI Safety**: When touching `genai.ts` or `webllm.ts`, ensure API keys and model weights are handled securely and efficiently.
3.  **Type Safety**: Strictly adhere to TypeScript. Define interfaces for all data structures, especially those in `client/src/data`.
4.  **Performance**: Prioritize performance for animations and 3D rendering. Use `useMemo` and `useCallback` appropriately in render-heavy components.
5.  **General Principles**:
    - Use best practices and industry standards.
    - Write modular and reusable code.
    - Implement proper security measures and error handling.

## File Structure Highlights

- `client/src/pages/Home.tsx`: Main entry point deciding which mode to render.
- `client/src/store/features/`: Redux logic.
- `client/src/lib/`: Core utilities (AI, Audio, Types).
- `server/index.ts`: Express server entry point.
