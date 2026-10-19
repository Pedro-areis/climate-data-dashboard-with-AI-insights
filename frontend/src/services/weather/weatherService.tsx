import { api } from "../api";
import type { WeatherPage } from "../../types";

export async function getAllWeather(limit = 48): Promise<WeatherPage> {
  const response = await api.get("/weather/all", { params: { limit } });
  return response.data;
}

export async function getInsightWeather(
  id: string,
  refresh = false,
): Promise<string> {
  const response = await api.get(`/weather/insights/${id}`, {
    params: refresh ? { refresh: true } : undefined,
    transformResponse: (data) => data,
  });
  return response.data;
}
