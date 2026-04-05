import { tool } from "ai";
import { z } from "zod";

/**
 * Weather tool using wttr.in (free, no API key).
 * Can be swapped for OpenWeatherMap later by passing env.OPENWEATHER_API_KEY.
 */
export const weatherTool = {
  get_weather: tool({
    description:
      "Get the current weather and forecast for a city. Use this to help users know what to expect and pack for their trip.",
    inputSchema: z.object({
      city: z.string().describe("City name (e.g. 'San Francisco', 'Tokyo')"),
      country: z
        .string()
        .optional()
        .describe("Country code (e.g. US, GB, JP) to disambiguate city names")
    }),
    execute: async ({ city, country }) => {
      const query = country ? `${city},${country}` : city;
      try {
        const response = await fetch(
          `https://wttr.in/${encodeURIComponent(query)}?format=j1`
        );
        if (!response.ok) {
          return { error: `Weather data unavailable for ${city}` };
        }
        const data = (await response.json()) as WttrResponse;
        const current = data.current_condition?.[0];
        const forecast = data.weather?.slice(0, 5) ?? [];

        return {
          city,
          current: current
            ? {
                tempC: Number(current.temp_C),
                tempF: Number(current.temp_F),
                condition: current.weatherDesc?.[0]?.value ?? "Unknown",
                humidity: `${current.humidity}%`,
                windKmph: Number(current.windspeedKmph)
              }
            : null,
          forecast: forecast.map((day) => ({
            date: day.date,
            highC: Number(day.maxtempC),
            lowC: Number(day.mintempC),
            highF: Number(day.maxtempF),
            lowF: Number(day.mintempF),
            condition:
              day.hourly?.[4]?.weatherDesc?.[0]?.value ?? "Unknown"
          }))
        };
      } catch {
        return { error: `Failed to fetch weather for ${city}` };
      }
    }
  })
};

// Minimal types for the wttr.in JSON response
interface WttrResponse {
  current_condition?: Array<{
    temp_C: string;
    temp_F: string;
    humidity: string;
    windspeedKmph: string;
    weatherDesc?: Array<{ value: string }>;
  }>;
  weather?: Array<{
    date: string;
    maxtempC: string;
    mintempC: string;
    maxtempF: string;
    mintempF: string;
    hourly?: Array<{
      weatherDesc?: Array<{ value: string }>;
    }>;
  }>;
}
