/**
 * DECOMMISSIONED — Flights and hotels now use direct Apify REST API calls
 * via custom tools in src/tools/flights.ts and src/tools/hotels.ts.
 *
 * This file is kept for reference. It connected to Apify MCP servers using
 * Streamable HTTP transport with Bearer token auth, but the Agents SDK's
 * getAITools() could not convert the actors' input schemas (string[], unknown)
 * to Zod, so the tools were silently skipped.
 *
 * MCP is still available for user-added servers via addServer/removeServer.
 */

type AddMcpServerFn = (
  name: string,
  url: string,
  options?: {
    transport?: {
      headers?: HeadersInit;
    };
  }
) => Promise<unknown>;

export async function connectMcpServers(
  addMcpServer: AddMcpServerFn,
  env: Env
) {
  const token = env.APIFY_TOKEN;

  if (!token) {
    console.warn(
      "[MCP] APIFY_TOKEN not set — skipping auto-connect for flights/hotels. " +
        "Set it with: wrangler secret put APIFY_TOKEN"
    );
    return;
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  try {
    await addMcpServer(
      "flights",
      "https://mcp.apify.com/?tools=makework36/flight-price-scraper",
      { transport: { headers: authHeaders } }
    );
    console.log("[MCP] Flights server connected");
  } catch (e) {
    console.error("[MCP] Failed to connect flights server:", e);
  }

  try {
    await addMcpServer(
      "hotels",
      "https://mcp.apify.com/?tools=voyager/booking-scraper",
      { transport: { headers: authHeaders } }
    );
    console.log("[MCP] Hotels server connected");
  } catch (e) {
    console.error("[MCP] Failed to connect hotels server:", e);
  }
}
