import { tool } from "ai";
import { z } from "zod";

/**
 * Hotel search tool using Apify's booking-scraper actor.
 * Queries Booking.com via Apify REST API.
 */
export function createHotelTool(env: Env) {
  return {
    search_hotels_tool: tool({
      description:
        "Search for hotels in a destination. Returns hotel names, prices, ratings, and availability from Booking.com.",
      inputSchema: z.object({
        search: z
          .string()
          .describe("Destination city or area (e.g. 'New York', 'Paris')"),
        maxItems: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum number of results to return (default 10)"),
        sortBy: z
          .enum([
            "distance_from_search",
            "bayesian_review_score",
            "price",
            "class",
            "class_and_price"
          ])
          .optional()
          .describe("Sort order for results (default distance_from_search)"),
        starsCountFilter: z
          .string()
          .optional()
          .describe("Star rating filter (e.g. '3', '4', '5', or 'any')"),
        currency: z
          .string()
          .optional()
          .describe("Currency code for prices (default USD)"),
        language: z
          .string()
          .optional()
          .describe("Language code (default en-gb)"),
        minMaxPrice: z
          .string()
          .optional()
          .describe("Price range filter (e.g. '0-200', '100-500')")
      }),
      execute: async (input) => {
        const token = env.APIFY_TOKEN;
        if (!token) {
          return { error: "APIFY_TOKEN not configured. Cannot search hotels." };
        }

        try {
          const response = await fetch(
            `https://api.apify.com/v2/acts/voyager~booking-scraper/run-sync-get-dataset-items?token=${token}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input)
            }
          );

          if (!response.ok) {
            const text = await response.text();
            return {
              error: `Hotel search failed (${response.status}): ${text}`
            };
          }

          return await response.json();
        } catch (e) {
          return {
            error: `Hotel search failed: ${e instanceof Error ? e.message : String(e)}`
          };
        }
      }
    })
  };
}
