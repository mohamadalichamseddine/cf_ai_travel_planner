import { tool } from "ai";
import { z } from "zod";

export const budgetTool = {
  calculate_budget_tool: tool({
    description:
      "Calculate remaining budget after flights and hotels. Call this after getting flight and hotel prices to show the user how much budget remains for activities and food.",
    inputSchema: z.object({
      totalBudget: z.number().describe("User's total trip budget"),
      flightCost: z.number().describe("Total flight cost (round trip)"),
      hotelCost: z.number().describe("Total hotel cost for entire stay"),
      currency: z.string().describe("Currency code (USD, EUR, etc.)")
    }),
    execute: async ({ totalBudget, flightCost, hotelCost, currency }) => {
      const totalSpent = flightCost + hotelCost;
      const remaining = totalBudget - totalSpent;
      return {
        totalBudget,
        flightCost,
        hotelCost,
        totalSpent,
        remaining,
        currency,
        percentUsed: Math.round((totalSpent / totalBudget) * 100),
        budgetStatus:
          remaining < 0
            ? "over_budget"
            : remaining < totalBudget * 0.1
              ? "tight"
              : "healthy"
      };
    }
  })
};
