import { tool } from "ai";
import { z } from "zod";
import type { TravelState, SavedItinerary } from "../types/state";

/**
 * Creates itinerary tools that can read/write agent state.
 * Called from the agent with bound state accessors.
 */
export function createItineraryTools(
  getState: () => TravelState,
  setState: (state: TravelState) => void
) {
  return {
    save_itinerary: tool({
      description:
        "Save the current trip plan so the user can retrieve it later. Only call this when the user explicitly asks to save.",
      inputSchema: z.object({
        name: z
          .string()
          .describe("A short name for this trip, e.g. 'SF April Trip'")
      }),
      execute: async ({ name }) => {
        const state = getState();
        if (!state.currentTrip) {
          return {
            error:
              "No trip is currently being planned. Help the user plan a trip first."
          };
        }
        const itinerary: SavedItinerary = {
          id: crypto.randomUUID(),
          name,
          trip: state.currentTrip,
          savedAt: Date.now()
        };
        setState({
          ...state,
          savedItineraries: [...state.savedItineraries, itinerary]
        });
        return {
          success: true,
          id: itinerary.id,
          name,
          message: `Itinerary "${name}" saved successfully.`
        };
      }
    }),

    load_itineraries: tool({
      description:
        "Load all previously saved trip itineraries for the user.",
      inputSchema: z.object({}),
      execute: async () => {
        const state = getState();
        const itineraries = state.savedItineraries;
        if (itineraries.length === 0) {
          return { message: "No saved itineraries found.", itineraries: [] };
        }
        return {
          count: itineraries.length,
          itineraries: itineraries.map((it) => ({
            id: it.id,
            name: it.name,
            destination: it.trip.destination,
            dates: `${it.trip.startDate} to ${it.trip.endDate}`,
            budget: `${it.trip.budget} ${it.trip.currency}`,
            savedAt: new Date(it.savedAt).toISOString()
          }))
        };
      }
    })
  };
}
