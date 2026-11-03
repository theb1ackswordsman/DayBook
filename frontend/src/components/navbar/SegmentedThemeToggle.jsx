import React, { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

const SegmentedThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "dark"; // Default dark per specification
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const selectLight = () => setTheme("light");
  const selectDark = () => setTheme("dark");

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className="flex items-center p-1 bg-surface rounded-full border border-border w-full select-none"
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === "light"}
        onClick={selectLight}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
          theme === "light"
            ? "bg-surface-raised text-text shadow-sm"
            : "text-text-muted hover:text-text"
        }`}
      >
        <FaSun className="text-xs text-accent" />
        <span>Light</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === "dark"}
        onClick={selectDark}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
          theme === "dark"
            ? "bg-surface-raised text-text shadow-sm"
            : "text-text-muted hover:text-text"
        }`}
      >
        <FaMoon className="text-xs text-primary" />
        <span>Dark</span>
      </button>
    </div>
  );
};

export default SegmentedThemeToggle;
