/**
 * Calm Companion Engine for DayBook Playground
 * Inspired by the visual and motion principles of Alto's Odyssey:
 *
 * - Layered soft silhouettes with atmospheric haze
 * - Generous empty space (upper 60% sky and hills, lower 40% tranquil meadow)
 * - Extremely slow, serene easing motion (walk ~14 px/s, run ~40 px/s)
 * - Restrained palette (3-4 hues per time of day), no harsh outlines, no vignettes
 * - At most 8 tiny nearly-static flowers, <=2 slow butterflies, <=10 fireflies, <=3 petals
 * - Only Tree, Pond, Bed visible; ball/treat appear only when tossed and fade out
 * - Single small heart on petting; subtle squash-and-stretch (<=6%)
 */

import { SCENE_PALETTES, interpolatePalettes, getAutoTimeKey } from "./scenePalette";

export const FRIENDLY_LINES = [
  "You're doing great today. 🌟",
  "Take a slow, deep breath. 🌿",
  "Glad you're resting here. 🌸",
  "One gentle moment at a time. 🐾",
  "It's okay to slow down and breathe. ☁️",
  "Peace is found in small steps. 🍃",
  "A quiet sanctuary for your thoughts. 💜",
  "Resting is productive too. 🌙",
  "Be kind to yourself today. ✨",
  "The world can wait a moment. 🕊️",
];

/**
 * Slow Parallax Clouds (1-3 px/s)
 */
export class CalmCloud {
  constructor(x, y, speed, scale, opacity) {
    this.x = x;
    this.y = y;
    this.speed = speed; // 0.02 - 0.05 px/frame (~1.2 - 3 px/s)
    this.scale = scale;
    this.opacity = opacity;
  }

  update(width, reducedMotion) {
    if (!reducedMotion) {
      this.x += this.speed;
      if (this.x > width + 50) {
        this.x = -60;
      }
    }
  }

  draw(ctx, isNight) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.fillStyle = isNight
      ? `rgba(255, 255, 255, ${this.opacity * 0.15})`
      : `rgba(255, 255, 255, ${this.opacity * 0.65})`;

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.arc(14, -5, 13, 0, Math.PI * 2);
    ctx.arc(26, 1, 12, 0, Math.PI * 2);
    ctx.arc(-12, 3, 10, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Tiny, nearly-static flowers (max 8, subtle sway)
 */
export class CalmFlower {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.phase = Math.random() * Math.PI * 2;
  }

  draw(ctx, timeTick, reducedMotion) {
    // Barely noticeable sway (<0.6px)
    const sway = reducedMotion ? 0 : Math.sin(timeTick * 0.015 + this.phase) * 0.5;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Tiny stem
    ctx.strokeStyle = "rgba(70, 110, 75, 0.4)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(sway, -5);
    ctx.stroke();

    // Soft tiny petal bud
    ctx.translate(sway, -5);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Slow, gentle butterfly (<=2, day only)
 */
export class CalmButterfly {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.vx = 0.12 + Math.random() * 0.08; // very slow ~8 px/s
    this.color = ["#F7B2BD", "#C9B6E4", "#FFD3B6"][Math.floor(Math.random() * 3)];
    this.phase = Math.random() * Math.PI * 2;
  }

  update(width, grassTop, grassBottom, reducedMotion) {
    if (reducedMotion) return;
    this.x += this.vx;
    this.y = this.baseY + Math.sin(this.phase) * 4;
    this.phase += 0.03;

    if (this.x > width + 15) {
      this.x = -15;
      this.baseY = grassTop + 5 + Math.random() * (grassBottom - grassTop - 10);
    }
  }

  draw(ctx, timeTick) {
    const flap = Math.abs(Math.sin(timeTick * 0.1));
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(flap, 1);
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.ellipse(-1.5, -1.5, 2.2, 3, -0.3, 0, Math.PI * 2);
    ctx.ellipse(1.5, -1.5, 2.2, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Slow drifting firefly with soft glow (<=10, night only)
 */
export class CalmFirefly {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.12;
    this.vy = (Math.random() - 0.5) * 0.12;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(width, grassTop, grassBottom, reducedMotion) {
    if (reducedMotion) return;
    this.x += this.vx;
    this.y += this.vy;
    this.phase += 0.025;

    if (this.x < 15 || this.x > width - 15) this.vx *= -1;
    if (this.y < grassTop - 15 || this.y > grassBottom) this.vy *= -1;
  }

  draw(ctx) {
    const glow = (Math.sin(this.phase) + 1) * 0.5;
    if (glow < 0.15) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 5);
    grad.addColorStop(0, `rgba(244, 239, 216, ${0.7 * glow})`);
    grad.addColorStop(1, "rgba(244, 239, 216, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * glow})`;
    ctx.fillRect(-0.5, -0.5, 1, 1);
    ctx.restore();
  }
}

/**
 * Falling petal (<=3, slow and serene)
 */
export class CalmPetal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0.1 + Math.random() * 0.1;
    this.vy = 0.15 + Math.random() * 0.12;
    this.rot = Math.random() * Math.PI * 2;
    this.vrot = (Math.random() - 0.5) * 0.015;
    this.color = "rgba(247, 178, 189, 0.75)";
  }

  update(width, height, reducedMotion) {
    if (reducedMotion) return;
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.vrot;

    if (this.y > height + 8 || this.x > width + 8) {
      this.x = Math.random() * (width * 0.6);
      this.y = -8;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.5, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Single small heart particle on petting (no burst)
 */
export class SingleHeartParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = -0.4;
    this.alpha = 1;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.012;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.fillStyle = "#F7B2BD";

    ctx.beginPath();
    ctx.moveTo(0, 1.5);
    ctx.bezierCurveTo(-2, -1.5, -4, 0.8, 0, 4);
    ctx.bezierCurveTo(4, 0.8, 2, -1.5, 0, 1.5);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Soft celebration sparkle
 */
export class SoftSparkleParticle {
  constructor(x, y) {
    this.x = x + (Math.random() * 16 - 8);
    this.y = y + (Math.random() * 16 - 8);
    this.alpha = 1;
    this.rot = Math.random() * Math.PI;
  }

  update() {
    this.alpha -= 0.018;
    this.rot += 0.03;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = "#FFF1E0";

    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(0, 0, 3, 0);
    ctx.quadraticCurveTo(0, 0, 0, 3);
    ctx.quadraticCurveTo(0, 0, -3, 0);
    ctx.quadraticCurveTo(0, 0, 0, -3);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Quiet Tree silhouette (Alto's style - soft rounded flat canopy)
 */
export function drawCalmTree(ctx, x, y, pal, frameTick) {
  ctx.save();
  ctx.translate(x, y);

  // Soft root shadow
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.fill();

  // Gentle trunk
  ctx.fillStyle = pal.treeTrunk;
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.quadraticCurveTo(-3, -20, -5, -42);
  ctx.quadraticCurveTo(0, -38, 5, -42);
  ctx.quadraticCurveTo(3, -20, 5, 2);
  ctx.closePath();
  ctx.fill();

  // Branch with lantern
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(9, -34, 14, -28);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = pal.treeTrunk;
  ctx.stroke();

  // Hanging wire
  ctx.strokeStyle = "rgba(100, 100, 100, 0.5)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(14, -28);
  ctx.lineTo(14, -22);
  ctx.stroke();

  // Lantern Glow at night
  if (pal.isNight && pal.lanternGlow) {
    const pulse = (Math.sin(frameTick * 0.04) + 1) * 0.5;
    const lGrad = ctx.createRadialGradient(14, -19, 1, 14, -19, 14);
    lGrad.addColorStop(0, pal.lanternGlow);
    lGrad.addColorStop(1, "rgba(244, 239, 216, 0)");
    ctx.fillStyle = lGrad;
    ctx.beginPath();
    ctx.arc(14, -19, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lantern body
  ctx.fillStyle = "#E0A96D";
  ctx.fillRect(12.5, -22, 3, 5);
  ctx.fillStyle = "#FFF6D9";
  ctx.fillRect(13.2, -21, 1.6, 3);

  // Canopy (soft rounded flat cloud shapes)
  ctx.fillStyle = pal.treeLeaves;
  ctx.beginPath();
  ctx.arc(-12, -52, 13, 0, Math.PI * 2);
  ctx.arc(10, -54, 14, 0, Math.PI * 2);
  ctx.arc(-2, -62, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Serene Pond silhouette (quiet water reflection)
 */
export function drawCalmPond(ctx, x, y, pal, frameTick) {
  ctx.save();
  ctx.translate(x, y);

  // Soft shore
  ctx.fillStyle = pal.pondEdge;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 12, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Water
  ctx.fillStyle = pal.pondWater;
  ctx.beginPath();
  ctx.ellipse(0, -0.8, 23, 10, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Gentle minimal ripple
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 0.8;
  const ripple = (frameTick * 0.015) % 1;
  ctx.beginPath();
  ctx.ellipse(2, 0, 7 + ripple * 7, 3 + ripple * 3, 0.08, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

/**
 * Cozy Bed (peaceful resting spot)
 */
export function drawCalmBed(ctx, x, y, pal) {
  ctx.save();
  ctx.translate(x, y);

  // Soft shadow
  ctx.beginPath();
  ctx.ellipse(0, 3, 18, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.fill();

  // Cushion base
  ctx.fillStyle = pal.bedCushion;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Blanket throw
  ctx.fillStyle = pal.bedBlanket;
  ctx.beginPath();
  ctx.ellipse(2, -0.8, 11, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pillow
  ctx.fillStyle = pal.bedPillow;
  ctx.beginPath();
  ctx.ellipse(-7, -1.5, 4, 2.5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Fading Tossed Prop (Ball / Treat) - appears only when thrown, fades out when finished
 */
export function drawCalmProp(ctx, prop) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, prop.alpha);
  ctx.translate(prop.x, prop.y);

  if (prop.type === "treat") {
    ctx.fillStyle = "#E8C8A8";
    ctx.fillRect(-3, -1.5, 6, 3);
    ctx.fillRect(-4.5, -2.5, 2, 2);
    ctx.fillRect(-4.5, 0.5, 2, 2);
    ctx.fillRect(2.5, -2.5, 2, 2);
    ctx.fillRect(2.5, 0.5, 2, 2);
  } else {
    // Red toy ball
    ctx.beginPath();
    ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = "#E57373";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 3.8, -0.4, 0.4);
    ctx.fillStyle = "#FFF9C4";
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Calm Pixel Dog (scaled ~0.82 for more spacious Alto-style negative space)
 * Squash-and-stretch <= 6% (0.94 - 1.06)
 */
const DOG_PALETTE = {
  fur: "#D4A574",
  furShadow: "#B88656",
  furLight: "#E8C49C",
  ear: "#9C6E42",
  eye: "#2C221C",
  nose: "#342218",
  tongue: "#F7B2BD",
  white: "#FFFFFF",
};

export function drawCalmDog(ctx, pet, frameTick) {
  const {
    state,
    scaleX = 1,
    squashX = 1,
    squashY = 1,
    isLifted = false,
  } = pet;

  // Subtler squash & stretch (clamped to <=6%)
  const clampedSquashX = Math.max(0.94, Math.min(1.06, squashX));
  const clampedSquashY = Math.max(0.94, Math.min(1.06, squashY));

  ctx.save();
  ctx.translate(pet.x, pet.y);
  // Scale down slightly (~0.82) for more negative space
  ctx.scale(scaleX * clampedSquashX * 0.82, clampedSquashY * 0.82);

  const p = DOG_PALETTE;
  // Slower 6-8 fps sprite animation
  const step = Math.floor(frameTick / 8) % 4;
  const isBlinking = state === "idle" && (Math.floor(frameTick / 25) % 8 === 0);
  const isSleeping = state === "sleep";
  const isRunning = state === "run";
  const isSitting = state === "sit";
  const isPlaying = state === "play";

  const earTwitch = state === "idle" && (Math.floor(frameTick / 20) % 11 === 0) ? -1 : 0;
  const tailWag = (isRunning || isPlaying || isLifted)
    ? (Math.sin(frameTick * 0.3) * 2)
    : (state === "walk" ? Math.sin(frameTick * 0.15) * 1.5 : 0);

  const bodyY = isSitting ? -9 : -12;
  const bodyH = isSitting ? 9 : 8;

  // Tail
  ctx.fillStyle = p.fur;
  ctx.fillRect(-9, bodyY + 2 + tailWag, 3, 3);
  ctx.fillRect(-11, bodyY + tailWag, 3, 3);

  // Back legs
  ctx.fillStyle = p.furShadow;
  if (isLifted) {
    ctx.fillRect(-5, 0, 3, 4);
    ctx.fillRect(3, 0, 3, 4);
  } else if (isSitting || isSleeping) {
    ctx.fillRect(-6, -2, 5, 2);
    ctx.fillRect(2, -2, 5, 2);
  } else {
    const legOffset = (state === "walk" || isRunning) ? (step === 0 ? 1.5 : step === 2 ? -1.5 : 0) : 0;
    ctx.fillRect(-6 + legOffset, -3, 3, 4);
    ctx.fillRect(3 - legOffset, -3, 3, 4);
  }

  // Body
  ctx.fillStyle = p.fur;
  ctx.fillRect(-7, bodyY, 14, bodyH);
  ctx.fillStyle = p.furLight;
  ctx.fillRect(-3, bodyY + 1, 6, bodyH - 2);

  // Front legs
  ctx.fillStyle = p.fur;
  if (!isLifted && !isSitting && !isSleeping) {
    const frontLegOffset = (state === "walk" || isRunning) ? (step === 1 ? 1.5 : step === 3 ? -1.5 : 0) : 0;
    ctx.fillRect(-4 + frontLegOffset, -3, 3, 4);
    ctx.fillRect(2 - frontLegOffset, -3, 3, 4);
  }

  // Head
  const headBob = (state === "walk" || isRunning) ? (step % 2 === 0 ? -0.8 : 0) : 0;
  const headY = bodyY - 8 + headBob;
  ctx.fillStyle = p.fur;
  ctx.fillRect(-6, headY, 12, 10);
  ctx.fillStyle = p.furLight;
  ctx.fillRect(-4, headY + 4, 8, 5);

  // Ears
  ctx.fillStyle = p.ear;
  ctx.fillRect(-8, headY + 1 + earTwitch, 3, 5);
  ctx.fillRect(5, headY + 1 - earTwitch, 3, 5);

  // Nose
  ctx.fillStyle = p.nose;
  ctx.fillRect(-1.5, headY + 5, 3, 2);

  // Eyes
  if (isSleeping || isBlinking) {
    ctx.fillStyle = p.nose;
    ctx.fillRect(-4, headY + 3, 2, 1);
    ctx.fillRect(2, headY + 3, 2, 1);
  } else {
    ctx.fillStyle = p.eye;
    ctx.fillRect(-4, headY + 2, 2, 2);
    ctx.fillRect(1.5, headY + 2, 2, 2);
    ctx.fillStyle = p.white;
    ctx.fillRect(-4, headY + 2, 0.8, 0.8);
    ctx.fillRect(1.5, headY + 2, 0.8, 0.8);
  }

  // Soft sleep zzz
  if (isSleeping) {
    const zOffset = (frameTick * 0.03) % 4;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "bold 7px monospace";
    ctx.fillText("z", 7 + zOffset, headY - 2 - zOffset * 1.5);
  }

  ctx.restore();
}
