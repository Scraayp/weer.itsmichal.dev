import { GARMENTS, type Outfit } from "@/lib/weather";

const SKIN = "#E3AE88";
const SKIN_SHADE = "#C98F6A";
const HAIR = "#3A2A20";

// Arms are drawn as thick round-capped polylines: shoulder, elbow, wrist.
const LEFT_ARM = "86,118 77,172 73,222";
const RIGHT_ARM = "154,118 163,172 167,222";
const RIGHT_ARM_RAISED = "154,118 178,184 160,154";
const LEFT_SLEEVE = "86,118 81,146";
const RIGHT_SLEEVE = "154,118 159,146";
const RIGHT_SLEEVE_RAISED = "154,118 162,146";

type Tone = { color: string; shade: string };

function Layer({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <g className="garment" style={{ "--i": index } as React.CSSProperties}>
      {children}
    </g>
  );
}

function Arm({
  points,
  color,
  width,
  outline,
}: {
  points: string;
  color: string;
  width: number;
  outline?: string;
}) {
  return (
    <>
      {outline && (
        <polyline
          points={points}
          fill="none"
          stroke={outline}
          strokeWidth={width + 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Top({ outfit, raised }: { outfit: Outfit; raised: boolean }) {
  const tone: Tone = GARMENTS[outfit.top];
  const long = outfit.top !== "tshirt";
  const rightArm = raised ? RIGHT_ARM_RAISED : RIGHT_ARM;

  return (
    <>
      <path
        d="M86 106 Q120 98 154 106 Q159 110 158 122 L153 234 H87 L82 122 Q81 110 86 106 Z"
        fill={tone.color}
      />
      <path d="M107 104 Q120 116 133 104" fill="none" stroke={tone.shade} strokeWidth={4} />
      {outfit.top === "sweater" && <path d="M87 226 H153 V236 H87 Z" fill={tone.shade} />}
      <Arm points={LEFT_ARM} color={SKIN} width={17} />
      <Arm points={rightArm} color={SKIN} width={17} />
      <Arm points={long ? LEFT_ARM : LEFT_SLEEVE} color={tone.color} width={23} />
      <Arm
        points={long ? rightArm : raised ? RIGHT_SLEEVE_RAISED : RIGHT_SLEEVE}
        color={tone.color}
        width={23}
      />
    </>
  );
}

function Outer({ outfit, raised }: { outfit: Outfit; raised: boolean }) {
  if (outfit.outer === "none") return null;
  const tone: Tone = GARMENTS[outfit.outer];
  const sleeveWidth = outfit.outer === "puffer" ? 29 : 26;
  const sleeves = (
    <>
      <Arm points={LEFT_ARM} color={tone.color} width={sleeveWidth} outline={tone.shade} />
      <Arm
        points={raised ? RIGHT_ARM_RAISED : RIGHT_ARM}
        color={tone.color}
        width={sleeveWidth}
        outline={tone.shade}
      />
    </>
  );

  switch (outfit.outer) {
    case "windbreaker":
      return (
        <>
          <path
            d="M84 104 Q100 99 112 101 L114 238 H86 L79 122 Q78 109 84 104 Z"
            fill={tone.color}
          />
          <path
            d="M156 104 Q140 99 128 101 L126 238 H154 L161 122 Q162 109 156 104 Z"
            fill={tone.color}
          />
          <path d="M113 102 L114 238 M127 102 L126 238" stroke={tone.shade} strokeWidth={3} />
          <path d="M100 100 L112 101 L108 118 Z M140 100 L128 101 L132 118 Z" fill={tone.shade} />
          {sleeves}
        </>
      );
    case "raincoat":
      return (
        <>
          <path
            d="M84 104 Q120 95 156 104 Q162 109 161 122 L168 278 Q120 284 72 278 L79 122 Q78 109 84 104 Z"
            fill={tone.color}
          />
          <path d="M120 110 V281" stroke={tone.shade} strokeWidth={3} />
          <path
            d="M88 216 H108 M132 216 H152"
            stroke={tone.shade}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {!outfit.hood && (
            <path d="M97 100 Q120 116 143 100 L145 111 Q120 128 95 111 Z" fill={tone.shade} />
          )}
          {sleeves}
        </>
      );
    case "coat":
      return (
        <>
          <path
            d="M84 104 Q120 95 156 104 Q162 109 161 122 L165 306 Q120 310 75 306 L79 122 Q78 109 84 104 Z"
            fill={tone.color}
          />
          <path d="M111 100 L120 128 L129 100 Z" fill={GARMENTS[outfit.top].color} />
          <path d="M104 101 L120 156 L136 101 L129 99 L120 128 L111 99 Z" fill={tone.shade} />
          <path d="M120 156 V308" stroke={tone.shade} strokeWidth={2.5} />
          {[180, 212, 244].map((y) => (
            <circle key={y} cx={128} cy={y} r={3.2} fill={tone.shade} />
          ))}
          {sleeves}
        </>
      );
    case "puffer":
      return (
        <>
          <path
            d="M80 102 Q120 92 160 102 Q168 110 167 124 L165 254 Q120 264 75 254 L73 124 Q72 110 80 102 Z"
            fill={tone.color}
          />
          <path
            d="M75 142 Q120 152 165 142 M75 180 Q120 190 165 180 M75 218 Q120 228 165 218"
            fill="none"
            stroke={tone.shade}
            strokeWidth={2.5}
          />
          <path d="M120 108 V260" stroke={tone.shade} strokeWidth={2.5} />
          <path d="M101 91 Q120 87 139 91 L142 106 Q120 113 98 106 Z" fill={tone.color} />
          <path d="M101 91 Q120 87 139 91" fill="none" stroke={tone.shade} strokeWidth={2} />
          {sleeves}
        </>
      );
  }
}

function Shoes({ outfit }: { outfit: Outfit }) {
  const tone: Tone = GARMENTS[outfit.shoes];
  if (outfit.shoes === "boots") {
    return (
      <>
        <path
          d="M98 372 H118 V418 Q118 424 112 424 H88 Q82 424 83 418 Q85 408 98 404 Z"
          fill={tone.color}
        />
        <path
          d="M142 372 H122 V418 Q122 424 128 424 H152 Q158 424 157 418 Q155 408 142 404 Z"
          fill={tone.color}
        />
        <path d="M83 419 H118 M122 419 H157" stroke={tone.shade} strokeWidth={4} />
      </>
    );
  }
  return (
    <>
      <path
        d="M97 400 H118 V418 Q118 424 112 424 H88 Q82 424 83 418 Q85 404 97 400 Z"
        fill={tone.color}
      />
      <path
        d="M143 400 H122 V418 Q122 424 128 424 H152 Q158 424 157 418 Q155 404 143 400 Z"
        fill={tone.color}
      />
      <path d="M83 420 H118 M122 420 H157" stroke={tone.shade} strokeWidth={4} />
    </>
  );
}

function Bottom({ outfit }: { outfit: Outfit }) {
  const tone: Tone = GARMENTS[outfit.bottom];
  if (outfit.bottom === "shorts") {
    return (
      <>
        <path d="M97 232 L143 232 L140 404 H125 L120 280 L115 404 H100 Z" fill={SKIN} />
        <path d="M89 218 H151 L154 298 H124 L120 266 L116 298 H86 Z" fill={tone.color} />
        <path d="M120 240 V266" stroke={tone.shade} strokeWidth={2.5} />
      </>
    );
  }
  return (
    <>
      <path d="M89 218 H151 L148 410 H124 L120 268 L116 410 H92 Z" fill={tone.color} />
      <path d="M104 290 L106 404 M136 290 L134 404" stroke={tone.shade} strokeWidth={2} />
    </>
  );
}

function Head({ outfit }: { outfit: Outfit }) {
  const raincoat = GARMENTS.raincoat;
  return (
    <>
      {outfit.hood && (
        <path
          d="M88 74 C86 36 104 22 120 22 C136 22 154 36 152 74 L150 104 Q120 112 90 104 Z"
          fill={raincoat.shade}
        />
      )}
      <rect x={110} y={82} width={20} height={26} rx={6} fill={SKIN_SHADE} />
      {!outfit.hood && (
        <>
          <circle cx={96} cy={64} r={6} fill={SKIN} />
          <circle cx={144} cy={64} r={6} fill={SKIN} />
        </>
      )}
      <ellipse cx={120} cy={62} rx={24} ry={28} fill={SKIN} />
      {!outfit.hood && (
        <path
          d="M96 60 C92 34 108 26 122 27 C140 28 150 40 145 60 C142 50 134 44 121 44 C108 44 100 50 96 60 Z"
          fill={HAIR}
        />
      )}
      <circle cx={111} cy={65} r={2.3} fill="#2A1E18" />
      <circle cx={129} cy={65} r={2.3} fill="#2A1E18" />
      <path
        d="M106 57 Q111 54.5 116 57 M124 57 Q129 54.5 134 57"
        fill="none"
        stroke={HAIR}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M120 67 Q117 72 121 73"
        fill="none"
        stroke={SKIN_SHADE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M114 78 Q120 82 126 78"
        fill="none"
        stroke="#7A3E2E"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={106} cy={73} r={4} fill="#E07A6A" opacity={0.25} />
      <circle cx={134} cy={73} r={4} fill="#E07A6A" opacity={0.25} />
      {outfit.hood && (
        <ellipse
          cx={120}
          cy={62}
          rx={27}
          ry={31}
          fill="none"
          stroke={raincoat.color}
          strokeWidth={6}
        />
      )}
    </>
  );
}

function Extras({ outfit }: { outfit: Outfit }) {
  return (
    <>
      {outfit.scarf && (
        <Layer index={5}>
          <path d="M98 96 Q120 110 142 96 L144 110 Q120 126 96 110 Z" fill={GARMENTS.scarf.color} />
          <path d="M124 112 L136 110 L140 168 L126 170 Z" fill={GARMENTS.scarf.shade} />
          <path
            d="M128 170 V177 M132 170 V177 M136 169 V176"
            stroke={GARMENTS.scarf.shade}
            strokeWidth={2}
          />
        </Layer>
      )}
      {outfit.beanie && (
        <Layer index={6}>
          <path
            d="M95 52 C95 28 108 22 120 22 C132 22 145 28 145 52 Z"
            fill={GARMENTS.beanie.color}
          />
          <path d="M93 45 H147 V55 Q120 60 93 55 Z" fill={GARMENTS.beanie.shade} />
          <circle cx={120} cy={19} r={7} fill={GARMENTS.beanie.shade} />
        </Layer>
      )}
      {outfit.cap && !outfit.beanie && (
        <Layer index={6}>
          <path d="M96 50 C96 30 108 25 120 25 C132 25 144 30 144 50 Z" fill={GARMENTS.cap.color} />
          <path d="M92 48 Q120 58 148 48 Q146 55 120 59 Q94 55 92 48 Z" fill={GARMENTS.cap.shade} />
        </Layer>
      )}
      {outfit.sunglasses && (
        <Layer index={7}>
          <rect x={103} y={59} width={15} height={10} rx={3.5} fill={GARMENTS.sunglasses.color} />
          <rect x={122} y={59} width={15} height={10} rx={3.5} fill={GARMENTS.sunglasses.color} />
          <path d="M118 62 H122" stroke={GARMENTS.sunglasses.color} strokeWidth={2} />
        </Layer>
      )}
    </>
  );
}

function Hands({ outfit, raised }: { outfit: Outfit; raised: boolean }) {
  const color = outfit.gloves ? GARMENTS.gloves.color : SKIN;
  return (
    <>
      <circle cx={72} cy={230} r={8.5} fill={color} />
      {raised ? (
        <circle cx={158} cy={152} r={8.5} fill={color} />
      ) : (
        <circle cx={168} cy={230} r={8.5} fill={color} />
      )}
    </>
  );
}

function Umbrella() {
  const tone = GARMENTS.umbrella;
  return (
    <>
      <path
        d="M156 -66 L158 172 Q158 184 150 184 Q143 184 143 177"
        fill="none"
        stroke={tone.shade}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <path
        d="M74 -4 Q78 -62 156 -66 Q234 -62 238 -4 Q224.3 -14 210.7 -4 Q197 -14 183.3 -4 Q169.7 -14 156 -4 Q142.3 -14 128.7 -4 Q115 -14 101.3 -4 Q87.7 -14 74 -4 Z"
        fill={tone.color}
      />
      <path
        d="M156 -66 Q128 -40 128.7 -4 M156 -66 Q184 -40 183.3 -4 M156 -66 Q100 -44 101.3 -4 M156 -66 Q212 -44 210.7 -4"
        fill="none"
        stroke={tone.shade}
        strokeWidth={2}
      />
      <path d="M156 -66 V-74" stroke={tone.shade} strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

export function OutfitFigure({ outfit, className }: { outfit: Outfit; className?: string }) {
  const raised = outfit.umbrella;
  const viewBox = raised ? "40 -82 210 520" : "40 8 210 430";

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      role="img"
      aria-label="Illustratie van een man in de aanbevolen kleding"
      style={{ aspectRatio: raised ? "210 / 520" : "210 / 430" }}
    >
      <ellipse cx={120} cy={428} rx={62} ry={7} fill="rgb(0 0 0 / 0.14)" />
      <Layer index={0}>
        <Bottom outfit={outfit} />
      </Layer>
      <Layer index={1}>
        <Shoes outfit={outfit} />
      </Layer>
      <Layer index={0}>
        <Head outfit={outfit} />
      </Layer>
      <Layer index={2}>
        <Top outfit={outfit} raised={raised} />
      </Layer>
      <Layer index={3}>
        <Outer outfit={outfit} raised={raised} />
      </Layer>
      <Extras outfit={outfit} />
      {raised && (
        <Layer index={8}>
          <Umbrella />
        </Layer>
      )}
      <Layer index={outfit.gloves ? 7 : 2}>
        <Hands outfit={outfit} raised={raised} />
      </Layer>
    </svg>
  );
}
