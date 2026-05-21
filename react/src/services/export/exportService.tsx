import { api } from "../api";

export async function exportCSV() {
  const response = await api.get("/exports", { responseType: "blob" });
  return response.data;
}

export async function downloadCSV() {
  const csvBlob = await exportCSV();

  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "data-weather.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}
