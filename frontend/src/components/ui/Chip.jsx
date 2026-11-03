import React from "react";

const Chip = ({
  children,
  variant = "default",
  mood,
  clickable = false,
  active = false,
  className = "",
  onClick,
  ...rest
}) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-150 select-none";

  const moodStyles = {
    Happy: "bg-mood-happy text-white",
    "🙂": "bg-mood-happy text-white",
    Calm: "bg-mood-calm text-white",
    "😌": "bg-mood-calm text-white",
    Sad: "bg-mood-sad text-white",
    "😔": "bg-mood-sad text-white",
    Frustrated: "bg-mood-frustrated text-white",
    Angry: "bg-mood-frustrated text-white",
    "😡": "bg-mood-frustrated text-white",
    Hopeful: "bg-mood-hopeful text-white",
    "🌱": "bg-mood-hopeful text-white",
    Grateful: "bg-mood-grateful text-white",
    "✨": "bg-mood-grateful text-white",
  };

  const variantStyles = {
    default: active
      ? "bg-surface-raised text-white"
      : "bg-surface-raised/60 text-text-muted hover:text-text",
    raised:
      "bg-surface-raised text-white font-semibold",
    private:
      "bg-surface-raised text-text-muted font-medium",
    outline: active
      ? "border border-primary text-primary"
      : "border border-border text-text-muted hover:text-text",
  };

  const appliedClass = mood
    ? moodStyles[mood] || "bg-surface-raised text-white"
    : variantStyles[variant] || variantStyles.default;

  const interactiveStyles = clickable
    ? "cursor-pointer hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
    : "";

  return (
    <span
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick && onClick(e);
              }
            }
          : undefined
      }
      className={`${baseStyles} ${appliedClass} ${interactiveStyles} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Chip;
