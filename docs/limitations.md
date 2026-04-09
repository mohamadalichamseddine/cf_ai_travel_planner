# Known Limitations

## Llama 3.3 on Workers AI does not support structured tool calling

We tested using `@cf/meta/llama-3.3-70b-instruct-fp8-fast` but it does not support the native tool calling protocol that the Vercel AI SDK (`streamText`) expects.

**What happens:** When tools are passed to the model, Llama 3.3 understands the tool definitions and correctly identifies which tool to call with which parameters. However, instead of returning a structured `tool_use` response that the SDK can intercept and execute, it outputs the tool call as raw JSON text in the chat message. The SDK never sees a tool call, so the tool is never executed.

**Workaround:** We use `@cf/moonshotai/kimi-k2.5` instead, which properly supports structured tool calling on Workers AI. It is still a Cloudflare-native model running on Workers AI — no external API keys required.

**Future fix:** One approach is to intercept the model's text output, parse the JSON tool call, execute the tool manually, and feed the result back to the model — essentially implementing a custom tool calling layer on top of the raw text output. Another option is to use the Workers AI REST API directly (instead of through the Vercel AI SDK) with Llama 3.3's chat template tool calling format, which may differ from what the SDK expects.

## MCP tool schema conversion fails for complex Apify actors

The Cloudflare Agents SDK `getAITools()` method converts MCP tool schemas to Zod for the Vercel AI SDK. For Apify actors with complex input schemas (containing `string[]`, `unknown`, or deeply nested types), the conversion silently skips the tool — no error, the tool just doesn't appear.

**Workaround:** We call the Apify REST API directly from custom tool implementations in `src/tools/flights.ts` and `src/tools/hotels.ts`, bypassing MCP entirely.

**Reference:** The decommissioned MCP connection setup is preserved in `src/mcp/connections.ts` with comments explaining the issue.

## Apify scraper response times

Flight and hotel searches use Apify's synchronous `run-sync-get-dataset-items` endpoint, which runs a full scraper actor and waits for completion. Response times are typically 30-120 seconds depending on the actor and search complexity. The hotel search has a 120-second abort timeout.

## No authentication

Sessions are identified by a UUID stored in `localStorage`. There is no user authentication — clearing browser data loses the session. Cross-device access is not supported.

## Single trip planning

The agent supports planning one trip at a time. Users can start a new trip (which clears the chat and current trip state), but there is no feature to save completed trips for later retrieval. Adding a saved trips list with a `save_trip` / `load_trips` tool pair is a natural next step.

---

*Last edited: 04-09-2026*
