import { tool } from "ai";
import { z } from "zod";
import type { TravelState, TripPlan } from "../types/state";

/**
 * Creates the set_current_trip tool that stores assembled trip data in state.
 * The LLM calls this after gathering flight/hotel/weather data.
 */
export function createTripTool(
  getState: () => TravelState,
  setState: (state: TravelState) => void
) {
  return {
    set_current_trip_tool: tool({
      description:
        "Store the assembled trip plan after gathering flight, hotel, and activity data. Call this to persist the trip so it survives page refreshes.",
      inputSchema: z.object({
        origin: z.string().describe("Origin city or airport code"),
        destination: z.string().describe("Destination city or airport code"),
        startDate: z.string().describe("Trip start date (YYYY-MM-DD)"),
        endDate: z.string().describe("Trip end date (YYYY-MM-DD)"),
        budget: z.number().describe("Total trip budget"),
        currency: z.string().describe("Currency code (e.g. USD)"),
        flights: z
          .array(
            z.object({
              airline: z.string(),
              flightNumber: z.string(),
              departure: z.string(),
              arrival: z.string(),
              duration: z.string(),
              stops: z.number(),
              price: z.number(),
              currency: z.string(),
              bookingUrl: z.string().optional()
            })
          )
          .describe("Selected flight options"),
        hotels: z
          .array(
            z.object({
              name: z.string(),
              rating: z.number(),
              pricePerNight: z.number(),
              totalPrice: z.number(),
              currency: z.string(),
              amenities: z.array(z.string()),
              address: z.string(),
              bookingUrl: z.string().optional()
            })
          )
          .describe("Selected hotel options"),
        activities: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              estimatedCost: z.number(),
              duration: z.string(),
              category: z.string()
            })
          )
          .optional()
          .describe("Planned activities"),
        totalEstimatedCost: z
          .number()
          .describe("Total estimated cost of the trip")
      }),
      execute: async (input) => {
        const trip: TripPlan = {
          id: crypto.randomUUID(),
          origin: input.origin,
          destination: input.destination,
          startDate: input.startDate,
          endDate: input.endDate,
          budget: input.budget,
          currency: input.currency,
          flights: input.flights,
          hotels: input.hotels,
          activities: input.activities ?? [],
          weather: [],
          totalEstimatedCost: input.totalEstimatedCost,
          createdAt: Date.now()
        };

        setState({ ...getState(), currentTrip: trip });

        return {
          success: true,
          tripId: trip.id,
          message: `Trip to ${trip.destination} (${trip.startDate} to ${trip.endDate}) saved.`
        };
      }
    })
  };
}
