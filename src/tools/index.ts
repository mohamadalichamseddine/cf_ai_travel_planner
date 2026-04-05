import type { TravelState } from "../types/state";
import { dateTool } from "./date";
import { budgetTool } from "./budget";
import { weatherTool } from "./weather";
import { createItineraryTools } from "./itinerary";

/**
 * Creates the full set of custom tools for the travel agent.
 * MCP tools (flights, hotels) are added separately via this.mcp.getAITools().
 */
export function createTravelTools(
  getState: () => TravelState,
  setState: (state: TravelState) => void
) {
  return {
    ...dateTool,
    ...budgetTool,
    ...weatherTool,
    ...createItineraryTools(getState, setState)
  };
}
