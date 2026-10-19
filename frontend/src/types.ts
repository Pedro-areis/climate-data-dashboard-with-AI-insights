export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Weather {
  id: string;
  localization: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  conditionSky: string;
  probabilityRain: number;
  insightsAI: string | null;
  measuredAt: string;
  createdAt: string;
}

export interface WeatherPage {
  items: Weather[];
  total: number;
  page: number;
  limit: number;
}

export const GUEST_EMAIL = "visitante@gmail.com";
