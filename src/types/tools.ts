/** Parameter types for custom tools — mirrors the Zod schemas in src/tools/ */

export interface BudgetParams {
  totalBudget: number;
  flightCost: number;
  hotelCost: number;
  currency: string;
}

export interface WeatherParams {
  city: string;
  country?: string;
}

export interface SaveItineraryParams {
  name: string;
}
