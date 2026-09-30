import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@weer.itsmichal.dev/api/routers/index";
import { Button } from "@weer.itsmichal.dev/ui/components/button";
import { LocateFixed, MapPin, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { DailyForecast, type DayPoint } from "@/components/weather/daily-forecast";
import {
  HourlyForecast,
  type HourPoint,
  type SunEvent,
} from "@/components/weather/hourly-forecast";
import { OutfitFigure } from "@/components/weather/outfit-figure";
import { SkyEffects } from "@/components/weather/sky";
import {
  GARMENTS,
  formatHour,
  formatTemperature,
  getOutfit,
  getOutfitHeadline,
  getSkyKey,
  getWeatherCondition,
  isSnowCode,
  isWetCode,
  keyGarment,
  listGarments,
  temperatureWidth,
  type Outfit,
} from "@/lib/weather";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const fullDateFormatter = new Intl.DateTimeFormat("nl-NL", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const PLACEHOLDER_OUTFIT: Outfit = getOutfit({
  feelsLike: 15,
  rainChance: 0,
  rainingNow: false,
  snowing: false,
  windSpeed: 0,
  uvIndex: 0,
  sunny: false,
});

function getCurrentLocation() {
  return new Promise<{ lat: string; long: string }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Deze browser kan je locatie niet bepalen."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          lat: coords.latitude.toString(),
          long: coords.longitude.toString(),
        });
      },
      (error) => reject(new Error(error.message)),
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 5 * 60_000,
      },
    );
  });
}

/** Tints the page (and the header) with the current sky. */
function useSky(key: string) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.sky = key;
    return () => {
      delete root.dataset.sky;
    };
  }, [key]);
}

function WeatherLoading() {
  useSky("loading");
  return (
    <main className="-mt-16 flex-1">
      <section className="hero" aria-busy="true" aria-label="Weer wordt geladen">
        <div className="hero-inner">
          <div className="hero-meta">
            <span className="sky-placeholder h-4 w-40" />
          </div>
          <div className="hero-now flex flex-col gap-4">
            <span className="sky-placeholder h-28 w-40" />
            <span className="sky-placeholder h-4 w-32" />
          </div>
          <div className="hero-wear flex flex-col gap-3">
            <span className="sky-placeholder h-6 w-56" />
            <span className="sky-placeholder h-4 w-36" />
          </div>
          <div className="hero-figure">
            <OutfitFigure outfit={PLACEHOLDER_OUTFIT} className="figure-placeholder" />
          </div>
        </div>
      </section>
    </main>
  );
}

function WeatherError({ message, onRetry }: { message: string; onRetry: () => void }) {
  useSky("overcast-day");
  return (
    <main className="-mt-16 flex-1">
      <section className="hero">
        <div className="mx-auto flex h-full max-w-xl flex-col justify-center gap-5 px-4 pt-16">
          <LocateFixed className="size-8" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="font-display text-3xl leading-tight font-bold sm:text-4xl">
            Je locatie is nodig voor het weer
          </h1>
          <p className="text-base text-(--sky-ink-soft)">
            Sta locatietoegang toe in je browser en probeer het opnieuw. Je locatie wordt niet
            opgeslagen.
          </p>
          <p className="text-sm text-(--sky-ink-soft)">Melding: {message}</p>
          <Button onClick={onRetry} size="lg" className="self-start rounded-full px-4">
            <RefreshCw data-icon="inline-start" />
            Opnieuw proberen
          </Button>
        </div>
      </section>
    </main>
  );
}

function HomeComponent() {
  const location = useQuery({
    queryKey: ["current-location"],
    queryFn: getCurrentLocation,
    staleTime: Infinity,
    retry: false,
  });

  const weather = useQuery(
    trpc.weather.getWeather.queryOptions(location.data ?? { lat: "", long: "" }, {
      enabled: Boolean(location.data),
      staleTime: 10 * 60_000,
    }),
  );

  if (location.isLoading || weather.isLoading) {
    return <WeatherLoading />;
  }

  if (location.isError || weather.isError || !weather.data) {
    return (
      <WeatherError
        message={weather.error?.message || location.error?.message || "Onbekende fout"}
        onRetry={() => {
          if (location.isError) {
            void location.refetch();
          } else {
            void weather.refetch();
          }
        }}
      />
    );
  }

  return <WeatherView data={weather.data} />;
}

type WeatherData = inferRouterOutputs<AppRouter>["weather"]["getWeather"];

function WeatherView({ data }: { data: WeatherData }) {
  const { current, daily, hourly } = data;
  const isDay = current.is_day === 1;
  const condition = getWeatherCondition(current.weather_code, isDay);
  useSky(getSkyKey(condition.kind, isDay));

  const currentHourIndex = Math.max(
    0,
    hourly.time.findIndex((time) => time >= current.time.slice(0, 13)),
  );
  const hours: HourPoint[] = hourly.time
    .slice(currentHourIndex, currentHourIndex + 24)
    .map((time, offset) => {
      const index = currentHourIndex + offset;
      return {
        time,
        temperature: hourly.temperature_2m[index],
        rainChance: hourly.precipitation_probability[index],
        code: hourly.weather_code[index],
        isDay: hourly.is_day[index] === 1,
      };
    });

  // The outfit covers the next twelve hours, not just this moment.
  const nextHours = hours.slice(0, 12);
  const rainingNow = isWetCode(current.weather_code) || current.precipitation > 0;
  const snowing = isSnowCode(current.weather_code);
  const rainChance = Math.max(...nextHours.map((hour) => hour.rainChance));
  const outfit = getOutfit({
    feelsLike: current.apparent_temperature,
    rainChance,
    rainingNow,
    snowing,
    windSpeed: current.wind_speed_10m,
    uvIndex: daily.uv_index_max[0],
    sunny: condition.kind === "clear" || condition.kind === "partly",
  });
  const garments = listGarments(outfit);
  const headline = getOutfitHeadline(outfit, current.apparent_temperature, snowing);
  const detail = getOutlook(nextHours, current.temperature_2m, rainingNow, daily.uv_index_max[0]);

  const windowEnd = hours[hours.length - 1].time;
  const sunEvents: SunEvent[] = [
    ...daily.sunrise.map((time) => ({ time, kind: "rise" as const })),
    ...daily.sunset.map((time) => ({ time, kind: "set" as const })),
  ].filter(({ time }) => time > hours[0].time && time < windowEnd);

  const days: DayPoint[] = daily.time.map((date, index) => {
    const code = daily.weather_code[index];
    const dayOutfit = getOutfit({
      feelsLike: daily.apparent_temperature_max[index],
      rainChance: daily.precipitation_probability_max[index],
      rainingNow: false,
      snowing: isSnowCode(code),
      windSpeed: 0,
      uvIndex: daily.uv_index_max[index],
      sunny: code <= 2,
    });
    return {
      date,
      code,
      max: daily.temperature_2m_max[index],
      min: daily.temperature_2m_min[index],
      rainChance: daily.precipitation_probability_max[index],
      garment: keyGarment(dayOutfit),
    };
  });

  const today = fullDateFormatter.format(new Date(`${daily.time[0]}T12:00:00`));
  const outfitKey = `${outfit.top}-${outfit.outer}-${outfit.bottom}-${garments.length}`;

  return (
    <main className="-mt-16 flex-1">
      <section className="hero" aria-labelledby="outfit-headline">
        <SkyEffects kind={condition.kind} isDay={isDay} />

        <div className="hero-inner">
          <div className="hero-meta">
            <span className="first-letter:uppercase">{today}</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              Jouw locatie, {formatHour(current.time)}
            </span>
          </div>

          <div className="hero-now">
            <p
              className="temperature font-display"
              style={{ fontStretch: `${temperatureWidth(current.apparent_temperature)}%` }}
            >
              {Math.round(current.temperature_2m)}°
            </p>
            <p className="mt-3 text-base font-medium sm:text-lg">
              {condition.label}
              <span className="text-(--sky-ink-soft)">
                , voelt als {formatTemperature(current.apparent_temperature)}
              </span>
            </p>
          </div>

          <div className="hero-wear">
            <h1
              id="outfit-headline"
              className="font-display text-xl leading-[1.15] font-bold text-balance sm:text-3xl"
            >
              {headline}
            </h1>
            {detail && <p className="mt-2 text-sm text-(--sky-ink-soft) sm:text-base">{detail}</p>}
          </div>

          <ul key={outfitKey} className="garment-list" aria-label="Wat je aantrekt">
            {garments.map((garment, index) => (
              <li
                key={garment}
                style={{ "--c": GARMENTS[garment].color, "--i": index } as React.CSSProperties}
              >
                <span className="swatch" aria-hidden="true" />
                {GARMENTS[garment].label}
              </li>
            ))}
          </ul>

          <div className="hero-figure">
            <OutfitFigure key={outfitKey} outfit={outfit} className="figure" />
          </div>

          <dl className="hero-stats">
            <div>
              <dt>Max / min</dt>
              <dd>
                {formatTemperature(daily.temperature_2m_max[0])} /{" "}
                {formatTemperature(daily.temperature_2m_min[0])}
              </dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd>{Math.round(current.wind_speed_10m)} km/u</dd>
            </div>
            <div>
              <dt>Regenkans</dt>
              <dd>{rainChance}%</dd>
            </div>
            <div>
              <dt>UV-index</dt>
              <dd>{Math.round(daily.uv_index_max[0])}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="sheet">
        <div
          className="mx-auto h-1 w-10 translate-y-2.5 rounded-full bg-foreground/15"
          aria-hidden="true"
        />
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 pt-7 pb-12 sm:px-8">
          <section
            id="uren"
            className="hourly-section flex flex-col gap-5"
            aria-labelledby="uren-titel"
          >
            <h2 id="uren-titel" className="font-display text-2xl font-bold">
              Komende 24 uur
            </h2>
            <HourlyForecast hours={hours} sunEvents={sunEvents} />
          </section>

          <section id="week" className="flex flex-col gap-3" aria-labelledby="week-titel">
            <h2 id="week-titel" className="font-display text-2xl font-bold">
              Deze week
            </h2>
            <DailyForecast days={days} currentTemperature={current.temperature_2m} />
          </section>

          <p className="text-center text-xs text-muted-foreground">
            Weergegevens van Open-Meteo. Je locatie wordt niet opgeslagen.
          </p>
        </div>
      </div>
    </main>
  );
}

/** One short line about what changes over the next hours. */
function getOutlook(hours: HourPoint[], temperature: number, rainingNow: boolean, uvIndex: number) {
  if (rainingNow) {
    const dry = hours.find((hour) => hour.rainChance < 30);
    return dry
      ? `Rond ${formatHour(dry.time)} wordt het droger.`
      : "Het blijft de komende uren nat.";
  }
  const rain = hours.find((hour) => hour.rainChance >= 50);
  if (rain) return `Regen verwacht rond ${formatHour(rain.time)}.`;
  const coldest = Math.min(...hours.map((hour) => hour.temperature));
  if (temperature - coldest >= 5) {
    return `Later koelt het af naar ${formatTemperature(coldest)}. Neem een extra laag mee.`;
  }
  if (uvIndex >= 6) return `UV-index ${Math.round(uvIndex)} vandaag. Smeer je in.`;
  return null;
}
