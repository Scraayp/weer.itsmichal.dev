import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "../index";

export const weatherRouter = router({
  getWeather: publicProcedure
    .input(
      z.object({
        long: z.string(),
        lat: z.string(),
      })
    )
    .query(async ({ input }) => {
      const params = new URLSearchParams({
        latitude: input.lat,
        longitude: input.long,
        hourly: "temperature_2m",
        forecast_days: "1",
        current_weather: "true",
      });
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: `Failed to fetch weather data: ${response.statusText}`,
        });
      }

      return response.json();
    }),
});
