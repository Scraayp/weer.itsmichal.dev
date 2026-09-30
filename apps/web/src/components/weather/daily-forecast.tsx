import {
  GARMENTS,
  formatTemperature,
  getWeatherCondition,
  temperatureColor,
  type Garment,
} from "@/lib/weather";

export type DayPoint = {
  date: string;
  code: number;
  max: number;
  min: number;
  rainChance: number;
  garment: Garment;
};

const weekdayFormatter = new Intl.DateTimeFormat("nl-NL", { weekday: "long" });

export function DailyForecast({
  days,
  currentTemperature,
}: {
  days: DayPoint[];
  currentTemperature: number;
}) {
  const weekMin = Math.min(...days.map((day) => day.min));
  const weekMax = Math.max(...days.map((day) => day.max));
  const span = Math.max(weekMax - weekMin, 1);
  const position = (value: number) => ((value - weekMin) / span) * 100;

  return (
    <ol className="flex flex-col">
      {days.map((day, index) => {
        const condition = getWeatherCondition(day.code);
        const Icon = condition.icon;
        const garment = GARMENTS[day.garment];
        const name =
          index === 0
            ? "Vandaag"
            : index === 1
              ? "Morgen"
              : weekdayFormatter.format(new Date(`${day.date}T12:00:00`));

        return (
          <li
            key={day.date}
            className="grid grid-cols-[minmax(4.75rem,7rem)_1.25rem_2.25rem_2rem_minmax(3rem,1fr)_2rem] items-center gap-x-2 border-b border-border/70 py-3.5 last:border-b-0 sm:grid-cols-[9rem_1.5rem_8rem_3rem_2.5rem_1fr_2.5rem] sm:gap-x-4"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[0.9375rem] font-medium capitalize sm:text-base">
                {name}
              </span>
              <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                <span
                  className="swatch size-2.5"
                  style={{ "--c": garment.color } as React.CSSProperties}
                  aria-hidden="true"
                />
                {garment.label}
              </span>
            </div>
            <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
            <span className="hidden truncate text-sm text-muted-foreground sm:block">
              {condition.label}
            </span>
            <span
              className={
                day.rainChance >= 30
                  ? "text-right text-xs font-medium text-[#3269C9] tabular-nums dark:text-[#8DB2F5]"
                  : "text-right text-xs text-muted-foreground tabular-nums"
              }
            >
              <span className="sr-only">Kans op regen </span>
              {day.rainChance}%
            </span>
            <span className="text-right text-muted-foreground tabular-nums">
              <span className="sr-only">Minimaal </span>
              {formatTemperature(day.min)}
            </span>
            <div className="relative h-1.5 rounded-full bg-foreground/8" aria-hidden="true">
              <div
                className="range-fill absolute inset-y-0 rounded-full"
                style={{
                  left: `${position(day.min)}%`,
                  width: `${Math.max(position(day.max) - position(day.min), 3)}%`,
                  background: `linear-gradient(90deg, ${temperatureColor(day.min)}, ${temperatureColor(day.max)})`,
                }}
              />
              {index === 0 && (
                <div
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground"
                  style={{
                    left: `${Math.min(100, Math.max(0, position(currentTemperature)))}%`,
                  }}
                />
              )}
            </div>
            <span className="font-semibold tabular-nums">
              <span className="sr-only">Maximaal </span>
              {formatTemperature(day.max)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
