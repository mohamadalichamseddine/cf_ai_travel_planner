import { tool } from "ai";
import { z } from "zod";

export const dateTool = {
  get_current_date: tool({
    description:
      "Get today's date. Use this to calculate relative dates when the user says things like 'next month' or 'in 2 weeks'.",
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();
      return {
        date: now.toISOString().split("T")[0],
        dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
        iso: now.toISOString()
      };
    }
  })
};
