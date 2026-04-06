import { tool } from "ai";
import { z } from "zod";

/**
 * Flight search tool using Apify's flight-price-scraper actor.
 * Queries Google Flights + Kiwi.com via Apify REST API.
 */
export function createFlightTool(env: Env) {
  return {
    search_flights: tool({
      description:
        "Search for flights between two airports. Returns prices, airlines, durations, and stops from Google Flights and Kiwi.com.",
      inputSchema: z.object({
        origin: z
          .string()
          .describe("Origin airport IATA code (e.g. JFK, LHR, LAX)"),
        destination: z
          .string()
          .describe("Destination airport IATA code (e.g. SFO, CDG, NRT)"),
        departDate: z
          .string()
          .describe("Departure date in YYYY-MM-DD format"),
        returnDate: z
          .string()
          .optional()
          .describe(
            "Return date in YYYY-MM-DD format for round trip. Omit for one-way."
          ),
        adults: z
          .number()
          .int()
          .min(1)
          .max(9)
          .optional()
          .describe("Number of adult passengers (default 1)"),
        cabinClass: z
          .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
          .optional()
          .describe("Cabin class (default ECONOMY)"),
        currency: z
          .string()
          .optional()
          .describe("Currency code for prices (default USD)"),
        maxFlights: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Maximum number of results to return (default 50)")
      }),
      execute: async (input) => {
        const token = env.APIFY_TOKEN;
        if (!token) {
          return { error: "APIFY_TOKEN not configured. Cannot search flights." };
        }

        try {
          const response = await fetch(
            `https://api.apify.com/v2/acts/makework36~flight-price-scraper/run-sync-get-dataset-items?token=${token}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input)
            }
          );

          if (!response.ok) {
            const text = await response.text();
            return { error: `Flight search failed (${response.status}): ${text}` };
          }

          return await response.json();
        } catch (e) {
          return {
            error: `Flight search failed: ${e instanceof Error ? e.message : String(e)}`
          };
        }
      }
    })
  };
}
