import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@weer.itsmichal.dev/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@weer.itsmichal.dev/ui/components/card";
import { Skeleton } from "@weer.itsmichal.dev/ui/components/skeleton";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Compass,
  Droplets,
  LocateFixed,
  MapPin,
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  Umbrella,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

type WeatherCondition = {
  label: string;
  detail: string;
  icon: LucideIcon;
};

const dayFormatter = new Intl.DateTimeFormat("nl-NL", { weekday: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("nl-NL", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function getWeatherCondition(code: number, isDay = true): WeatherCondition {
  if (code === 0) {
    return {
      label: isDay ? "Zonnig" : "Helder",
      detail: "Een heldere lucht zonder bewolking.",
      icon: Sun,
    };
  }
  if (code <= 2) {
    return {
      label: "Licht bewolkt",
      detail: "Zon en wolken wisselen elkaar af.",
      icon: CloudSun,
    };
  }
  if (code === 3) {
    return { label: "Bewolkt", detail: "Een overwegend grijze lucht.", icon: Cloud };
  }
  if (code === 45 || code === 48) {
    return { label: "Mistig", detail: "Beperkt zicht door mist.", icon: CloudFog };
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: "Motregen", detail: "Af en toe wat lichte regen.", icon: CloudDrizzle };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "Regen", detail: "Neem voor de zekerheid een paraplu mee.", icon: CloudRain };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "Sneeuw", detail: "Winterse neerslag in de buurt.", icon: CloudSnow };
  }
  if (code >= 95) {
    return { label: "Onweer", detail: "Kans op onweer en stevige buien.", icon: CloudLightning };
  }
  return { label: "Wisselvallig", detail: "Het weer kan snel veranderen.", icon: CloudSun };
}

function getCurrentLocation() {
  return new Promise<{ lat: string; long: string }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocatie wordt niet ondersteund door deze browser."));
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

function formatTemperature(value: number) {
  return `${Math.round(value)}°`;
}

function formatHour(value: string) {
  return value.slice(11, 16);
}

function WeatherLoading() {
  return (
    <main className="weather-shell flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Skeleton className="h-5 w-44" />
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Skeleton className="h-96 w-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-44 w-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  );
}

function WeatherError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="weather-shell grid flex-1 place-items-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-3 grid size-11 place-items-center rounded-full bg-secondary">
            <LocateFixed className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>We kunnen je lokale weer nog niet tonen</CardTitle>
          <CardDescription>
            Sta locatietoegang toe in je browser en probeer het opnieuw. Je exacte locatie wordt
            niet opgeslagen.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">{message}</p>
          <Button onClick={onRetry} className="self-start">
            <RefreshCw data-icon="inline-start" />
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {label}
          </span>
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl tracking-tight">{value}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
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

  const { current, daily, hourly, latitude, longitude } = weather.data;
  const condition = getWeatherCondition(current.weather_code, current.is_day === 1);
  const CurrentIcon = condition.icon;
  const currentHourIndex = Math.max(
    0,
    hourly.time.findIndex((time) => time >= current.time.slice(0, 13)),
  );
  const hourlyForecast = hourly.time.slice(currentHourIndex, currentHourIndex + 8);
  const today = new Date(`${daily.time[0]}T12:00:00`);

  return (
    <main className="weather-shell flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              <span>Jouw locatie</span>
              <span aria-hidden="true">·</span>
              <span>
                {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
              </span>
            </div>
            <p className="text-sm first-letter:uppercase">{fullDateFormatter.format(today)}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="status-dot" aria-hidden="true" />
            Bijgewerkt om {formatHour(current.time)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="weather-hero min-h-96 justify-between">
            <CardHeader className="relative">
              <div className="mb-10 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.68rem] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
                    Nu buiten
                  </span>
                  <CardTitle className="text-xl text-primary-foreground">
                    {condition.label}
                  </CardTitle>
                </div>
                <CurrentIcon
                  className="size-14 text-primary-foreground"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-end gap-5">
                <p className="text-8xl leading-none font-semibold tracking-[-0.08em] text-primary-foreground sm:text-9xl">
                  {Math.round(current.temperature_2m)}
                  <span className="align-top text-4xl">°</span>
                </p>
                <div className="mb-2 flex flex-col gap-1 text-primary-foreground/75">
                  <span>Voelt als {formatTemperature(current.apparent_temperature)}</span>
                  <span>
                    H {formatTemperature(daily.temperature_2m_max[0])} · L{" "}
                    {formatTemperature(daily.temperature_2m_min[0])}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative flex items-center justify-between gap-4 border-t border-primary-foreground/15 pt-4 text-primary-foreground/75">
              <p>{condition.detail}</p>
              <Compass className="size-4 shrink-0" aria-hidden="true" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={Wind}
              label="Wind"
              value={`${Math.round(current.wind_speed_10m)} km/u`}
              description="Actuele windsnelheid"
            />
            <MetricCard
              icon={Droplets}
              label="Vochtigheid"
              value={`${current.relative_humidity_2m}%`}
              description="Relatieve luchtvochtigheid"
            />
            <MetricCard
              icon={Umbrella}
              label="Neerslag"
              value={`${daily.precipitation_probability_max[0]}%`}
              description="Hoogste kans vandaag"
            />
            <MetricCard
              icon={Sun}
              label="UV-index"
              value={daily.uv_index_max[0].toFixed(1)}
              description={
                daily.uv_index_max[0] >= 6 ? "Bescherming aanbevolen" : "Lage tot matige kracht"
              }
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>De komende uren</CardTitle>
            <CardDescription>Temperatuur en neerslagkans op jouw locatie</CardDescription>
            <CardAction className="hidden items-center gap-5 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <Sunrise className="size-3.5" aria-hidden="true" />
                {formatHour(daily.sunrise[0])}
              </span>
              <span className="flex items-center gap-1.5">
                <Sunset className="size-3.5" aria-hidden="true" />
                {formatHour(daily.sunset[0])}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-1">
            <div className="grid min-w-175 grid-cols-8 divide-x divide-border">
              {hourlyForecast.map((time, offset) => {
                const index = currentHourIndex + offset;
                const hourlyCondition = getWeatherCondition(hourly.weather_code[index]);
                const HourIcon = hourlyCondition.icon;

                return (
                  <div key={time} className="flex flex-col items-center gap-3 px-3 py-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {offset === 0 ? "Nu" : formatHour(time)}
                    </span>
                    <HourIcon
                      className="size-5"
                      strokeWidth={1.5}
                      aria-label={hourlyCondition.label}
                    />
                    <strong className="text-lg font-medium">
                      {formatTemperature(hourly.temperature_2m[index])}
                    </strong>
                    <span className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                      <Droplets className="size-3" aria-hidden="true" />
                      {hourly.precipitation_probability[index]}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7-daagse verwachting</CardTitle>
            <CardDescription>Een snelle blik op de rest van de week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-border">
              {daily.time.map((date, index) => {
                const dailyCondition = getWeatherCondition(daily.weather_code[index]);
                const DayIcon = dailyCondition.icon;

                return (
                  <div
                    key={date}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-5 py-3.5 sm:grid-cols-[1fr_1fr_auto_auto]"
                  >
                    <span className="font-medium capitalize">
                      {index === 0 ? "Vandaag" : dayFormatter.format(new Date(`${date}T12:00:00`))}
                    </span>
                    <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                      <DayIcon className="size-4" aria-hidden="true" />
                      {dailyCondition.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplets className="size-3" aria-hidden="true" />
                      {daily.precipitation_probability_max[index]}%
                    </span>
                    <span className="min-w-20 text-right font-medium tabular-nums">
                      {formatTemperature(daily.temperature_2m_max[index])}
                      <span className="ml-2 text-muted-foreground">
                        {formatTemperature(daily.temperature_2m_min[index])}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className="pb-4 text-center text-[0.68rem] tracking-wide text-muted-foreground uppercase">
          Weergegevens van Open-Meteo · Locatie blijft op je apparaat
        </p>
      </div>
    </main>
  );
}
