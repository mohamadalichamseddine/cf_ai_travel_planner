import { routeAgentRequest } from "agents";

// Re-export the agent class so the runtime can find it
export { ChatAgent } from "./agent";

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
