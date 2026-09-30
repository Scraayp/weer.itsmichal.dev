import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type SkyKind = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm";

export type WeatherCondition = {
  kind: SkyKind;
  label: string;
  icon: LucideIcon;
};

const RAIN_CODES = [61, 63, 65, 66, 67, 80, 81, 82];
const DRIZZLE_CODES = [51, 53, 55, 56, 57];
const SNOW_CODES = [71, 73, 75, 77, 85, 86];

const RAIN_LABELS: Record<number, string> = {
  61: "Lichte regen",
  63: "Regen",
  65: "Zware regen",
  66: "IJzel",
  67: "IJzel",
  80: "Lichte buien",
  81: "Buien",
  82: "Zware buien",
};

export function getWeatherCondition(code: number, isDay = true): WeatherCondition {
  if (code === 0) {
    return { kind: "clear", label: isDay ? "Zonnig" : "Helder", icon: isDay ? Sun : Moon };
  }
  if (code <= 2) {
    return {
      kind: "partly",
      label: code === 1 ? "Overwegend helder" : "Half bewolkt",
      icon: isDay ? CloudSun : CloudMoon,
    };
  }
  if (code === 3) return { kind: "cloudy", label: "Bewolkt", icon: Cloud };
  if (code === 45 || code === 48) return { kind: "fog", label: "Mist", icon: CloudFog };
  if (DRIZZLE_CODES.includes(code)) {
    return { kind: "drizzle", label: "Motregen", icon: CloudDrizzle };
  }
  if (RAIN_CODES.includes(code)) {
    return { kind: "rain", label: RAIN_LABELS[code] ?? "Regen", icon: CloudRain };
  }
  if (SNOW_CODES.includes(code)) return { kind: "snow", label: "Sneeuw", icon: CloudSnow };
  if (code >= 95) return { kind: "storm", label: "Onweer", icon: CloudLightning };
  return { kind: "cloudy", label: "Wisselvallig", icon: CloudSun };
}

export function isWetCode(code: number) {
  return DRIZZLE_CODES.includes(code) || RAIN_CODES.includes(code) || code >= 95;
}

export function isSnowCode(code: number) {
  return SNOW_CODES.includes(code);
}

/** Maps conditions to one of the sky palettes defined in index.css. */
export function getSkyKey(kind: SkyKind, isDay: boolean) {
  if (kind === "storm") return "storm";
  if (!isDay) return kind === "clear" || kind === "partly" ? "clear-night" : "overcast-night";
  if (kind === "clear") return "clear-day";
  if (kind === "partly") return "partly-day";
  if (kind === "snow") return "snow-day";
  if (kind === "rain" || kind === "drizzle") return "wet-day";
  return "overcast-day";
}

/* ------------------------------------------------------------------------ */
/* Outfit                                                                   */
/* ------------------------------------------------------------------------ */

export type Outfit = {
  top: "tshirt" | "longsleeve" | "sweater";
  outer: "none" | "windbreaker" | "raincoat" | "coat" | "puffer";
  bottom: "shorts" | "trousers";
  shoes: "sneakers" | "boots";
  hood: boolean;
  umbrella: boolean;
  sunglasses: boolean;
  cap: boolean;
  scarf: boolean;
  beanie: boolean;
  gloves: boolean;
};

export type Garment = keyof typeof GARMENTS;

/** One colour per garment, shared by the figure and the swatches in the list. */
export const GARMENTS = {
  tshirt: { label: "T-shirt", color: "#3F9E96", shade: "#34857E" },
  longsleeve: { label: "Longsleeve", color: "#C94F5E", shade: "#AD4150" },
  sweater: { label: "Trui", color: "#6E82D0", shade: "#5A6DB8" },
  windbreaker: { label: "Lichte jas", color: "#5E7449", shade: "#4B5E3A" },
  raincoat: { label: "Regenjas", color: "#F2C230", shade: "#D6A51C" },
  coat: { label: "Wollen jas", color: "#B98650", shade: "#9C6E3F" },
  puffer: { label: "Winterjas", color: "#2F5B53", shade: "#244842" },
  trousers: { label: "Lange broek", color: "#384A66", shade: "#2C3B53" },
  shorts: { label: "Korte broek", color: "#C9B48E", shade: "#B09B74" },
  sneakers: { label: "Sneakers", color: "#F2F1EC", shade: "#C9C8C0" },
  boots: { label: "Laarzen", color: "#6B4630", shade: "#553624" },
  umbrella: { label: "Paraplu", color: "#24324D", shade: "#18233A" },
  sunglasses: { label: "Zonnebril", color: "#1E2430", shade: "#11151D" },
  cap: { label: "Pet", color: "#E7E2D4", shade: "#CFC8B5" },
  scarf: { label: "Sjaal", color: "#D2453B", shade: "#B3372E" },
  beanie: { label: "Muts", color: "#E0A93B", shade: "#C48F28" },
  gloves: { label: "Handschoenen", color: "#2F3642", shade: "#222831" },
} as const;

type OutfitInput = {
  feelsLike: number;
  rainChance: number;
  rainingNow: boolean;
  snowing: boolean;
  windSpeed: number;
  uvIndex: number;
  sunny: boolean;
};

export function getOutfit({
  feelsLike,
  rainChance,
  rainingNow,
  snowing,
  windSpeed,
  uvIndex,
  sunny,
}: OutfitInput): Outfit {
  const outfit: Outfit = {
    top: "tshirt",
    outer: "none",
    bottom: "trousers",
    shoes: "sneakers",
    hood: false,
    umbrella: false,
    sunglasses: false,
    cap: false,
    scarf: false,
    beanie: false,
    gloves: false,
  };

  if (feelsLike <= 7) {
    Object.assign(outfit, { top: "sweater", outer: "puffer", shoes: "boots", scarf: true });
    if (feelsLike <= 0) Object.assign(outfit, { beanie: true, gloves: true });
  } else if (feelsLike <= 12) {
    Object.assign(outfit, { top: "sweater", outer: "coat" });
  } else if (feelsLike <= 17) {
    Object.assign(outfit, { top: "longsleeve", outer: "windbreaker" });
  } else if (feelsLike > 22) {
    outfit.bottom = "shorts";
  }

  if (outfit.outer === "none" && windSpeed >= 35) outfit.outer = "windbreaker";

  const wet = rainingNow || rainChance >= 50;
  if (snowing) {
    Object.assign(outfit, { outer: "puffer", shoes: "boots", bottom: "trousers" });
  } else if (wet) {
    if (outfit.outer === "none" || outfit.outer === "windbreaker") {
      outfit.outer = "raincoat";
      outfit.hood = rainingNow;
    } else {
      outfit.umbrella = true;
    }
    if (feelsLike <= 17) outfit.shoes = "boots";
  }

  if (sunny && !wet && uvIndex >= 4 && feelsLike > 14) outfit.sunglasses = true;
  if (sunny && !wet && uvIndex >= 6 && feelsLike > 22) outfit.cap = true;

  return outfit;
}

export function listGarments(outfit: Outfit): Garment[] {
  const list: Garment[] = [];
  if (outfit.outer !== "none") list.push(outfit.outer);
  list.push(outfit.top, outfit.bottom, outfit.shoes);
  for (const extra of ["umbrella", "scarf", "beanie", "gloves", "cap", "sunglasses"] as const) {
    if (outfit[extra]) list.push(extra);
  }
  return list;
}

/** The single piece of clothing that best sums up a day. */
export function keyGarment(outfit: Outfit): Garment {
  if (outfit.outer !== "none") return outfit.outer;
  if (outfit.bottom === "shorts") return "shorts";
  return outfit.top;
}

export function getOutfitHeadline(outfit: Outfit, feelsLike: number, snowing: boolean) {
  if (snowing) return "Er valt sneeuw. Winterjas en laarzen aan.";
  if (outfit.outer === "raincoat") {
    return outfit.hood
      ? "Het regent. Regenjas aan, capuchon op."
      : "Er komt regen. Neem je regenjas.";
  }
  if (outfit.umbrella) return "Warme jas aan en neem een paraplu mee.";
  if (feelsLike <= 0) return "Het vriest. Kleed je in lagen.";
  if (outfit.outer === "puffer") return "Koud buiten. Winterjas aan.";
  if (outfit.outer === "coat") return "Fris. Een jas over je trui.";
  if (outfit.outer === "windbreaker") return "Een lichte jas is genoeg.";
  if (outfit.bottom === "shorts") return "Korte broek en T-shirt.";
  return "T-shirtweer, met een lange broek.";
}

/* ------------------------------------------------------------------------ */
/* Formatting & scales                                                      */
/* ------------------------------------------------------------------------ */

export function formatTemperature(value: number) {
  return `${Math.round(value)}°`;
}

export function formatHour(value: string) {
  return value.slice(11, 16);
}

const TEMPERATURE_STOPS: Array<[number, [number, number, number]]> = [
  [-10, [108, 142, 240]],
  [0, [111, 179, 232]],
  [10, [92, 192, 168]],
  [18, [233, 194, 74]],
  [25, [238, 154, 58]],
  [32, [224, 88, 62]],
];

export function temperatureColor(value: number) {
  const first = TEMPERATURE_STOPS[0];
  const last = TEMPERATURE_STOPS[TEMPERATURE_STOPS.length - 1];
  if (value <= first[0]) return `rgb(${first[1].join(" ")})`;
  if (value >= last[0]) return `rgb(${last[1].join(" ")})`;

  const upper = TEMPERATURE_STOPS.findIndex(([stop]) => stop >= value);
  const [t0, c0] = TEMPERATURE_STOPS[upper - 1];
  const [t1, c1] = TEMPERATURE_STOPS[upper];
  const ratio = (value - t0) / (t1 - t0);
  const mixed = c0.map((channel, index) => Math.round(channel + (c1[index] - channel) * ratio));
  return `rgb(${mixed.join(" ")})`;
}

/** Condensed when it's cold, stretched out when it's warm (Anybody's wdth axis). */
export function temperatureWidth(feelsLike: number) {
  const clamped = Math.min(30, Math.max(-5, feelsLike));
  return Math.round(62 + ((clamped + 5) / 35) * 78);
}
