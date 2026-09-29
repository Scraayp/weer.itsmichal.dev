import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "../index";

const weatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    apparent_temperature: z.number(),
    is_day: z.number(),
    precipitation: z.number(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    uv_index_max: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
  }),
});

export const weatherRouter = router({
  getWeather: publicProcedure
    .input(
      z.object({
        long: z.string(),
        lat: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const params = new URLSearchParams({
        latitude: input.lat,
        longitude: input.long,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
        hourly: "temperature_2m,precipitation_probability,weather_code",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
        forecast_days: "7",
        timezone: "auto",
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: `Failed to fetch weather data: ${response.statusText}`,
        });
      }

      const parsed = weatherResponseSchema.safeParse(await response.json());

      if (!parsed.success) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "The weather service returned an unexpected response.",
        });
      }

      return parsed.data;
    }),
});
