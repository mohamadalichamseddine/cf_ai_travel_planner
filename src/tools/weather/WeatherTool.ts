import { tool } from "ai";
import { z } from "zod";
import type { WeatherServiceProvider } from "./WeatherServiceProvider";

/**
 * Creates the get_weather tool backed by the given provider.
 * Swap the provider to change the weather data source.
 */
export function createWeatherTool(provider: WeatherServiceProvider) {
  return {
    get_weather_tool: tool({
      description:
        "Get the current weather and 5-day forecast for a city. Use this to help users know what to expect and pack for their trip.",
      inputSchema: z.object({
        city: z.string().describe("City name (e.g. 'San Francisco', 'Tokyo')"),
        country_code: z
          .string()
          .optional()
          .describe("ISO 3166-1 alpha-2 country code (e.g. US, GB, JP) to disambiguate city names")
      }),
      execute: ({ city, country_code }) => provider.getWeather(city, country_code)
    })
  };
}
