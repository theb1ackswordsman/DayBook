import React, { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import IconButton from "./ui/IconButton";

const ThemeController = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <IconButton
      icon={
        theme === "dark" ? (
          <FaSun className="text-accent text-lg" />
        ) : (
          <FaMoon className="text-primary-dark text-lg" />
        )
      }
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      title={theme === "dark" ? "Light theme" : "Dark theme"}
      onClick={toggleTheme}
      variant="ghost"
      size="md"
    />
  );
};

export default ThemeController;
