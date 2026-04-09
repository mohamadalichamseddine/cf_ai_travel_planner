export interface TravelState {
  /** Trip currently being planned */
  currentTrip: TripPlan | null;
}

export interface TripPlan {
  id: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  flights: FlightOption[];
  hotels: HotelOption[];
  activities: Activity[];
  weather: WeatherForecast[];
  totalEstimatedCost: number;
  createdAt: number;
}

export interface FlightOption {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  bookingUrl?: string;
}

export interface HotelOption {
  name: string;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  address: string;
  bookingUrl?: string;
}

export interface Activity {
  name: string;
  description: string;
  estimatedCost: number;
  duration: string;
  category: string;
}

export interface WeatherForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  unit: "C" | "F";
}
