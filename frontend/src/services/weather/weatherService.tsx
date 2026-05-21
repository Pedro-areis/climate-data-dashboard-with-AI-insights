import { api } from "../api";

export async function getAllWeather() {
  const response = await api.get("/weather/all");
  return response.data;
}

export async function getInsightWeather(id: string) {
  const response = await api.get(`/weather/insights/${id}`);
  return response.data;
}
