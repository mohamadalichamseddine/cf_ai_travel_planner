import type { TravelState } from "../types/state";
import { dateTool } from "./date";
import { budgetTool } from "./budget";
import { weatherTool } from "./weather";
import { createItineraryTools } from "./itinerary";
import { createFlightTool } from "./flights";
import { createHotelTool } from "./hotels";

/**
 * Creates the full set of custom tools for the travel agent.
 * Flights and hotels call Apify actors via REST API.
 */
export function createTravelTools(
  getState: () => TravelState,
  setState: (state: TravelState) => void,
  env: Env
) {
  return {
    ...dateTool,
    ...budgetTool,
    ...weatherTool,
    ...createItineraryTools(getState, setState),
    ...createFlightTool(env),
    ...createHotelTool(env)
  };
}
