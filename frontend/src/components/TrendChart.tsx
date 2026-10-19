import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface Series {
  key: string;
  label: string;
  color: string;
  unit: string;
}

interface TrendChartProps {
  data: Record<string, string | number>[];
  series: Series[];
  domain?: [number | "auto", number | "auto"];
}

const axisStyle = { fill: "#8fa0c4", fontSize: 12 };

export default function TrendChart({ data, series, domain }: TrendChartProps) {
  const units = Object.fromEntries(series.map((s) => [s.label, s.unit]));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#223052" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="time"
            tick={axisStyle}
            tickLine={false}
            axisLine={{ stroke: "#223052" }}
            minTickGap={32}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            domain={domain ?? ["auto", "auto"]}
            width={52}
            tickFormatter={(v: number) => String(Math.round(v * 10) / 10)}
          />
          <Tooltip
            contentStyle={{
              background: "#17223b",
              border: "1px solid #223052",
              borderRadius: 12,
              color: "#e8eefc",
            }}
            labelStyle={{ color: "#8fa0c4" }}
            formatter={(value, name) => [
              `${value}${units[String(name)] ?? ""}`,
              name,
            ]}
          />
          {series.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 12, color: "#8fa0c4" }} />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              dot={data.length < 30}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
