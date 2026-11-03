import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Pet animation state machine.
 *
 * States: idle -> walk -> idle -> sleep (after ~30s idle)
 * Reactions override: hop (entry saved), celebrate (notification),
 *   sit (sad mood detected), then return to idle.
 *
 * Uses a single rAF loop. Pauses when tab is hidden.
 * prefers-reduced-motion is handled in CSS (static pose).
 */

const POSES = ["idle", "walk", "sleep", "hop", "celebrate", "sit"];
const IDLE_TO_WALK_MS = 8000;    // walk every 8s
const WALK_DURATION_MS = 3000;   // walk takes 3s
const IDLE_TO_SLEEP_MS = 30000;  // sleep after 30s idle
const REACTION_DURATION_MS = 2000;

const FRIENDLY_LINES = [
  "You're doing great today! 🌟",
  "Take a deep breath. You've got this. 💪",
  "I'm glad you're here. 🤗",
  "Remember to hydrate! 💧",
  "You matter, always. 💜",
  "One step at a time. 🐾",
  "Today is a good day to be kind to yourself. 🌸",
  "You're stronger than you think. ✨",
  "I believe in you! 🌈",
  "Every moment is a fresh start. 🌅",
  "Your feelings are valid. 💛",
  "It's okay to rest. 🌙",
  "You're not alone in this. 🤝",
  "Small wins count too! 🎯",
  "Be gentle with yourself today. 🦋",
];

export function usePetAnimation() {
  const [pose, setPose] = useState("idle");
  const [position, setPosition] = useState(0); // 0-100 x position %
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [friendlyLine, setFriendlyLine] = useState("");

  const lastLineIdx = useRef(-1);
  const idleStartRef = useRef(Date.now());
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const reactionQueueRef = useRef([]);

  // Get a non-repeating friendly line
  const getNextLine = useCallback(() => {
    let idx;
    do {
      idx = Math.floor(Math.random() * FRIENDLY_LINES.length);
    } while (idx === lastLineIdx.current && FRIENDLY_LINES.length > 1);
    lastLineIdx.current = idx;
    return FRIENDLY_LINES[idx];
  }, []);

  // Trigger a reaction immediately
  const triggerReaction = useCallback((type) => {
    if (["hop", "celebrate", "sit"].includes(type)) {
      setPose(type);
      const duration = type === "celebrate" ? 2400 : REACTION_DURATION_MS;
      setTimeout(() => {
        setPose("idle");
        idleStartRef.current = Date.now();
      }, duration);
    }
  }, []);

  // Show a friendly line on click
  const handleInteraction = useCallback(() => {
    const line = getNextLine();
    setFriendlyLine(line);
    // Hop on click
    setPose("hop");
    setTimeout(() => {
      setPose("idle");
      idleStartRef.current = Date.now();
    }, REACTION_DURATION_MS);
    // Clear line after 3s
    setTimeout(() => setFriendlyLine(""), 3000);
  }, [getNextLine]);

  useEffect(() => {
    let running = true;

    const scheduleNextWalk = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!running) return;

        // Check for queued reactions first
        if (reactionQueueRef.current.length > 0) {
          const reaction = reactionQueueRef.current.shift();
          setPose(reaction);
          setTimeout(() => {
            if (running) {
              setPose("idle");
              idleStartRef.current = Date.now();
              scheduleNextWalk();
            }
          }, REACTION_DURATION_MS);
          return;
        }

        // Check if should sleep
        const idleTime = Date.now() - idleStartRef.current;
        if (idleTime >= IDLE_TO_SLEEP_MS) {
          setPose("sleep");
          // Wake up on next cycle
          timerRef.current = setTimeout(() => {
            if (running) {
              setPose("idle");
              idleStartRef.current = Date.now();
              scheduleNextWalk();
            }
          }, 15000); // sleep for 15s
          return;
        }

        // Walk
        setPose("walk");
        const newDir = Math.random() > 0.5 ? 1 : -1;
        setDirection(newDir);

        // Animate position
        const startPos = position;
        const targetPos = Math.max(5, Math.min(75, startPos + (newDir * (20 + Math.random() * 30))));

        const walkStart = Date.now();
        const walkLoop = () => {
          if (!running) return;
          const elapsed = Date.now() - walkStart;
          const progress = Math.min(elapsed / WALK_DURATION_MS, 1);
          const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          setPosition(startPos + (targetPos - startPos) * eased);

          if (progress < 1) {
            animFrameRef.current = requestAnimationFrame(walkLoop);
          } else {
            setPose("idle");
            idleStartRef.current = Date.now();
            scheduleNextWalk();
          }
        };
        animFrameRef.current = requestAnimationFrame(walkLoop);
      }, IDLE_TO_WALK_MS + Math.random() * 4000);
    };

    // Pause on tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        idleStartRef.current = Date.now();
        setPose("idle");
        scheduleNextWalk();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    scheduleNextWalk();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    pose,
    position,
    direction,
    friendlyLine,
    handleInteraction,
    triggerReaction,
  };
}
