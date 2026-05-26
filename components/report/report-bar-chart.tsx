import type { PvComparisonResult } from "@/lib/pv-calculation";

const LONGI_COLOR = "#E40011";
const COMP_COLOR = "#cbd5e1";

interface ReportBarChartProps {
  data: PvComparisonResult["chartData"];
  dataKey: "yield" | "cost" | "payback";
  formatValue: (v: number) => string;
  width?: number;
  height?: number;
}

export function ReportBarChart({
  data,
  dataKey,
  formatValue,
  width = 230,
  height = 100,
}: ReportBarChartProps) {
  const values = data.map((d) => d[dataKey] as number);
  const max = Math.max(...values, 1);
  const barH = 22;
  const gap = 12;
  const maxLabelLen = Math.max(...data.map((d) => d.name.length), 8);
  const labelW = Math.min(88, Math.max(56, maxLabelLen * 6.5));
  const valueReserve = 76;
  const chartW = Math.max(40, width - labelW - valueReserve - 8);
  const totalH = data.length * (barH + gap) - gap;

  return (
    <svg
      width={width}
      height={Math.max(height, totalH + 4)}
      viewBox={`0 0 ${width} ${totalH + 4}`}
      role="img"
      aria-hidden
    >
      {data.map((row, i) => {
        const v = row[dataKey] as number;
        const barW = (v / max) * chartW;
        const y = i * (barH + gap);
        const fill = i === 0 ? LONGI_COLOR : COMP_COLOR;
        const valueText = formatValue(v);
        return (
          <g key={row.name}>
            <text
              x={0}
              y={y + barH / 2 + 4}
              fontSize={11}
              fill="#475569"
              fontFamily="system-ui, sans-serif"
            >
              {row.name}
            </text>
            <rect
              x={labelW}
              y={y}
              width={Math.max(barW, 4)}
              height={barH}
              rx={8}
              fill={fill}
            />
            <text
              x={width - 4}
              y={y + barH / 2 + 4}
              fontSize={10}
              fill="#64748b"
              fontFamily="system-ui, sans-serif"
              textAnchor="end"
            >
              {valueText}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
