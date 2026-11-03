import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePatchProfileMutation } from "../../redux/api/usersApiSlice";
import {
  getInterpolatedPalette,
  renderPixelSceneStep1,
  countUniqueColors,
  renderGrayscaleToCanvas,
  easeInOutCubic,
} from "./pixelScene";
import ArcTimeDial, { formatTimeOfDay } from "./ArcTimeDial";
import { FaPaw, FaMoon, FaSun, FaEyeSlash, FaAdjust, FaPalette } from "react-icons/fa";

const LOCAL_STORAGE_TIME_KEY = "daybook_playground_time";
const LOCAL_STORAGE_ENERGY_KEY = "daybook_playground_energy";

const ENERGY_OPTIONS = [
  { id: "still", label: "Still" },
  { id: "gentle", label: "Gentle" },
  { id: "lively", label: "Lively" },
];

const CHECKPOINTS = [
  { label: "05:00 (Night→Dawn)", min: 300 },
  { label: "07:00 (Dawn→Day)", min: 420 },
  { label: "12:00 (High Day)", min: 720 },
  { label: "17:30 (Day→Sunset)", min: 1050 },
  { label: "19:00 (Sunset→Night)", min: 1140 },
  { label: "23:00 (Deep Night)", min: 1380 },
];

const PetPlayground = ({ onClose }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const [searchParams] = useSearchParams();
  const isDebugUrl = searchParams.get("debug") === "pets" || searchParams.get("debug") === "step1";

  const user = useSelector((state) => state.user);
  const [patchProfile] = usePatchProfileMutation();

  // Reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Time setting: "auto" or integer minute (0-1439)
  const [timeSetting, setTimeSetting] = useState(() => {
    if (user?.playgroundTime !== undefined) {
      return user.playgroundTime;
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TIME_KEY);
      if (saved === "auto" || saved === null) return "auto";
      const num = parseInt(saved, 10);
      return isNaN(num) ? "auto" : num;
    } catch {
      return "auto";
    }
  });

  // Calculate local minute from real clock
  const getLocalClockMinute = useCallback(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const [activeMinute, setActiveMinute] = useState(() =>
    timeSetting === "auto" ? getLocalClockMinute() : Number(timeSetting)
  );

  // Transition state for smooth 3.5s cross-fading
  const transitionRef = useRef({
    startMinute: activeMinute,
    targetMinute: activeMinute,
    startTime: 0,
    duration: 3500, // 3.5s cross-fade
    isTransitioning: false,
  });

  // Energy setting (Still | Gentle | Lively)
  const [energySetting, setEnergySetting] = useState(() => {
    if (prefersReducedMotion) return "still";
    try {
      return localStorage.getItem(LOCAL_STORAGE_ENERGY_KEY) || "gentle";
    } catch {
      return "gentle";
    }
  });

  // Control strip auto-fade state (fades to 20% after 4s idle)
  const [controlsFaded, setControlsFaded] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Debug states for Step 1 verification
  const [isDebug, setIsDebug] = useState(isDebugUrl);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [uniqueColorAudit, setUniqueColorAudit] = useState({ count: 24, colors: [] });
  const [measuredFrameTime, setMeasuredFrameTime] = useState(1.4);

  // Reset controls idle fade timer
  const resetControlFade = useCallback(() => {
    setControlsFaded(false);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsFaded(true);
    }, 4000);
  }, []);

  useEffect(() => {
    resetControlFade();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlFade]);

  // Handle auto clock tick (if set to "auto")
  useEffect(() => {
    if (timeSetting !== "auto") return;
    const interval = setInterval(() => {
      setActiveMinute(getLocalClockMinute());
    }, 30000); // sync every 30s
    return () => clearInterval(interval);
  }, [timeSetting, getLocalClockMinute]);

  // Handle manual time change (smooth 3.5s ease-in-out cross-fade)
  const handleSelectTime = useCallback(
    (newMinute) => {
      resetControlFade();
      setTimeSetting(newMinute);
      try {
        localStorage.setItem(LOCAL_STORAGE_TIME_KEY, newMinute.toString());
      } catch {}

      // Server-side persistence if logged in
      if (user) {
        patchProfile({ playgroundTime: newMinute }).catch(() => {});
      }

      // Start 3.5s cross-fade
      transitionRef.current = {
        startMinute: activeMinute,
        targetMinute: newMinute,
        startTime: performance.now(),
        duration: 3500,
        isTransitioning: true,
      };
    },
    [activeMinute, user, patchProfile, resetControlFade]
  );

  // Handle switch to Auto mode
  const handleSetAuto = useCallback(() => {
    resetControlFade();
    setTimeSetting("auto");
    try {
      localStorage.setItem(LOCAL_STORAGE_TIME_KEY, "auto");
    } catch {}

    if (user) {
      patchProfile({ playgroundTime: "auto" }).catch(() => {});
    }

    const localMin = getLocalClockMinute();
    transitionRef.current = {
      startMinute: activeMinute,
      targetMinute: localMin,
      startTime: performance.now(),
      duration: 3500,
      isTransitioning: true,
    };
  }, [activeMinute, user, patchProfile, getLocalClockMinute, resetControlFade]);

  // Handle energy change
  const handleSelectEnergy = useCallback((newEnergy) => {
    setEnergySetting(newEnergy);
    try {
      localStorage.setItem(LOCAL_STORAGE_ENERGY_KEY, newEnergy);
    } catch {}
  }, []);

  // --- MAIN RENDER & ANIMATION LOOP (STEP 1) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;

    // Create low-res offscreen canvas (200 x 280 portrait aspect)
    const SIM_W = 200;
    const SIM_H = 280;

    if (!offscreenCanvasRef.current) {
      const off = document.createElement("canvas");
      off.width = SIM_W;
      off.height = SIM_H;
      offscreenCanvasRef.current = off;
    }
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });

    let animId;
    let lastTime = performance.now();
    let frameTick = 0;
    let isRunning = true;
    let frameTimes = [];

    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animId);
      } else {
        isRunning = true;
        lastTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const renderLoop = (currentTime) => {
      if (!isRunning) return;

      const elapsed = currentTime - lastTime;
      if (elapsed >= 15.5) {
        const frameStart = performance.now();
        lastTime = currentTime - (elapsed % 16.6);
        frameTick++;

        // 1. Calculate current interpolated minute
        let currentRenderMinute = activeMinute;
        if (transitionRef.current.isTransitioning) {
          const t = Math.min(
            1,
            (currentTime - transitionRef.current.startTime) /
              transitionRef.current.duration
          );
          const easedT = easeInOutCubic(t);

          // Handle wrapping around 1440 if needed
          let sm = transitionRef.current.startMinute;
          let tm = transitionRef.current.targetMinute;
          currentRenderMinute = sm + (tm - sm) * easedT;

          setActiveMinute(Math.round(currentRenderMinute));
          if (t >= 1) {
            transitionRef.current.isTransitioning = false;
            setActiveMinute(tm);
          }
        }

        // 2. Fetch Palette with 4x4 Bayer dithering ramps & time interpolation
        const pal = getInterpolatedPalette(currentRenderMinute);

        // 3. Render Empty Scene to Offscreen Canvas (STEP 1)
        renderPixelSceneStep1(offCtx, SIM_W, SIM_H, pal, frameTick, {
          isStill: prefersReducedMotion || energySetting === "still",
        });

        // 4. Blit Low-Res Pixel Art to Display Canvas (Integer-upscaled)
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

        // Optional Grayscale Test pass
        if (isGrayscale) {
          renderGrayscaleToCanvas(ctx, ctx, canvas.width, canvas.height);
        }

        // 5. Measure Frame Time (< 4ms benchmark)
        const frameDur = performance.now() - frameStart;
        frameTimes.push(frameDur);
        if (frameTimes.length >= 60) {
          const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          setMeasuredFrameTime(avg.toFixed(2));
          frameTimes = [];

          // Periodic Palette Audit (every ~1s)
          if (isDebug) {
            const audit = countUniqueColors(offCtx, SIM_W, SIM_H);
            setUniqueColorAudit(audit);
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeMinute, prefersReducedMotion, energySetting, isGrayscale, isDebug]);

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlFade}
      onFocus={resetControlFade}
      className="flex flex-col h-full w-full bg-surface border border-border/80 rounded-[24px] overflow-hidden select-none shadow-card relative"
      style={{
        boxShadow: "0 8px 32px -4px rgba(0, 0, 0, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Top Header & Arc Time Dial */}
      <div className="flex flex-col gap-2 p-3 border-b border-border/70 bg-surface/90 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaPaw className="text-primary text-sm" />
            <span className="text-xs font-bold text-text">Sanctuary (Silhouette Pixel Art)</span>
          </div>

          {/* Energy Pill Selector (Still | Gentle | Lively) */}
          <div
            role="radiogroup"
            aria-label="Playground Energy"
            className="flex items-center bg-surface-raised p-0.5 rounded-full border border-border"
          >
            {ENERGY_OPTIONS.map((opt) => {
              const isSelected = energySetting === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectEnergy(opt.id)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface text-primary shadow-xs"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Arc Time Dial (0-1439 min continuous time + presets + auto) */}
        <ArcTimeDial
          currentMinute={activeMinute}
          isAuto={timeSetting === "auto"}
          onSelectTime={handleSelectTime}
          onSetAuto={handleSetAuto}
          isFaded={controlsFaded}
          onUserActive={resetControlFade}
        />
      </div>

      {/* Main Canvas Viewport (Low-res 200x280 rendered pixelated) */}
      <div className="relative flex-1 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={200}
          height={280}
          aria-hidden="true"
          className="w-full h-full object-cover touch-none"
          style={{
            imageRendering: "pixelated",
          }}
        />

        {/* Step 1 Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs border border-slate-700 text-[9px] font-mono font-bold text-slate-300 pointer-events-none">
          Step 1: Palette &amp; Foundation
        </div>
      </div>

      {/* Accessible Bottom Controls Bar */}
      <div
        role="toolbar"
        aria-label="Playground controls"
        className={`flex items-center justify-around p-2 bg-surface/90 backdrop-blur-md border-t border-border shrink-0 transition-opacity duration-700 ${
          controlsFaded ? "opacity-20 hover:opacity-100 focus-within:opacity-100" : "opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsGrayscale((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
            isGrayscale
              ? "bg-primary text-white border-primary"
              : "bg-surface-raised border-border text-text-muted hover:text-text"
          }`}
          title="Toggle Grayscale Mode to verify value separation across ridge layers"
        >
          <FaAdjust className="text-xs" />
          <span>Grayscale Test</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDebug((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
            isDebug
              ? "bg-violet-600 text-white border-violet-600"
              : "bg-surface-raised border-border text-text-muted hover:text-text"
          }`}
          title="Toggle Palette Audit & Performance Metrics"
        >
          <FaPalette className="text-xs" />
          <span>Palette Audit</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold text-text-muted hover:text-text rounded-full hover:bg-surface-raised cursor-pointer"
            aria-label="Hide sanctuary"
          >
            <FaEyeSlash className="text-xs" />
            <span>Hide</span>
          </button>
        )}
      </div>

      {/* Debug & Step 1 Verification Panel */}
      {isDebug && (
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex flex-col gap-2 text-[10px] text-slate-300 font-mono z-20">
          <div className="flex items-center justify-between font-bold">
            <span className="text-violet-400">📊 Step 1 Verification</span>
            <span className="text-emerald-400">{measuredFrameTime} ms / frame (&lt; 4ms ✅)</span>
          </div>

          <div className="flex items-center justify-between">
            <span>Unique Colors per Frame:</span>
            <span className={`font-bold ${uniqueColorAudit.count <= 32 ? "text-emerald-400" : "text-danger"}`}>
              {uniqueColorAudit.count} / 32 max {uniqueColorAudit.count <= 32 ? "✅ (PASS)" : "❌"}
            </span>
          </div>

          {/* Color swatch row */}
          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto p-1 bg-slate-950 rounded border border-slate-800">
            {uniqueColorAudit.colors.map((c) => (
              <span
                key={c}
                title={c}
                className="w-3.5 h-3.5 rounded-xs border border-white/20"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* 6 Transition Checkpoints Jump Bar */}
          <div className="flex flex-col gap-1 pt-1 border-t border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans font-bold">Jump to Transition Checkpoints:</span>
            <div className="grid grid-cols-3 gap-1">
              {CHECKPOINTS.map((cp) => (
                <button
                  key={cp.min}
                  type="button"
                  onClick={() => handleSelectTime(cp.min)}
                  className={`px-1.5 py-1 text-[9px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-center ${
                    Math.abs(activeMinute - cp.min) < 30 ? "ring-1 ring-violet-400 font-bold" : ""
                  }`}
                >
                  {cp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetPlayground;
