import { Sunrise, Sunset } from "lucide-react";

import {
  formatHour,
  formatTemperature,
  getWeatherCondition,
  temperatureColor,
} from "@/lib/weather";

export type HourPoint = {
  time: string;
  temperature: number;
  rainChance: number;
  code: number;
  isDay: boolean;
};

export type SunEvent = { time: string; kind: "rise" | "set" };

const COLUMN = 64;
const CHART_HEIGHT = 112;
const PAD_TOP = 28;
const PAD_BOTTOM = 12;

const weekdayFormatter = new Intl.DateTimeFormat("nl-NL", { weekday: "short" });

// Catmull-Rom spline through the points, expressed as cubic béziers.
function smoothPath(points: Array<[number, number]>) {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M${x} ${y}`;
    const [x0, y0] = points[index - 2] ?? points[index - 1];
    const [x1, y1] = points[index - 1];
    const [x3, y3] = points[index + 1] ?? [x, y];
    const c1x = x1 + (x - x0) / 6;
    const c1y = y1 + (y - y0) / 6;
    const c2x = x - (x3 - x1) / 6;
    const c2y = y - (y3 - y1) / 6;
    return `${path} C${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y}`;
  }, "");
}

function nightRuns(hours: HourPoint[]) {
  const runs: Array<{ start: number; length: number }> = [];
  hours.forEach((hour, index) => {
    if (hour.isDay) return;
    const last = runs[runs.length - 1];
    if (last && last.start + last.length === index) last.length += 1;
    else runs.push({ start: index, length: 1 });
  });
  return runs;
}

export function HourlyForecast({
  hours,
  sunEvents,
}: {
  hours: HourPoint[];
  sunEvents: SunEvent[];
}) {
  const width = hours.length * COLUMN;
  const temperatures = hours.map((hour) => hour.temperature);
  const min = Math.min(...temperatures);
  const max = Math.max(...temperatures);
  const span = Math.max(max - min, 4);
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const points = hours.map((hour, index): [number, number] => [
    index * COLUMN + COLUMN / 2,
    PAD_TOP + (1 - (hour.temperature - min) / span) * plotHeight,
  ]);
  const line = smoothPath(points);
  const area = `${line} L${points[points.length - 1][0]} ${CHART_HEIGHT} L${points[0][0]} ${CHART_HEIGHT} Z`;
  const startTime = new Date(`${hours[0].time}:00`).getTime();

  return (
    <div className="hourly-scroller -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="relative pt-8" style={{ width }}>
        {nightRuns(hours).map(({ start, length }) => (
          <div
            key={start}
            className="absolute top-8 bottom-0 rounded-2xl bg-muted/70"
            style={{ left: start * COLUMN, width: length * COLUMN }}
            aria-hidden="true"
          />
        ))}

        {sunEvents.map(({ time, kind }) => {
          const offset = (new Date(`${time}:00`).getTime() - startTime) / 3_600_000;
          const Icon = kind === "rise" ? Sunrise : Sunset;
          return (
            <div
              key={time}
              className="absolute top-0 flex -translate-x-1/2 items-center gap-1 text-xs whitespace-nowrap text-muted-foreground tabular-nums"
              style={{ left: offset * COLUMN + COLUMN / 2 }}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{kind === "rise" ? "Zonsopgang" : "Zonsondergang"}</span>
              {formatHour(time)}
            </div>
          );
        })}

        <svg
          className="relative block overflow-visible"
          width={width}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="hourly-stroke"
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={PAD_TOP}
              x2={0}
              y2={CHART_HEIGHT - PAD_BOTTOM}
            >
              <stop offset="0" stopColor={temperatureColor(min + span)} />
              <stop offset="1" stopColor={temperatureColor(min)} />
            </linearGradient>
            <linearGradient id="hourly-fill" x1={0} y1={0} x2={0} y2={1}>
              <stop offset="0" stopColor={temperatureColor(max)} stopOpacity={0.32} />
              <stop offset="1" stopColor={temperatureColor(min)} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path className="temp-area" d={area} fill="url(#hourly-fill)" />
          <path
            className="temp-line"
            d={line}
            fill="none"
            stroke="url(#hourly-stroke)"
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
          />
          {points.map(([x, y], index) => (
            <g key={hours[index].time}>
              <circle cx={x} cy={y} r={3.5} fill="var(--background)" />
              <circle cx={x} cy={y} r={2} fill={temperatureColor(hours[index].temperature)} />
              <text
                x={x}
                y={y - 11}
                textAnchor="middle"
                className="fill-foreground text-[13px] font-semibold tabular-nums"
              >
                {formatTemperature(hours[index].temperature)}
              </text>
            </g>
          ))}
        </svg>

        <ol className="relative flex">
          {hours.map((hour, index) => {
            const condition = getWeatherCondition(hour.code, hour.isDay);
            const Icon = condition.icon;
            const clock = formatHour(hour.time);
            const label =
              index === 0
                ? "Nu"
                : clock === "00:00"
                  ? weekdayFormatter.format(new Date(`${hour.time}:00`))
                  : clock;

            return (
              <li
                key={hour.time}
                className="hourly-col flex flex-col items-center gap-2 pt-3 pb-4"
                style={{ width: COLUMN }}
              >
                <Icon className="size-5" strokeWidth={1.6} aria-label={condition.label} />
                <div className="flex h-9 w-2 items-end overflow-hidden rounded-full bg-foreground/8">
                  <div
                    className="w-full rounded-full bg-[#4F86E8]"
                    style={{ height: `${hour.rainChance}%` }}
                  />
                </div>
                <span
                  className={
                    hour.rainChance >= 5
                      ? "text-xs font-medium text-[#3269C9] tabular-nums dark:text-[#8DB2F5]"
                      : "text-xs text-muted-foreground/60 tabular-nums"
                  }
                >
                  <span className="sr-only">Kans op regen </span>
                  {hour.rainChance}%
                </span>
                <span
                  className={
                    index === 0 || clock === "00:00"
                      ? "text-xs font-semibold capitalize"
                      : "text-xs text-muted-foreground tabular-nums"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
