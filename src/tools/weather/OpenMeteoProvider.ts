import type { WeatherServiceProvider, WeatherResult } from "./WeatherServiceProvider";

/**
 * Weather provider using Open-Meteo (free, no API key required).
 * Geocodes the city name via Open-Meteo's geocoding API, then fetches
 * current conditions and a 5-day forecast.
 */
export class OpenMeteoProvider implements WeatherServiceProvider {
  async getWeather(city: string, countryCode?: string): Promise<WeatherResult | { error: string }> {
    try {
      let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      if (countryCode) geoUrl += `&countryCode=${encodeURIComponent(countryCode)}`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        return { error: `Could not geocode city: ${city}` };
      }
      const geoData = (await geoRes.json()) as GeoResponse;
      if (!geoData.results?.length) {
        return { error: `City not found: ${city}` };
      }
      const { latitude, longitude, timezone, name, country: countryName } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
          `&timezone=${encodeURIComponent(timezone)}` +
          `&forecast_days=5&temperature_unit=celsius`
      );
      if (!weatherRes.ok) {
        return { error: `Weather data unavailable for ${city}` };
      }
      const weather = (await weatherRes.json()) as WeatherResponse;

      const current = weather.current;
      const daily = weather.daily;

      return {
        city: name,
        country: countryName,
        current: {
          tempC: current.temperature_2m,
          tempF: Math.round((current.temperature_2m * 9) / 5 + 32),
          condition: wmoDescription(current.weather_code),
          humidity: `${current.relative_humidity_2m}%`,
          windKmph: current.wind_speed_10m
        },
        forecast: daily.time.map((date, i) => ({
          date,
          highC: daily.temperature_2m_max[i],
          lowC: daily.temperature_2m_min[i],
          highF: Math.round((daily.temperature_2m_max[i] * 9) / 5 + 32),
          lowF: Math.round((daily.temperature_2m_min[i] * 9) / 5 + 32),
          condition: wmoDescription(daily.weather_code[i])
        }))
      };
    } catch (e) {
      return {
        error: `Failed to fetch weather for ${city}: ${e instanceof Error ? e.message : String(e)}`
      };
    }
  }
}

function wmoDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 84) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

interface GeoResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
    country: string;
  }>;
}

interface WeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}
