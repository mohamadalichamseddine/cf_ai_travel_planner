export interface WeatherResult {
  city: string;
  country: string;
  current: {
    tempC: number;
    tempF: number;
    condition: string;
    humidity: string;
    windKmph: number;
  };
  forecast: Array<{
    date: string;
    highC: number;
    lowC: number;
    highF: number;
    lowF: number;
    condition: string;
  }>;
}

export interface WeatherServiceProvider {
  getWeather(city: string, countryCode?: string): Promise<WeatherResult | { error: string }>;
}
