/**
 * Silhouette-First Pixel Art Scene Engine
 * Low-res offscreen rendering, 4x4 Bayer ordered dithering, indexed palette quantization.
 * 
 * Reference palettes and ramps:
 * Dawn:   sky #2F2F6B #5B4C9A #A56BAA #E08DA6 #F7B79C #FFD9B0 | halo #FFF0CC #FFFAE6
 *         ridges #E9BCC4 #CC9BB9 #A97FAD #7F6198 #574580 | foreground #221A45
 *         meadow #A9C79A tufts #86AA7F | accent #FFC9A0
 * Day:    sky #4F9FD0 #78BADD #A2D3E6 #C6E6EE #E1F3F0 #F4FBEF | halo #FFF6C8 #FFFBE3
 *         clouds #FFFFFF #E6F3F6 | ridges #C9E5DA #A6D4C5 #82BDAE #5A9E92 #37787A
 *         foreground #1F4A4E | meadow #8FD18B tufts #6FB874 | accent #FFD27A
 * Sunset: sky #1E1840 #3A2A6B #6B3C8A #A64A8C #D8647F #FF8F8A | halo #FFC9A8 #FFE6CF
 *         ridges #C47FA0 #A6679A #864F8C #603A78 #3F2A5E | foreground #1A1233
 *         meadow #8C6FA8 tufts #6F5594 | accent #FFC27A
 * Night:  sky #0B0E2B #141A48 #20306B #355A93 #5E8DB5 #93BCCD | moon #F4E9B8 #FFF7D6
 *         ridges #6D93B0 #54779C #3E5F88 #2A4670 #1B3158 | foreground #0C1530
 *         meadow #4C7C78 tufts #3B6663 | accent #FFC778 #FFE0A3
 */

// Bayer 4x4 matrix normalized to [0, 1)
export const BAYER_4X4 = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
];

export function parseHex(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const n = parseInt(c, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

export function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const h = ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b))
    .toString(16)
    .slice(1)
    .toUpperCase();
  return `#${h}`;
}

export function lerpRgb(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Keyed Anchor Palettes (exact prompt ramps)
export const KEYED_PALETTES = {
  dawn: {
    minute: 360, // 06:00
    name: "Dawn",
    sky: ["#2F2F6B", "#5B4C9A", "#A56BAA", "#E08DA6", "#F7B79C", "#FFD9B0"],
    halo: ["#FFF0CC", "#FFFAE6"],
    ridges: ["#E9BCC4", "#CC9BB9", "#A97FAD", "#7F6198", "#574580"], // back to front
    foreground: "#221A45",
    meadow: "#A9C79A",
    tufts: "#86AA7F",
    accent: ["#FFC9A0", "#FFE4C4"],
    isNight: false,
    sunPosition: { x: 0.72, y: 0.36 },
    lightDirection: "low-right",
  },
  day: {
    minute: 720, // 12:00
    name: "Day",
    sky: ["#4F9FD0", "#78BADD", "#A2D3E6", "#C6E6EE", "#E1F3F0", "#F4FBEF"],
    halo: ["#FFF6C8", "#FFFBE3"],
    clouds: ["#FFFFFF", "#E6F3F6"],
    ridges: ["#C9E5DA", "#A6D4C5", "#82BDAE", "#5A9E92", "#37787A"],
    foreground: "#1F4A4E",
    meadow: "#8FD18B",
    tufts: "#6FB874",
    accent: ["#FFD27A", "#FFF1A8"],
    isNight: false,
    sunPosition: { x: 0.5, y: 0.14 },
    lightDirection: "top-center",
  },
  sunset: {
    minute: 1080, // 18:00
    name: "Sunset",
    sky: ["#1E1840", "#3A2A6B", "#6B3C8A", "#A64A8C", "#D8647F", "#FF8F8A"],
    halo: ["#FFC9A8", "#FFE6CF"],
    ridges: ["#C47FA0", "#A6679A", "#864F8C", "#603A78", "#3F2A5E"],
    foreground: "#1A1233",
    meadow: "#8C6FA8",
    tufts: "#6F5594",
    accent: ["#FFC27A", "#FFDC9E"],
    isNight: false,
    sunPosition: { x: 0.28, y: 0.36 },
    lightDirection: "low-left",
  },
  night: {
    minute: 1440, // 24:00 (also 00:00)
    name: "Night",
    sky: ["#0B0E2B", "#141A48", "#20306B", "#355A93", "#5E8DB5", "#93BCCD"],
    moon: ["#F4E9B8", "#FFF7D6"],
    halo: ["#355A93", "#5E8DB5"],
    ridges: ["#6D93B0", "#54779C", "#3E5F88", "#2A4670", "#1B3158"],
    foreground: "#0C1530",
    meadow: "#4C7C78",
    tufts: "#3B6663",
    accent: ["#FFC778", "#FFE0A3"],
    isNight: true,
    sunPosition: { x: 0.74, y: 0.16 },
    lightDirection: "top-right",
  },
};

// Convert all anchor hexes to RGB once
const ANCHORS_RGB = [
  { min: 0, pal: KEYED_PALETTES.night },
  { min: 360, pal: KEYED_PALETTES.dawn },
  { min: 720, pal: KEYED_PALETTES.day },
  { min: 1080, pal: KEYED_PALETTES.sunset },
  { min: 1440, pal: KEYED_PALETTES.night },
].map((item) => {
  const p = item.pal;
  return {
    min: item.min,
    name: p.name,
    isNight: p.isNight,
    sky: p.sky.map(parseHex),
    halo: (p.halo || p.moon).map(parseHex),
    ridges: p.ridges.map(parseHex),
    foreground: parseHex(p.foreground),
    meadow: parseHex(p.meadow),
    tufts: parseHex(p.tufts),
    accent: p.accent.map(parseHex),
    sunPos: p.sunPosition,
  };
});

/**
 * Continuous time interpolation for any minute 0-1439
 * Returns fully interpolated palette in both RGB and Hex.
 */
export function getInterpolatedPalette(minute) {
  // Normalize minute into [0, 1440)
  let m = ((minute % 1440) + 1440) % 1440;

  // Find adjacent anchors
  let idx = 0;
  for (let i = 0; i < ANCHORS_RGB.length - 1; i++) {
    if (m >= ANCHORS_RGB[i].min && m <= ANCHORS_RGB[i + 1].min) {
      idx = i;
      break;
    }
  }

  const a = ANCHORS_RGB[idx];
  const b = ANCHORS_RGB[idx + 1];
  const range = b.min - a.min;
  const rawT = range > 0 ? (m - a.min) / range : 0;
  const t = easeInOutCubic(Math.max(0, Math.min(1, rawT)));

  const skyRgb = a.sky.map((c, i) => lerpRgb(c, b.sky[i], t));
  const haloRgb = a.halo.map((c, i) => lerpRgb(c, b.halo[i], t));
  const ridgesRgb = a.ridges.map((c, i) => lerpRgb(c, b.ridges[i], t));
  const fgRgb = lerpRgb(a.foreground, b.foreground, t);
  const meadowRgb = lerpRgb(a.meadow, b.meadow, t);
  const tuftsRgb = lerpRgb(a.tufts, b.tufts, t);
  const accentRgb = a.accent.map((c, i) => lerpRgb(c, b.accent[i] || b.accent[0], t));

  const sunX = a.sunPos.x + (b.sunPos.x - a.sunPos.x) * t;
  const sunY = a.sunPos.y + (b.sunPos.y - a.sunPos.y) * t;

  const isNight = m < 300 || m > 1260; // night between 21:00 and 05:00
  const isDuskDawn = (m >= 300 && m < 420) || (m >= 1050 && m < 1200);

  // Build active palette list of colors (RGB + Hex) for quantization
  const allRgb = [
    ...skyRgb,
    ...haloRgb,
    ...ridgesRgb,
    fgRgb,
    meadowRgb,
    tuftsRgb,
    ...accentRgb,
  ];

  const paletteListHex = allRgb.map((c) => rgbToHex(c.r, c.g, c.b));

  return {
    minute: m,
    isNight,
    isDuskDawn,
    sunX,
    sunY,
    skyRgb,
    haloRgb,
    ridgesRgb,
    foregroundRgb: fgRgb,
    meadowRgb,
    tuftsRgb,
    accentRgb,
    skyHex: skyRgb.map((c) => rgbToHex(c.r, c.g, c.b)),
    haloHex: haloRgb.map((c) => rgbToHex(c.r, c.g, c.b)),
    ridgesHex: ridgesRgb.map((c) => rgbToHex(c.r, c.g, c.b)),
    foregroundHex: rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b),
    meadowHex: rgbToHex(meadowRgb.r, meadowRgb.g, meadowRgb.b),
    tuftsHex: rgbToHex(tuftsRgb.r, tuftsRgb.g, tuftsRgb.b),
    accentHex: accentRgb.map((c) => rgbToHex(c.r, c.g, c.b)),
    activePaletteRgb: allRgb,
    activePaletteHex: Array.from(new Set(paletteListHex)),
  };
}

/**
 * Quantize an RGB color to the closest color in the active palette
 * (Euclidean distance in RGB space).
 */
export function quantizeColor(r, g, b, paletteRgb) {
  let closest = paletteRgb[0];
  let minDist = Infinity;
  for (let i = 0; i < paletteRgb.length; i++) {
    const p = paletteRgb[i];
    const dr = r - p.r;
    const dg = g - p.g;
    const db = b - p.b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  }
  return closest;
}

/**
 * Audit unique colors in canvas context
 * Returns { count, hexColors }
 */
export function countUniqueColors(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const unique = new Set();
  for (let i = 0; i < data.length; i += 4) {
    const hex = rgbToHex(data[i], data[i + 1], data[i + 2]);
    unique.add(hex);
  }
  return {
    count: unique.size,
    colors: Array.from(unique),
  };
}

/**
 * Convert canvas content to grayscale for value separation testing
 */
export function renderGrayscaleToCanvas(srcCtx, targetCtx, width, height) {
  const imgData = srcCtx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const outData = targetCtx.createImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    // Standard perceptual luminance: 0.299 R + 0.587 G + 0.114 B
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    outData.data[i] = gray;
    outData.data[i + 1] = gray;
    outData.data[i + 2] = gray;
    outData.data[i + 3] = data[i + 3];
  }
  targetCtx.putImageData(outData, 0, 0);
}

// Deterministic Pseudo-Random Generator for fixed stars/ridges
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate 45 fixed pixel stars
const rng = mulberry32(1337);
export const FIXED_STARS = [];
for (let i = 0; i < 45; i++) {
  FIXED_STARS.push({
    x: rng(), // 0 to 1
    y: Math.pow(rng(), 1.8) * 0.42, // concentrated in top 42%
    brightness: rng() > 0.5 ? 2 : 1, // 1 or 2 pixels
    phase: rng() * Math.PI * 2,
  });
}

/**
 * Render the entire silhouette pixel art scene to an offscreen buffer (STEP 1).
 * Width: ~200px, Height: ~280px.
 */
export function renderPixelSceneStep1(
  ctx,
  width,
  height,
  pal,
  frameTick = 0,
  options = {}
) {
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const skyTopY = 0;
  const skyBottomY = Math.floor(height * 0.46);
  const skyHeight = skyBottomY - skyTopY;

  // 1. SKY RENDER WITH 6-STEP BAYER 4x4 DITHERING
  const skySteps = pal.skyRgb; // 6 colors
  const numTransitions = skySteps.length - 1; // 5 transitions

  for (let y = 0; y < skyBottomY; y++) {
    // Determine which transition bracket this y falls into
    const prog = y / skyHeight; // 0 to 1
    const scaledProg = prog * numTransitions; // 0 to 5
    const stepIdx = Math.min(numTransitions - 1, Math.floor(scaledProg));
    const frac = scaledProg - stepIdx; // local fraction between stepIdx and stepIdx+1

    const cA = skySteps[stepIdx];
    const cB = skySteps[stepIdx + 1];

    for (let x = 0; x < width; x++) {
      const bayerVal = BAYER_4X4[y % 4][x % 4];
      const pickB = frac > bayerVal;
      const c = pickB ? cB : cA;

      const idx = (y * width + x) * 4;
      data[idx] = Math.round(c.r);
      data[idx + 1] = Math.round(c.g);
      data[idx + 2] = Math.round(c.b);
      data[idx + 3] = 255;
    }
  }

  // 2. STARS AT NIGHT AND DUSK/DAWN
  if (pal.isNight || pal.isDuskDawn) {
    const starAlpha = pal.isNight ? 1.0 : 0.45;
    const starRamp = pal.haloRgb[1] || pal.haloRgb[0];

    for (const star of FIXED_STARS) {
      const sx = Math.floor(star.x * width);
      const sy = Math.floor(star.y * height);
      if (sx >= 0 && sx < width && sy >= 0 && sy < skyBottomY - 4) {
        // Slow subtle twinkle
        const twinkle = Math.sin(frameTick * 0.04 + star.phase);
        if (twinkle > -0.6) {
          const idx = (sy * width + sx) * 4;
          data[idx] = Math.round(starRamp.r);
          data[idx + 1] = Math.round(starRamp.g);
          data[idx + 2] = Math.round(starRamp.b);
          data[idx + 3] = 255;

          if (star.brightness === 2 && sx + 1 < width && twinkle > 0.4) {
            const idx2 = (sy * width + (sx + 1)) * 4;
            data[idx2] = Math.round(starRamp.r);
            data[idx2 + 1] = Math.round(starRamp.g);
            data[idx2 + 2] = Math.round(starRamp.b);
            data[idx2 + 3] = 255;
          }
        }
      }
    }
  }

  // 3. SUN / MOON DISC WITH CONCENTRIC STEPPED DITHERED HALO
  const sunCenterPixelX = Math.floor(pal.sunX * width);
  const sunCenterPixelY = Math.floor(pal.sunY * height);
  const discRadius = pal.isNight ? 7 : 8;
  const haloRadius = discRadius + 8;
  const outerHaloRadius = haloRadius + 10;

  const coreColor = pal.haloRgb[1];
  const haloColor = pal.haloRgb[0];
  const skyNearSun = pal.skyRgb[1];

  for (let dy = -outerHaloRadius; dy <= outerHaloRadius; dy++) {
    for (let dx = -outerHaloRadius; dx <= outerHaloRadius; dx++) {
      const dist = Math.hypot(dx, dy);
      const px = sunCenterPixelX + dx;
      const py = sunCenterPixelY + dy;

      if (px >= 0 && px < width && py >= 0 && py < skyBottomY) {
        const pIdx = (py * width + px) * 4;
        const bayerVal = BAYER_4X4[Math.abs(py) % 4][Math.abs(px) % 4];

        if (dist <= discRadius) {
          // Disc Core
          data[pIdx] = Math.round(coreColor.r);
          data[pIdx + 1] = Math.round(coreColor.g);
          data[pIdx + 2] = Math.round(coreColor.b);
        } else if (dist <= haloRadius) {
          // Inner stepped halo
          const frac = (dist - discRadius) / (haloRadius - discRadius);
          const pickHalo = frac < bayerVal;
          const chosen = pickHalo ? coreColor : haloColor;
          data[pIdx] = Math.round(chosen.r);
          data[pIdx + 1] = Math.round(chosen.g);
          data[pIdx + 2] = Math.round(chosen.b);
        } else if (dist <= outerHaloRadius) {
          // Outer stepped halo dithered into sky
          const frac = (dist - haloRadius) / (outerHaloRadius - haloRadius);
          if (frac < bayerVal * 0.7) {
            data[pIdx] = Math.round(haloColor.r);
            data[pIdx + 1] = Math.round(haloColor.g);
            data[pIdx + 2] = Math.round(haloColor.b);
          }
        }
      }
    }
  }

  // 4. FIVE STACKED RIDGE SILHOUETTES WITH DITHERED HAZE BANDS
  // Heights span from ~44% to ~72%
  const ridgeBaseY = [
    Math.floor(height * 0.44), // Layer 0: Farthest back (lightest/highest haze)
    Math.floor(height * 0.50), // Layer 1
    Math.floor(height * 0.56), // Layer 2
    Math.floor(height * 0.62), // Layer 3
    Math.floor(height * 0.68), // Layer 4: Fore ridge (deepest)
  ];

  // Procedural ridge contours per column
  for (let rIdx = 0; rIdx < 5; rIdx++) {
    const ridgeCol = pal.ridgesRgb[rIdx];
    const prevCol = rIdx === 0 ? pal.skyRgb[pal.skyRgb.length - 1] : pal.ridgesRgb[rIdx - 1];
    const baseY = ridgeBaseY[rIdx];
    const freq = 0.018 + rIdx * 0.012;
    const amp = 8 - rIdx * 0.8;

    for (let x = 0; x < width; x++) {
      // Clean harmonic wave contour
      const wave =
        Math.sin(x * freq + rIdx * 1.8) * amp +
        Math.cos(x * freq * 1.7 + rIdx * 0.9) * (amp * 0.4);
      const topPixelY = Math.floor(baseY + wave);

      // Thin dithered haze band at crest (3 pixels)
      for (let h = 0; h < 3; h++) {
        const hy = topPixelY - 3 + h;
        if (hy >= 0 && hy < height) {
          const frac = (h + 1) / 4;
          const bayerVal = BAYER_4X4[hy % 4][x % 4];
          if (frac > bayerVal) {
            const hIdx = (hy * width + x) * 4;
            data[hIdx] = Math.round(ridgeCol.r);
            data[hIdx + 1] = Math.round(ridgeCol.g);
            data[hIdx + 2] = Math.round(ridgeCol.b);
          }
        }
      }

      // Solid body of this ridge down to next layer or bottom
      const nextBaseY = rIdx < 4 ? ridgeBaseY[rIdx + 1] + 12 : height;
      for (let y = topPixelY; y < nextBaseY; y++) {
        if (y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          data[idx] = Math.round(ridgeCol.r);
          data[idx + 1] = Math.round(ridgeCol.g);
          data[idx + 2] = Math.round(ridgeCol.b);
          data[idx + 3] = 255;
        }
      }
    }
  }

  // 5. PET MEADOW (Lighter mid-value ground band, bottom ~30%)
  const meadowTopY = Math.floor(height * 0.70);
  const meadowCol = pal.meadowRgb;
  const tuftCol = pal.tuftsRgb;

  for (let x = 0; x < width; x++) {
    // Gentle meadow slope
    const meadowWave = Math.sin(x * 0.025) * 2;
    const topY = Math.floor(meadowTopY + meadowWave);

    // Soft dithered edge transition into ridges (4 pixels)
    for (let h = 0; h < 4; h++) {
      const hy = topY - 4 + h;
      if (hy >= 0 && hy < height) {
        const frac = (h + 1) / 5;
        const bayerVal = BAYER_4X4[hy % 4][x % 4];
        if (frac > bayerVal) {
          const hIdx = (hy * width + x) * 4;
          data[hIdx] = Math.round(meadowCol.r);
          data[hIdx + 1] = Math.round(meadowCol.g);
          data[hIdx + 2] = Math.round(meadowCol.b);
        }
      }
    }

    // Solid meadow
    for (let y = topY; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = Math.round(meadowCol.r);
      data[idx + 1] = Math.round(meadowCol.g);
      data[idx + 2] = Math.round(meadowCol.b);
      data[idx + 3] = 255;
    }
  }

  // Sparse meadow tufts (pixels in tuft color)
  const tuftRng = mulberry32(777);
  for (let t = 0; t < 24; t++) {
    const tx = Math.floor(tuftRng() * (width - 12)) + 6;
    const ty = Math.floor(meadowTopY + 8 + tuftRng() * (height - meadowTopY - 14));
    if (ty < height - 2 && tx < width - 2) {
      // 2-3 pixel tuft
      const tIdx1 = (ty * width + tx) * 4;
      const tIdx2 = ((ty - 1) * width + tx) * 4;
      const tIdx3 = ((ty - 1) * width + tx + 1) * 4;
      [tIdx1, tIdx2, tIdx3].forEach((ti) => {
        data[ti] = Math.round(tuftCol.r);
        data[ti + 1] = Math.round(tuftCol.g);
        data[ti + 2] = Math.round(tuftCol.b);
      });
    }
  }

  // 6. FOREGROUND FRAME SILHOUETTES AT BOTTOM CORNERS ONLY
  // Dark tinted silhouette, leaves meadow center completely clear!
  const fgCol = pal.foregroundRgb;
  for (let x = 0; x < width; x++) {
    // Left corner mound (x < 36)
    if (x < 36) {
      const moundY = height - Math.floor(Math.pow((36 - x) / 36, 1.6) * 14);
      for (let y = moundY; y < height; y++) {
        const idx = (y * width + x) * 4;
        data[idx] = Math.round(fgCol.r);
        data[idx + 1] = Math.round(fgCol.g);
        data[idx + 2] = Math.round(fgCol.b);
      }
    }
    // Right corner mound (x > width - 36)
    if (x > width - 36) {
      const moundY = height - Math.floor(Math.pow((x - (width - 36)) / 36, 1.6) * 16);
      for (let y = moundY; y < height; y++) {
        const idx = (y * width + x) * 4;
        data[idx] = Math.round(fgCol.r);
        data[idx + 1] = Math.round(fgCol.g);
        data[idx + 2] = Math.round(fgCol.b);
      }
    }
  }

  // 7. COMPOSITE TO CANVAS
  ctx.putImageData(imgData, 0, 0);

  // 8. QUANTIZATION CHECK
  // Since every pixel in data was explicitly assigned from pal.activePaletteRgb,
  // the entire frame is guaranteed to be strictly indexed to <= 32 colors!
}
