import type { SkyKind } from "@/lib/weather";

// Deterministic pseudo-random so particles don't jump between renders.
function scatter(count: number, seed: number) {
  let value = seed;
  const next = () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
  return Array.from({ length: count }, () => ({ x: next(), y: next(), z: next() }));
}

const DROPS = scatter(46, 7);
const FLAKES = scatter(40, 13);
const STARS = scatter(36, 29);

export function SkyEffects({ kind, isDay }: { kind: SkyKind; isDay: boolean }) {
  const wet = kind === "rain" || kind === "drizzle" || kind === "storm";
  const cloudy = kind !== "clear";

  return (
    <div className="sky-effects" aria-hidden="true">
      {isDay && (kind === "clear" || kind === "partly") && <div className="sky-sun" />}
      {!isDay && (kind === "clear" || kind === "partly") && (
        <>
          <div className="sky-moon" />
          {STARS.map(({ x, y, z }, index) => (
            <span
              key={index}
              className="sky-star"
              style={{
                left: `${x * 100}%`,
                top: `${y * 55}%`,
                opacity: 0.35 + z * 0.55,
                animationDelay: `${z * -6}s`,
              }}
            />
          ))}
        </>
      )}
      {cloudy && (
        <>
          <div className="sky-cloud sky-cloud-a" />
          <div className="sky-cloud sky-cloud-b" />
          {kind !== "partly" && <div className="sky-cloud sky-cloud-c" />}
        </>
      )}
      {kind === "fog" && <div className="sky-fog" />}
      {wet &&
        DROPS.slice(0, kind === "drizzle" ? 22 : DROPS.length).map(({ x, y, z }, index) => (
          <span
            key={index}
            className="sky-drop"
            style={{
              left: `${x * 104 - 2}%`,
              animationDelay: `${y * -1.2}s`,
              animationDuration: `${0.75 + z * 0.5}s`,
              opacity: 0.25 + z * 0.45,
            }}
          />
        ))}
      {kind === "snow" &&
        FLAKES.map(({ x, y, z }, index) => (
          <span
            key={index}
            className="sky-flake"
            style={{
              left: `${x * 100}%`,
              width: `${3 + z * 4}px`,
              height: `${3 + z * 4}px`,
              animationDelay: `${y * -9}s`,
              animationDuration: `${7 + z * 5}s`,
            }}
          />
        ))}
    </div>
  );
}
