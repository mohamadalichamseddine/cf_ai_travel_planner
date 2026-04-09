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
        "Search for hotels in a destination. Returns hotel names, prices, ratings, and availability from Booking.com. Provide check-in and check-out dates when available for accurate pricing. Without dates, sorting by price is not supported.",
      inputSchema: z.object({
        search: z.string().describe("Destination city or area (e.g. 'New York', 'Paris')"),
        checkIn: z.string().optional().describe("Check-in date in YYYY-MM-DD format (UTC)"),
        checkOut: z.string().optional().describe("Check-out date in YYYY-MM-DD format (UTC)"),
        maxItems: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .describe("Maximum number of hotel results to return (default 5)"),
        sortBy: z
          .enum([
            "bayesian_review_score",
            "distance_from_search",
            "price",
            "class_asc",
            "review_score_and_price",
            "class_and_price"
          ])
          .optional()
          .describe(
            "Sort order. 'price' only works when check-in/check-out dates are provided (default bayesian_review_score)"
          ),
        starsCountFilter: z
          .enum(["any", "1", "2", "3", "4", "5", "unrated"])
          .optional()
          .describe("Star rating filter (default any)"),
        currency: z.string().optional().describe("Currency code for prices (default USD)"),
        language: z.string().optional().describe("Language code (default en-gb)"),
        rooms: z.number().int().min(1).max(50).optional().describe("Number of rooms (default 1)"),
        adults: z.number().int().min(1).max(50).optional().describe("Number of adults (default 2)"),
        children: z.number().int().min(0).max(50).optional().describe("Number of children (default 0)"),
        minMaxPrice: z.string().optional().describe("Price range per night (e.g. '0-200', '100+')")
      }),
      execute: async (input) => {
        const token = env.APIFY_TOKEN;
        if (!token) {
          return { error: "APIFY_TOKEN not configured. Cannot search hotels." };
        }

        // If no dates, don't allow price-based sorting
        const hasDates = input.checkIn && input.checkOut;
        let sortBy = input.sortBy ?? "bayesian_review_score";
        if (!hasDates && (sortBy === "price" || sortBy === "review_score_and_price" || sortBy === "class_and_price")) {
          sortBy = "bayesian_review_score";
        }

        const payload = {
          ...input,
          maxItems: input.maxItems ?? 5,
          sortBy
        };

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 120_000);

          const response = await fetch(
            `https://api.apify.com/v2/acts/voyager~booking-scraper/run-sync-get-dataset-items?token=${token}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              signal: controller.signal
            }
          );

          clearTimeout(timeout);

          if (!response.ok) {
            const text = await response.text();
            return {
              error: `Hotel search failed (${response.status}): ${text}`
            };
          }

          return await response.json();
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") {
            return {
              error: "Hotel search timed out. Try a more specific search or fewer results."
            };
          }
          return {
            error: `Hotel search failed: ${e instanceof Error ? e.message : String(e)}`
          };
        }
      }
    })
  };
}
