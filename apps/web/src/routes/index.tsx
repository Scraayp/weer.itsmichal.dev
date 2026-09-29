import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});


function getCurrentLocation() {
  return new Promise<{ lat: string; long: string }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
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
      }
    );
  });
}

function HomeComponent() {
  const location = useQuery({
    queryKey: ["current-location"],
    queryFn: getCurrentLocation,
    staleTime: Infinity,
    retry: false,
  });

  const weather = useQuery(
    trpc.weather.getWeather.queryOptions(
      location.data ?? { lat: "", long: "" },
      {
        enabled: Boolean(location.data),
      }
    )
  );

  if (location.isLoading || weather.isLoading) {
    return <div>Loading weather data...</div>;
  }

  if (location.isError || weather.isError) {
    return <div>Error loading weather data: {weather.error?.message || location.error?.message}</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre>{JSON.stringify(weather.data, null, 2)}</pre>
    </div>
  );
}
