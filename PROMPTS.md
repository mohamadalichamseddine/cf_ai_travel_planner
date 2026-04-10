# AI Prompts Used During Development

This document highlights the most impactful interactions with Claude Code CLI (Anthropic's AI coding assistant) during development. AI was used for research, debugging, and implementation guidance when I hit obstacles.

---

### 1. MCP schema conversion - the biggest blocker

**Problem:** Apify MCP tools weren't appearing. `getAITools()` returned an empty array with no errors.

> Prompt: "The MCP tools from Apify actors aren't showing up. getAITools() returns an empty array but no errors. What's happening?"

**What I learned:** The Agents SDK silently skips tools when it can't convert complex input schemas (`string[]`, `unknown`, nested types) from MCP to Zod. No warning, no error; the tool just doesn't exist.

**Outcome:** Abandoned MCP for flight/hotel data and built custom tools that call the Apify REST API directly. This turned out to be more reliable and gave me full control over the request/response handling.

---

### 2. Llama 3.3 isn't supporting structured tool calling

**Problem:** Tried switching to Llama 3.3, but it broke all tool usage.

> Prompt: "Switched to Llama 3.3 but it outputs raw JSON instead of calling tools. Why?"

**What I learned:** `@cf/meta/llama-3.3-70b-instruct-fp8-fast` understands tool definitions and correctly identifies which tool to call, but outputs the call as plain text JSON instead of using the structured `tool_use` protocol the Vercel AI SDK expects. The SDK never intercepts it, so the tool never executes.

**Outcome:** Kept `@cf/moonshotai/kimi-k2.5` which properly supports structured tool calling. Documented potential fixes in `docs/limitations.md`.

---

### 3. Weather service failure and provider abstraction

**Problem:** Initially used `wttr.in` stopped responding during development.

> Prompt: "wttr.in is returning null for all cities. What are free alternatives with no API key?"

**What I learned:** Open-Meteo is a solid free alternative. Hit a follow-up issue where geocoding "Paris" returned Paris, Texas; solved by using the API's `countryCode` parameter.

**Outcome:** Built a `WeatherServiceProvider` interface so the weather source can be swapped with a single class change. Current implementation uses Open-Meteo with country code disambiguation.

---


### 4. System prompt causing redundant LLM behavior

**Problem:** The LLM would ask "what dates would you like?" in the same response where it was already answering with search results.

> Prompt: "The LLM is asking redundant questions while simultaneously providing answers"

**What I learned:** In my system prompt, I had "always confirm requirements before searching". The LLM was following instructions literally, confirming and searching at the same time.

**Outcome:** Changed to "if the user provides enough info, search immediately, do not ask for confirmation first."

---

### 5. Auto-scroll UX

**Problem:** Chat auto-scrolled to bottom on every new message, even while reading earlier messages.

> Prompt: "When new messages come in, it jumps to the bottom. How do I only auto-scroll when the user is already at the bottom?"

**Outcome:** Proximity-based auto-scroll. Only triggers when user is within 150px of the bottom.

---

### 6. Tool output cluttering the chat

**Problem:** Raw tool call results (large JSON from flight/hotel APIs) were displayed inline in the chat, making it hard to read the LLM's actual response.

> Prompt: "Tool results are showing as big JSON blocks in the chat. Lets make them collapsible."

**Outcome:** Wrapped tool output in HTML `<details>` elements with a summary badge showing the tool name and a success icon. Results are collapsed by default, users can expand them if they want to inspect the raw data.

---

### 7. Quick prompts with hardcoded dates

**Problem:** The suggestion chips below the input had hardcoded dates like "April 25-30" that would become outdated.

> Prompt: "Quick / suggested prompts have hardcoded dates that will become outdated. Add a function to calculate next Friday date."

**Outcome:** Built a `getQuickPrompts()` function that calculates the next Friday and adds 5 days for the return date, so the example prompts always show realistic upcoming dates.

---

### 8. Session isolation across browsers

**Problem:** Needed each user (browser) to have their own independent chat history and trip state.

> Prompt: "How does useAgent's 'name' parameter work for session isolation? Does each browser get its own Durable Object?"

**What I learned:** The `name` parameter maps directly to a unique Durable Object instance. Different names = different DO instances = fully isolated state.

**Outcome:** We generate a UUID on first visit, store it in `localStorage`, and pass it as the agent `name`. Each browser gets its own chat history and trip data.

---

### 9. Landing page welcome message (UI)

**Problem:** The empty chat state just showed "Start a conversation" with quick prompt buttons — no context about what the agent can do.

> Prompt: "The LLM's first response includes a full welcome message with capabilities. How about we add something like that on the landing page, in addition to the default options?"

**Outcome:** Replaced the bare empty state with a welcome screen showing feature cards (Flights, Hotels, Weather, Budget) and a short description, with quick prompt buttons below.

---

*Last edited: 04-10-2026*
