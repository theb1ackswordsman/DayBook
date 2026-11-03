/**
 * Scene Palette for DayBook Calm Companion Playground
 * Inspired by the visual principles of Alto's Odyssey:
 * Restrained, harmonious, soft atmospheric haze, gentle flat shapes, no harsh outlines.
 */

export const SCENE_PALETTES = {
  dawn: {
    name: "Dawn",
    skyTop: "#C9B6E4",       // Lavender haze
    skyMid: "#F7B2BD",       // Soft rose
    skyBottom: "#FFD3B6",    // Gentle peach horizon
    sunColor: "#FFF1E0",     // Warm cream sun
    sunGlow: "rgba(255, 241, 224, 0.4)",
    sunX: 0.72,
    sunY: 0.32,
    isNight: false,
    lightTint: "rgba(255, 211, 182, 0.08)",
    shadowAngle: 1.5,        // Long soft morning shadow
    shadowLength: 1.5,
    // Layered hills with atmospheric haze (farthest is lightest/lowest contrast)
    hillsFar: "#E2D9F3",     // Farthest misty lavender haze
    hillsMid: "#D3C2E8",     // Mid-distance gentle lavender-rose
    hillsNear: "#C7B0DE",    // Near hill
    grassBand: "#B8D5B0",    // Soft pastel morning meadow
    pondWater: "#A5CCE0",    // Calm reflective water
    pondEdge: "#8FB7CC",
    treeTrunk: "#8C7368",    // Soft muted bark
    treeLeaves: "#E8B4C8",   // Soft rose blossom canopy
    bedCushion: "#F5D4C4",   // Muted peach cushion
    bedBlanket: "#C9B6E4",   // Soft lavender throw
    bedPillow: "#FFF8F2",
    ambientDominant: "butterflies",
  },

  day: {
    name: "Day",
    skyTop: "#BDE3F2",       // Soft serene sky blue
    skyMid: "#D8EEF8",       // Luminous azure haze
    skyBottom: "#E8F5F0",    // Fresh morning mist horizon
    sunColor: "#FFF6D9",     // Soft sunlit cream
    sunGlow: "rgba(255, 246, 217, 0.45)",
    sunX: 0.5,
    sunY: 0.16,
    isNight: false,
    lightTint: "rgba(255, 255, 255, 0.03)",
    shadowAngle: 0.3,        // Gentle short midday shadow
    shadowLength: 0.9,
    // Layered hills with atmospheric haze
    hillsFar: "#DBEDE4",     // Distant misty horizon ridge
    hillsMid: "#C5E3D2",     // Mid pastel rolling slope
    hillsNear: "#AFD7C0",    // Foreground rolling hill
    grassBand: "#A8D5A2",    // Soft green sunlit grass
    pondWater: "#88C5DE",    // Clear sky-reflecting pond
    pondEdge: "#72B0CA",
    treeTrunk: "#786255",    // Natural soft wood
    treeLeaves: "#8ECB96",   // Gentle matcha leaf canopy
    bedCushion: "#D6EAF2",   // Cloud blue cushion
    bedBlanket: "#9EC2D8",   // Serene blue blanket
    bedPillow: "#FFFFFF",
    ambientDominant: "butterflies",
  },

  sunset: {
    name: "Sunset",
    skyTop: "#8E7CC3",       // Twilight violet
    skyMid: "#E58FA8",       // Dusty rose
    skyBottom: "#FF9E80",    // Warm sunset coral
    sunColor: "#FFD08A",     // Soft gold sun
    sunGlow: "rgba(255, 208, 138, 0.5)",
    sunX: 0.28,
    sunY: 0.34,
    isNight: false,
    lightTint: "rgba(255, 158, 128, 0.1)",
    shadowAngle: -1.6,       // Long soft sunset shadow
    shadowLength: 1.6,
    // Layered hills with atmospheric haze
    hillsFar: "#C4A5D1",     // Distant hazy violet ridge
    hillsMid: "#B688BD",     // Mid dusky plum slope
    hillsNear: "#A573AC",    // Near sunset ridge
    grassBand: "#C89578",    // Golden-amber sunset meadow
    pondWater: "#D97B8F",    // Mirroring coral sunset glow
    pondEdge: "#BF667A",
    treeTrunk: "#5E4338",    // Dusk silhouette wood
    treeLeaves: "#D4788C",   // Dusty rose foliage
    bedCushion: "#ECC0B2",   // Muted warm blush cushion
    bedBlanket: "#A36B88",   // Heather purple blanket
    bedPillow: "#FFF0EB",
    ambientDominant: "petals",
  },

  night: {
    name: "Night",
    skyTop: "#1A2044",       // Deep quiet midnight indigo
    skyMid: "#232B5A",       // Alto-style atmospheric indigo
    skyBottom: "#2F4F6F",    // Deep teal haze horizon
    sunColor: "#F4EFD8",     // Soft moon cream
    sunGlow: "rgba(143, 184, 222, 0.35)", // Subtle moon glow (#8FB8DE)
    sunX: 0.78,
    sunY: 0.16,
    isNight: true,
    lightTint: "rgba(35, 43, 90, 0.12)",
    shadowAngle: 0.4,
    shadowLength: 1.0,
    // Layered hills with atmospheric haze
    hillsFar: "#232E58",     // Distant midnight haze
    hillsMid: "#1E274A",     // Mid night silhouette
    hillsNear: "#18203E",    // Near hill
    grassBand: "#1C353D",    // Deep night teal lawn
    pondWater: "#1E344D",    // Dark calm starlit pool
    pondEdge: "#152639",
    treeTrunk: "#282025",    // Dark tranquil silhouette
    treeLeaves: "#1E2B3E",   // Quiet deep night foliage
    lanternGlow: "rgba(244, 239, 216, 0.75)", // Soft warm lantern (#F4EFD8)
    bedCushion: "#232D48",   // Midnight velvet cushion
    bedBlanket: "#434E78",   // Muted slate throw
    bedPillow: "#DDE4EE",
    ambientDominant: "fireflies",
  },
};

/** Parse hex color #RRGGBB or #RGB to {r, g, b} */
export function parseHex(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Interpolate between two hex colors */
export function lerpColor(hexA, hexB, t) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Ease in out cubic for smooth 3-4s cross-fade */
export function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Interpolate two complete scene palettes */
export function interpolatePalettes(palA, palB, linearT) {
  const t = easeInOutCubic(Math.max(0, Math.min(1, linearT)));
  if (t <= 0) return palA;
  if (t >= 1) return palB;

  return {
    ...palB,
    skyTop: lerpColor(palA.skyTop, palB.skyTop, t),
    skyMid: lerpColor(palA.skyMid, palB.skyMid, t),
    skyBottom: lerpColor(palA.skyBottom, palB.skyBottom, t),
    sunColor: lerpColor(palA.sunColor, palB.sunColor, t),
    hillsFar: lerpColor(palA.hillsFar, palB.hillsFar, t),
    hillsMid: lerpColor(palA.hillsMid, palB.hillsMid, t),
    hillsNear: lerpColor(palA.hillsNear, palB.hillsNear, t),
    grassBand: lerpColor(palA.grassBand, palB.grassBand, t),
    pondWater: lerpColor(palA.pondWater, palB.pondWater, t),
    pondEdge: lerpColor(palA.pondEdge, palB.pondEdge, t),
    treeTrunk: lerpColor(palA.treeTrunk, palB.treeTrunk, t),
    treeLeaves: lerpColor(palA.treeLeaves, palB.treeLeaves, t),
    bedCushion: lerpColor(palA.bedCushion, palB.bedCushion, t),
    bedBlanket: lerpColor(palA.bedBlanket, palB.bedBlanket, t),
    bedPillow: lerpColor(palA.bedPillow, palB.bedPillow, t),
    sunX: palA.sunX + (palB.sunX - palA.sunX) * t,
    sunY: palA.sunY + (palB.sunY - palA.sunY) * t,
    shadowAngle: palA.shadowAngle + (palB.shadowAngle - palA.shadowAngle) * t,
    shadowLength: palA.shadowLength + (palB.shadowLength - palA.shadowLength) * t,
  };
}

/** Automatic time-of-day key from local hour */
export function getAutoTimeKey(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}
