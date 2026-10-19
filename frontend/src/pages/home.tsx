import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "../components/AppLayout";
import TrendChart from "../components/TrendChart";
import { Button, Card, Notice, Spinner } from "../components/ui";
import {
  conditionEmoji,
  errorMessage,
  formatDateTime,
  formatFullDateTime,
  formatTime,
} from "../lib/format";
import { downloadCSV } from "../services/export/exportService";
import {
  getAllWeather,
  getInsightWeather,
} from "../services/weather/weatherService";
import type { Weather } from "../types";

const REFRESH_MS = 5 * 60 * 1000;

function Delta({ value, unit }: { value: number | null; unit: string }) {
  if (value === null || value === 0) {
    return <span className="text-xs text-muted">sem variação</span>;
  }
  const up = value > 0;
  return (
    <span className="text-xs text-muted">
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>{" "}
      {up ? "+" : ""}
      {value.toFixed(1)}
      {unit} vs. coleta anterior
    </span>
  );
}

function Kpi({
  label,
  value,
  unit,
  color,
  delta,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  delta: number | null;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-bold tabular-nums" style={{ color }}>
        {value}
        <span className="ml-1 text-lg font-medium">{unit}</span>
      </p>
      <Delta value={delta} unit={unit} />
    </Card>
  );
}

function HomePage() {
  const { user } = useOutletContext<LayoutContext>();

  const [items, setItems] = useState<Weather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const latest = items[0];
  const previous = items[1];

  const loadWeather = useCallback(async () => {
    try {
      const page = await getAllWeather(48);
      setItems(page.items);
      setError("");
    } catch (err) {
      setError(errorMessage(err, "Não foi possível carregar os dados."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInsight = useCallback(async (id: string, refresh = false) => {
    setInsightLoading(true);
    try {
      setInsight(await getInsightWeather(id, refresh));
    } catch {
      setInsight("Não foi possível gerar o insight agora.");
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    const intervalId = setInterval(loadWeather, REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [loadWeather]);

  // O insight é buscado uma vez por registro mais recente (a API guarda o texto do LLM).
  const latestId = latest?.id;
  useEffect(() => {
    if (latestId) loadInsight(latestId);
  }, [latestId, loadInsight]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadCSV();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível exportar o CSV."));
    } finally {
      setExporting(false);
    }
  };

  const chartData = useMemo(
    () =>
      [...items].reverse().map((w) => ({
        time: formatDateTime(w.measuredAt),
        temp: w.temp,
        humidity: w.humidity,
        rain: w.probabilityRain,
        wind: w.windSpeed,
      })),
    [items],
  );

  const diff = (pick: (w: Weather) => number) =>
    latest && previous ? pick(latest) - pick(previous) : null;

  if (loading) {
    return <Spinner label="Carregando dados climáticos…" />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Olá, {user.name}</h1>
          <p className="text-sm text-muted">
            {latest
              ? `Última coleta em ${formatFullDateTime(latest.measuredAt)} · ${latest.localization}`
              : "Aguardando a primeira coleta"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={loadWeather}>
            Atualizar
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exportando…" : "Exportar CSV"}
          </Button>
        </div>
      </header>

      {error && <Notice kind="error">{error}</Notice>}

      {!latest ? (
        <Card>
          <p className="text-muted">
            Ainda não há dados. O collector publica uma coleta ao iniciar e
            depois a cada hora — atualize em instantes.
          </p>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="flex items-center gap-5 bg-gradient-to-br from-surface to-surface-2 lg:col-span-1">
              <span className="text-7xl" aria-hidden="true">
                {conditionEmoji(latest.conditionSky)}
              </span>
              <div>
                <p className="text-5xl font-bold tabular-nums">
                  {latest.temp}
                  <span className="text-2xl text-muted">°C</span>
                </p>
                <p className="mt-1 text-lg">{latest.conditionSky}</p>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-semibold">
                  <span aria-hidden="true">✨ </span>Insight da IA
                </h2>
                <Button
                  variant="ghost"
                  className="!px-3 !py-1.5"
                  disabled={insightLoading}
                  onClick={() => loadInsight(latest.id, true)}
                >
                  Gerar outro
                </Button>
              </div>
              {insightLoading ? (
                <Spinner label="Gerando insight…" />
              ) : (
                <p className="text-lg leading-relaxed">{insight}</p>
              )}
            </Card>
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi
              label="Temperatura"
              value={latest.temp}
              unit="°C"
              color="var(--color-temp)"
              delta={diff((w) => w.temp)}
            />
            <Kpi
              label="Umidade"
              value={latest.humidity}
              unit="%"
              color="var(--color-humidity)"
              delta={diff((w) => w.humidity)}
            />
            <Kpi
              label="Vento"
              value={latest.windSpeed}
              unit=" km/h"
              color="var(--color-wind)"
              delta={diff((w) => w.windSpeed)}
            />
            <Kpi
              label="Chance de chuva"
              value={latest.probabilityRain}
              unit="%"
              color="var(--color-rain)"
              delta={diff((w) => w.probabilityRain)}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-semibold">Temperatura (°C)</h2>
              <TrendChart
                data={chartData}
                series={[
                  {
                    key: "temp",
                    label: "Temperatura",
                    color: "#fb923c",
                    unit: " °C",
                  },
                ]}
              />
            </Card>
            <Card>
              <h2 className="mb-3 font-semibold">Umidade e chance de chuva (%)</h2>
              <TrendChart
                data={chartData}
                domain={[0, 100]}
                series={[
                  {
                    key: "humidity",
                    label: "Umidade",
                    color: "#38bdf8",
                    unit: "%",
                  },
                  {
                    key: "rain",
                    label: "Chance de chuva",
                    color: "#818cf8",
                    unit: "%",
                  },
                ]}
              />
            </Card>
          </section>

          <Card>
            <h2 className="mb-3 font-semibold">Últimas coletas</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-muted">
                  <tr className="border-b border-line">
                    <th className="py-2 pr-4 font-medium">Horário</th>
                    <th className="py-2 pr-4 font-medium">Condição</th>
                    <th className="py-2 pr-4 font-medium">Temp.</th>
                    <th className="py-2 pr-4 font-medium">Umidade</th>
                    <th className="py-2 pr-4 font-medium">Vento</th>
                    <th className="py-2 font-medium">Chuva</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {items.slice(0, 10).map((w) => (
                    <tr key={w.id} className="border-b border-line/50 last:border-0">
                      <td className="py-2 pr-4">{formatTime(w.measuredAt)}{" "}
                        <span className="text-muted">
                          {new Date(w.measuredAt).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {conditionEmoji(w.conditionSky)} {w.conditionSky}
                      </td>
                      <td className="py-2 pr-4">{w.temp} °C</td>
                      <td className="py-2 pr-4">{w.humidity}%</td>
                      <td className="py-2 pr-4">{w.windSpeed} km/h</td>
                      <td className="py-2">{w.probabilityRain}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default HomePage;
