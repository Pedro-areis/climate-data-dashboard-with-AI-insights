const dateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const fullDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const timeOnly = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatFullDateTime = (iso: string) =>
  fullDateTime.format(new Date(iso));
export const formatTime = (iso: string) => timeOnly.format(new Date(iso));

export function conditionEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("trovo")) return "⛈️";
  if (c.includes("chuva") || c.includes("garoa") || c.includes("aguaceiro"))
    return "🌧️";
  if (c.includes("nevoeiro")) return "🌫️";
  if (c.includes("encoberto")) return "☁️";
  if (c.includes("nublado")) return "⛅";
  if (c.includes("limpo")) return "☀️";
  return "🌡️";
}

export function errorMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message ?? fallback;
}
