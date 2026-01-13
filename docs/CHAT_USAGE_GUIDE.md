# AK Chat - User Guide

## Quick Start

### First Time Users

1. **Open the Portfolio Website**
   - The page loads normally
   - WebLLM starts downloading the AI model in the background (~500MB)

2. **Click the Chat Button**
   - Red circular button with Arc Reactor glow (bottom-right corner)
   - Chat window opens showing initialization progress

3. **Wait for Model Download** (First time only - 2-5 minutes)
   - Progress bar shows download status
   - Status text updates (e.g., "Loading model weights...")
   - Percentage displayed (0% → 100%)

4. **Chat is Ready!**
   - Status changes to "Online • Ready to assist"
   - Input field becomes enabled
   - AK greeting appears

5. **Start Chatting**
   - Type your question or use voice input
   - Get instant responses about the portfolio

### Returning Users

✅ **Instant Ready** - Model loads from cache in 2-5 seconds!

No re-download needed. The model is stored in your browser's IndexedDB.

## Features

### 💬 Text Chat

- Type questions about skills, projects, work experience, education, achievements
- Press Enter or click Send button
- Responses stream in real-time (typing effect)

### 🎤 Voice Input

- Click the microphone button (left of input field)
- Speak your question
- Auto-sends after you finish speaking
- Supports continuous voice interaction

### 🔊 Voice Output

- Toggle speaker icon to enable/disable
- AK speaks responses aloud
- Uses browser's text-to-speech (British English voice when available)

### 📱 Window Controls

- **Minimize**: Collapse to header only (keep chat open but compact)
- **Close**: Hide chat completely (click button again to reopen)
- **Minimize Icon**: Collapses window to save space

## Example Questions

### About Skills

```
"What programming languages do you know?"
"Tell me about your tech stack"
"What frameworks have you used?"
"What's your experience with Python?"
```

### About Projects

```
"What projects have you built?"
"Tell me about LocalScholar"
"Show me your hackathon projects"
"What's VisionForge?"
"Do you have any AI projects?"
```

### About Experience

```
"Where have you worked?"
"What was your role at Fractal?"
"Tell me about your experience"
"What technologies did you use at work?"
```

### About Education

```
"What's your educational background?"
"Where did you study?"
"What's your GPA?"
"What courses did you take?"
```

### About Achievements

```
"What hackathons have you won?"
"Tell me about your achievements"
"Any awards or recognition?"
```

### General

```
"Who are you?"
"What can you help me with?"
"Tell me about Aakash"
```

## Tips for Best Experience

### ✅ Do's

- Ask specific questions for detailed answers
  - Use natural language (AK understands context)
- Try voice input for hands-free interaction
- Minimize when not actively chatting (saves screen space)

### ❌ Don'ts

- Don't expect answers about information not in the portfolio
- Don't ask questions requiring external knowledge
- Don't close browser during initial model download (progress will be lost)
  - AK only knows about Aakash's portfolio data

## Browser Compatibility

### ✅ Supported Browsers

- **Chrome/Edge**: Version 113+ (Best performance)
- **Requires WebGPU**: Check at `chrome://gpu`

### ❌ Not Supported

- Firefox (WebGPU experimental)
- Safari (WebGPU in development)
- Mobile browsers (limited WebGPU support)

**Note**: If WebGPU is unavailable, you'll see an error. Please use Chrome or Edge.

## Performance

### Expected Behavior

**First Visit:**

- Model Download: 2-5 minutes (depends on internet speed)
- Response Speed: 10-20 tokens/second after download

**Subsequent Visits:**

- Model Load: 2-5 seconds (from cache)
- Response Speed: 10-20 tokens/second

**Hardware Impact:**

- GPU Usage: Moderate (WebGPU acceleration)
- RAM: ~1-2GB while chat is active
- Storage: ~500MB (model cache in IndexedDB)

## Privacy & Security

### 🔒 100% Private

- **No Data Sent**: All processing happens in your browser
- **No API Calls**: Zero external requests for chat
- **No Tracking**: Conversations are not logged or saved
- **Local Storage**: Only the AI model is cached locally

### 🗑️ Clear Data

To remove the cached model:

1. Open DevTools (F12)
2. Go to Application → IndexedDB
3. Delete WebLLM databases
4. Refresh page (model will re-download on next use)

## Troubleshooting

### Chat Won't Initialize

**Problem**: Stuck at "Initializing..." or error message

**Solutions**:

- Check browser console for errors (F12)
- Verify WebGPU support at `chrome://gpu`
- Try clearing IndexedDB and refreshing
- Ensure at least 1GB free disk space

### Slow Responses

**Problem**: AK takes long to respond

**Solutions**:

- Check GPU isn't being used by other apps
- Close other heavy browser tabs
- Ensure adequate RAM available
- Try reloading the page

### Model Download Failed

**Problem**: Download stops or shows error

**Solutions**:

- Check internet connection
- Refresh page to restart download
- Clear browser cache and try again
- Wait and retry (CDN may be temporarily unavailable)

### Voice Input Not Working

**Problem**: Microphone button doesn't work

**Solutions**:

- Grant microphone permissions when prompted
- Check browser has mic access in settings
- Ensure no other app is using the microphone
- Try clicking the mic icon again

### Voice Output Not Working

**Problem**: AK doesn't speak responses

**Solutions**:

- Click speaker icon to enable (blue = enabled)
- Check browser audio isn't muted
- Check system volume is up
- Try toggling voice off and on again

## Advanced

### Cache Management

- Model cached in IndexedDB (persistent)
- Survives page refreshes and browser restarts
- Only cleared manually or by browser cleanup

### Conversation History

- Last 4 messages kept for context
- Older messages pruned to save memory
- No persistent chat history (resets on page reload)

### Resource Usage

- Model active only when chat window open
- GPU released when chat closed
- Minimal background resource use

## Support

For issues or questions:

1. Check browser console (F12) for error messages
2. Verify WebGPU support
3. Review troubleshooting section above
4. Contact via portfolio contact form

---

**Enjoy chatting with AK!** 🤖✨
