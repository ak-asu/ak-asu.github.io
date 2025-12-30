# WebLLM Chat Implementation

## Overview

This portfolio features an AI-powered JARVIS chat assistant using **WebLLM** - a fully client-side LLM solution that runs entirely in the browser with **zero server costs** and **complete privacy**.

## Key Features

### 🚀 Client-Side AI

- **100% Browser-Based**: No API keys, no server costs, no data sent to external services
- **Privacy-First**: All data processing happens locally in the user's browser
- **WebGPU Powered**: Leverages hardware acceleration for fast inference

### 🧠 Smart Context Retrieval (RAG)

- **Intelligent Data Chunking**: Doesn't send entire portfolio data at once
- **Keyword-Based Retrieval**: Analyzes queries to fetch only relevant context
- **Category-Aware**: Understands skills, projects, work, education, achievements
- **Optimized Context Window**: Sends only top 2-3 relevant categories per query

### 💾 Persistent Caching

- **IndexedDB Storage**: Model downloaded only once (~500MB)
- **Instant Subsequent Loads**: Cached model loads in seconds after first download
- **Browser Storage**: Model persists across page refreshes

### ✨ User Experience

- **Streaming Responses**: Real-time token-by-token generation
- **Progress Tracking**: Visual progress bar during initial model download
- **Voice Integration**: Text-to-speech for responses (optional)
- **JARVIS Theme**: Iron Man-inspired UI with Arc Reactor animations

## Architecture

### File Structure

```
src/
├── services/
│   ├── webLLMService.ts      # WebLLM engine management
│   └── contextManager.ts     # Smart RAG retrieval system
├── components/
│   └── chat/
│       └── JarvisChat.tsx    # Chat UI component
└── data/
    ├── about.json
    ├── projects.json
    ├── skills.json
    ├── work.json
    ├── education.json
    └── achievements.json
```

### Components

#### 1. **WebLLM Service** (`webLLMService.ts`)

- Manages WebLLM engine lifecycle
- Handles model initialization with progress callbacks
- Provides streaming chat completions
- Uses `Llama-3.2-1B-Instruct-q4f16_1-MLC` model (optimized for web)

#### 2. **Context Manager** (`contextManager.ts`)

- Analyzes user queries to determine intent
- Retrieves relevant data from JSON files
- Formats context for LLM consumption
- Implements keyword-based semantic matching

#### 3. **JARVIS Chat** (`JarvisChat.tsx`)

- React component with Framer Motion animations
- Manages chat state and message history
- Integrates voice input/output
- Displays model download progress

## How It Works

### First-Time Experience

1. **User Opens Page**

   ```
   ↓ Component mounts
   ↓ WebLLM initialization starts
   ↓ Model downloads from CDN (~500MB)
   ↓ Progress shown: "Downloading... 45%"
   ↓ Model cached in IndexedDB
   ↓ Chat ready!
   ```

2. **Model Download**
   - Shows animated loading indicator
   - Displays progress percentage
   - Shows status text (e.g., "Loading model weights...")
   - Input disabled until ready

### Subsequent Visits

1. **User Returns to Page**
   ```
   ↓ Component mounts
   ↓ WebLLM checks IndexedDB
   ↓ Model found in cache!
   ↓ Loads in 2-5 seconds (no download)
   ↓ Chat ready!
   ```

### Chat Flow

1. **User Asks Question**

   ```
   User: "Tell me about your skills"

   ↓ Context Manager analyzes query
   ↓ Identifies category: "skills"
   ↓ Retrieves skills.json data
   ↓ Formats as context
   ↓ Sends to WebLLM with system prompt
   ↓ Streams response token-by-token
   ↓ Displays with typing animation
   ```

2. **Smart Context Selection**

   ```javascript
   Query: "What hackathons did you win?"

   Categories Detected:
   - achievements (high relevance)
   - projects (medium relevance)

   Context Sent:
   - Top achievements (HackASU, Opportunity Hack)
   - Related projects (VisionForge, NMTSA)

   NOT Sent:
   - All 20 projects
   - All skills
   - Work experience
   - Education details
   ```

## Technical Details

### Model Information

- **Model**: `Llama-3.2-1B-Instruct-q4f16_1-MLC`
- **Size**: ~500MB (quantized)
- **Format**: 4-bit quantization with float16
- **Context Window**: Optimized for web performance
- **Speed**: 10-20 tokens/second on modern hardware

### System Prompt

```
You are JARVIS (Just A Rather Very Intelligent System),
an AI assistant for Aakash Khepar's portfolio website.

- Professional yet conversational
- Concise responses (2-4 sentences)
- Uses provided portfolio data
- Never makes up information
- Suggests related sections when relevant
```

### Browser Requirements

- **WebGPU Support**: Chrome 113+, Edge 113+
- **IndexedDB**: All modern browsers
- **Storage**: ~1GB available space
- **RAM**: 4GB+ recommended

### Performance Optimizations

1. **Lazy Model Loading**: Only initializes when page loads
2. **Conversation History Pruning**: Keeps last 4 messages only
3. **Token Limits**: Max 300 tokens per response
4. **Efficient Context**: Sends only 2-3 categories max
5. **Streaming**: Progressive rendering for better UX

## Usage Examples

### Query Types Handled

**Skills/Technology**

```
Q: "What technologies do you know?"
→ Retrieves skills.json
→ Groups by category (Languages, Frameworks, Tools)
→ Mentions Advanced/Intermediate levels
```

**Projects**

```
Q: "Tell me about LocalScholar"
→ Searches projects.json
→ Finds exact match
→ Returns full project details
```

**Experience**

```
Q: "Where did you work?"
→ Retrieves work.json
→ Lists companies and roles
→ Highlights key technologies
```

**Education**

```
Q: "What's your education?"
→ Retrieves education.json
→ Shows degrees, institutions, GPAs
→ Mentions relevant courses
```

## Development

### Adding New Data

1. Update JSON file in `src/data/`
2. Context Manager automatically picks it up
3. No code changes needed

### Customizing Responses

Edit `systemPrompt` in `webLLMService.ts`:

```typescript
private readonly systemPrompt = `
  Your custom instructions here...
`;
```

### Changing Model

Update `modelId` in `webLLMService.ts`:

```typescript
// Options: See https://webllm.mlc.ai/
private readonly modelId = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
```

## Troubleshooting

### Model Won't Download

- Check browser console for errors
- Verify WebGPU support: `chrome://gpu`
- Ensure sufficient disk space
- Clear IndexedDB if corrupted

### Slow Responses

- Check GPU availability
- Try smaller model variant
- Reduce max_tokens in config
- Limit conversation history

### Cache Issues

- Clear IndexedDB: DevTools → Application → IndexedDB
- Model re-downloads automatically
- No data loss (only model cache)

## Benefits Over Traditional Chat

| Feature     | WebLLM                | Traditional API      |
| ----------- | --------------------- | -------------------- |
| **Privacy** | 100% local            | Data sent to servers |
| **Cost**    | $0                    | Pay per token        |
| **Speed**   | Fast (after cache)    | Network dependent    |
| **Offline** | Works offline         | Requires internet    |
| **Data**    | Your data stays local | Sent to third party  |
| **Latency** | 0ms network           | 50-500ms network     |

## Future Enhancements

- [ ] Add conversation memory beyond 4 messages
- [ ] Implement semantic search with embeddings
- [ ] Support multi-modal inputs (images)
- [ ] Add function calling for actions
- [ ] Enable model hot-swapping
- [ ] Add conversation export feature

## Credits

- **WebLLM**: https://webllm.mlc.ai/
- **MLC LLM**: https://llm.mlc.ai/
- **Model**: Meta Llama 3.2
- **Quantization**: MLC team

## License

This implementation is part of the portfolio project. WebLLM is licensed under Apache 2.0.
