/**
 * Activity Director for DayBook Cozy Playground
 *
 * Enforces a calm, serene global activity budget:
 * - At most ONE focal action at a time (ball toss, treat, celebration, social game).
 * - Everyone else rests, idles, sits, or quietly watches.
 * - After any focal action ends, enforces a quiet period of 20-40s before next one can start.
 * - State distribution target: ~70% rest/idle/sleep, ~25% slow walk, <5% run (only during ball chase).
 * - Speech bubble budget: at most 1 visible at a time, at most one every 60-120s with long fade.
 * - Single small heart on petting (no bursts).
 * - Celebration: ONE gentle glow pulse & soft sparkles (no stampedes).
 * - Energy mode scaling: Still (mostly sleeping), Gentle (default calm budget), Lively.
 */

export class ActivityDirector {
  constructor(energy = "gentle") {
    this.energy = energy; // "still" | "gentle" | "lively"
    this.currentFocalAction = null; // null | { type: string, startedAt: number, duration: number }
    this.lastFocalActionEndTime = performance.now() - 30000; // start ready after initial quiet
    this.quietPeriodDuration = this.getRandomQuietPeriod(); // 20 - 40s in ms
    this.lastSpeechTime = performance.now() - 100000;
    this.speechCooldown = 75000; // 60 - 120s
    this.celebrationGlow = 0; // 0 to 1 gentle pulse
    this.metrics = {
      focalActionsCount: 0,
      longestQuietGapMs: 0,
      maxMovingPets: 0,
      activeParticlesCount: 0,
    };
    this._lastQuietMeasureTime = performance.now();
  }

  setEnergy(energy) {
    this.energy = energy;
  }

  getRandomQuietPeriod() {
    if (this.energy === "still") {
      return (40 + Math.random() * 30) * 1000; // 40-70s quiet in Still
    } else if (this.energy === "lively") {
      return (10 + Math.random() * 15) * 1000; // 10-25s in Lively
    }
    // Gentle (default): 20 - 40s
    return (20 + Math.random() * 20) * 1000;
  }

  canStartFocalAction() {
    if (this.energy === "still") return false;
    if (this.currentFocalAction !== null) return false;
    const now = performance.now();
    const timeSinceLast = now - this.lastFocalActionEndTime;
    return timeSinceLast >= this.quietPeriodDuration;
  }

  startFocalAction(type, durationMs = 8000) {
    // If another focal action is already running, reject unless user forced it
    if (this.currentFocalAction && type !== "ball" && type !== "treat") {
      return false;
    }

    const now = performance.now();
    const quietGap = now - this.lastFocalActionEndTime;
    if (quietGap > this.metrics.longestQuietGapMs) {
      this.metrics.longestQuietGapMs = quietGap;
    }

    this.currentFocalAction = {
      type,
      startedAt: now,
      duration: durationMs,
    };
    this.metrics.focalActionsCount++;
    return true;
  }

  endFocalAction() {
    if (this.currentFocalAction) {
      this.currentFocalAction = null;
      this.lastFocalActionEndTime = performance.now();
      this.quietPeriodDuration = this.getRandomQuietPeriod();
    }
  }

  canShowSpeechBubble() {
    const now = performance.now();
    if (this.energy === "still") return false;
    if (now - this.lastSpeechTime >= this.speechCooldown) {
      this.lastSpeechTime = now;
      this.speechCooldown = (60 + Math.random() * 60) * 1000; // 60-120s
      return true;
    }
    return false;
  }

  triggerCelebration() {
    this.celebrationGlow = 1.0;
    this.startFocalAction("celebration", 6000);
  }

  update(deltaMs) {
    const now = performance.now();

    // Fade celebration pulse gently
    if (this.celebrationGlow > 0) {
      this.celebrationGlow = Math.max(0, this.celebrationGlow - (deltaMs / 1000) * 0.4);
    }

    // Auto-expire focal action if time exceeded
    if (this.currentFocalAction) {
      if (now - this.currentFocalAction.startedAt >= this.currentFocalAction.duration) {
        this.endFocalAction();
      }
    } else {
      // Track longest quiet gap live
      const currentGap = now - this.lastFocalActionEndTime;
      if (currentGap > this.metrics.longestQuietGapMs) {
        this.metrics.longestQuietGapMs = currentGap;
      }
    }
  }

  /**
   * Determine next state for an autonomous pet according to budget:
   * Target: ~70% rest/idle/sleep, ~25% slow walk, <5% run (only in ball chase).
   */
  pickNextState(currentPet, isNight = false) {
    if (this.energy === "still") {
      // Still mode: 90% sleep/sit, 10% slow idle
      const roll = Math.random();
      if (roll < 0.6) return { state: "sleep", duration: 30000 + Math.random() * 30000 };
      if (roll < 0.9) return { state: "sit", duration: 15000 + Math.random() * 15000 };
      return { state: "idle", duration: 10000 + Math.random() * 10000 };
    }

    if (isNight) {
      // Night: very sleepy and quiet
      const roll = Math.random();
      if (roll < 0.5) return { state: "sleep", duration: 25000 + Math.random() * 35000 };
      if (roll < 0.8) return { state: "sit", duration: 12000 + Math.random() * 18000 };
      if (roll < 0.95) return { state: "idle", duration: 8000 + Math.random() * 10000 };
      return { state: "walk", duration: 4000 + Math.random() * 6000 }; // 5% walk
    }

    // Gentle Mode (Default):
    // 70% Rest/Idle/Sit/Sleep, 25% Walk, <5% other
    const roll = Math.random();
    if (roll < 0.35) {
      // Idle peacefully (6-15s)
      return { state: "idle", duration: 6000 + Math.random() * 9000 };
    } else if (roll < 0.60) {
      // Sit calmly (8-20s)
      return { state: "sit", duration: 8000 + Math.random() * 12000 };
    } else if (roll < 0.72) {
      // Soft nap / sleep (20-60s)
      return { state: "sleep", duration: 20000 + Math.random() * 40000 };
    } else if (roll < 0.97) {
      // Slow leisurely stroll (25%)
      return { state: "walk", duration: 5000 + Math.random() * 8000 };
    } else {
      // Occasional brief look/play (<3%)
      return { state: "play", duration: 3000 + Math.random() * 2000 };
    }
  }

  getDebugInfo(pets = []) {
    const now = performance.now();
    const timeSinceLastSec = ((now - this.lastFocalActionEndTime) / 1000).toFixed(1);
    const quietRemainingSec = Math.max(
      0,
      ((this.quietPeriodDuration - (now - this.lastFocalActionEndTime)) / 1000).toFixed(1)
    );

    const statesCount = pets.reduce((acc, p) => {
      acc[p.state] = (acc[p.state] || 0) + 1;
      return acc;
    }, {});

    return {
      focalAction: this.currentFocalAction ? this.currentFocalAction.type : "None (Quiet period)",
      timeSinceLastSec: `${timeSinceLastSec}s`,
      quietRemainingSec: this.currentFocalAction ? "Active" : `${quietRemainingSec}s`,
      statesCount,
      energy: this.energy,
      longestQuietGapSec: (this.metrics.longestQuietGapMs / 1000).toFixed(1) + "s",
      focalActionsTotal: this.metrics.focalActionsCount,
    };
  }
}
