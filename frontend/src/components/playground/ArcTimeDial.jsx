import React, { useRef, useState, useEffect, useCallback } from "react";
import { FaSun, FaMoon, FaClock } from "react-icons/fa";

/**
 * Format minute (0-1439) into 12-hour string "HH:MM AM/PM"
 */
export function formatTimeOfDay(minute) {
  const m = Math.floor(minute % 1440);
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins < 10 ? `0${mins}` : mins;
  return `${displayHours}:${displayMins} ${ampm}`;
}

const ArcTimeDial = ({
  currentMinute,
  isAuto,
  onSelectTime,
  onSetAuto,
  isFaded = false,
  onUserActive,
}) => {
  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Arc path constants (SVG coordinate space 120 x 48)
  const CX = 60;
  const CY = 42;
  const RX = 46;
  const RY = 26;

  // Map minute 0-1439 onto arc angle
  // Let minute 0 (midnight) start at bottom right, 360 (dawn) at right, 720 (day noon) at top peak, 1080 (sunset) at left
  // Angle theta: 0 at right, PI/2 at top, PI at left
  // Map minute:
  // Daytime arc (dawn 360 to sunset 1080): 0 to PI
  // Let's use a 180-degree arch where:
  // Left: Sunset/Night (~18:00 to 24:00)
  // Center-Top: Noon (12:00)
  // Right: Dawn/Morning (06:00)
  const fraction = (currentMinute % 1440) / 1440; // 0 to 1
  // Map fraction to angle theta on upper ellipse:
  // theta from PI (left) down to 0 (right)
  const theta = Math.PI - fraction * Math.PI;
  const thumbX = CX + RX * Math.cos(theta);
  const thumbY = CY - RY * Math.sin(theta);

  const isSun = currentMinute >= 360 && currentMinute <= 1140;

  // Handle drag on arc
  const handlePointer = useCallback(
    (e) => {
      if (!dialRef.current) return;
      onUserActive?.();
      const rect = dialRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      const px = clientX - rect.left;
      const py = clientY - rect.top;

      // Scale to SVG 120x48 space
      const svgX = (px / rect.width) * 120;
      const svgY = (py / rect.height) * 48;

      const dx = svgX - CX;
      const dy = CY - svgY; // up is positive

      // Angle from horizontal right: 0 to PI
      let angle = Math.atan2(dy, -dx); // -dx so left is 0, right is PI
      if (angle < 0) angle = 0;
      if (angle > Math.PI) angle = Math.PI;

      // fraction: 0 at left, 1 at right
      const frac = angle / Math.PI;
      const targetMin = Math.round(frac * 1439);
      onSelectTime(targetMin);
    },
    [onSelectTime, onUserActive]
  );

  const handlePointerDown = (e) => {
    setIsDragging(true);
    handlePointer(e);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      handlePointer(e);
    };
    const handleUp = () => {
      if (isDragging) setIsDragging(false);
    };
    if (isDragging) {
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    }
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging, handlePointer]);

  return (
    <div
      onMouseEnter={onUserActive}
      onFocus={onUserActive}
      className={`flex flex-col items-center gap-1.5 transition-opacity duration-500 select-none ${
        isFaded ? "opacity-25 hover:opacity-100 focus-within:opacity-100" : "opacity-100"
      }`}
    >
      {/* Arc Dial and Time Pill */}
      <div
        ref={dialRef}
        onPointerDown={handlePointerDown}
        className="relative w-36 h-14 cursor-pointer flex flex-col items-center justify-end touch-none"
        title="Drag the sun/moon to change time of day"
      >
        <svg
          viewBox="0 0 120 48"
          className="w-full h-full overflow-visible"
        >
          {/* Subtle Arc Track */}
          <path
            d={`M ${CX - RX} ${CY} A ${RX} ${RY} 0 0 1 ${CX + RX} ${CY}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 3"
          />

          {/* Active Thumb (Sun or Moon) */}
          <g transform={`translate(${thumbX}, ${thumbY})`}>
            <circle
              r="7"
              fill={isSun ? "#FFD27A" : "#F4E9B8"}
              stroke="rgba(15, 23, 42, 0.7)"
              strokeWidth="1.5"
              className="filter drop-shadow-sm transition-transform active:scale-125"
            />
            {isSun ? (
              <circle r="3" fill="#FFF6C8" />
            ) : (
              <circle r="2.5" fill="#141A48" cx="2" cy="-1" />
            )}
          </g>
        </svg>

        {/* Current Time Display Badge */}
        <div className="absolute bottom-0 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 text-[10px] font-mono font-bold text-slate-200 flex items-center gap-1 shadow-sm">
          {isSun ? <FaSun className="text-amber-400 text-[9px]" /> : <FaMoon className="text-sky-300 text-[9px]" />}
          <span>{formatTimeOfDay(currentMinute)}</span>
          {isAuto && <span className="text-[9px] text-violet-400 font-sans">(Auto)</span>}
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-1 p-0.5 bg-slate-900/75 backdrop-blur-md rounded-full border border-slate-700/70 text-[10px] font-medium text-slate-300">
        <button
          type="button"
          onClick={() => {
            onUserActive?.();
            onSelectTime(360);
          }}
          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
            !isAuto && Math.abs(currentMinute - 360) < 60
              ? "bg-violet-600 text-white font-bold"
              : "hover:text-white"
          }`}
        >
          Dawn
        </button>
        <button
          type="button"
          onClick={() => {
            onUserActive?.();
            onSelectTime(720);
          }}
          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
            !isAuto && Math.abs(currentMinute - 720) < 90
              ? "bg-sky-600 text-white font-bold"
              : "hover:text-white"
          }`}
        >
          Day
        </button>
        <button
          type="button"
          onClick={() => {
            onUserActive?.();
            onSelectTime(1080);
          }}
          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
            !isAuto && Math.abs(currentMinute - 1080) < 60
              ? "bg-amber-600 text-white font-bold"
              : "hover:text-white"
          }`}
        >
          Sunset
        </button>
        <button
          type="button"
          onClick={() => {
            onUserActive?.();
            onSelectTime(1380);
          }}
          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
            !isAuto && (currentMinute >= 1260 || currentMinute < 240)
              ? "bg-indigo-600 text-white font-bold"
              : "hover:text-white"
          }`}
        >
          Night
        </button>
        <button
          type="button"
          onClick={() => {
            onUserActive?.();
            onSetAuto();
          }}
          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-0.5 ${
            isAuto ? "bg-emerald-600 text-white font-bold" : "hover:text-white text-slate-400"
          }`}
          title="Sync with your local clock"
        >
          <FaClock className="text-[8px]" /> Auto
        </button>
      </div>
    </div>
  );
};

export default ArcTimeDial;
