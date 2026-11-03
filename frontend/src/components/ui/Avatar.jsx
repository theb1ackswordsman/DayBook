import React from "react";
import { FaUser } from "react-icons/fa";
import { AVATAR_PRESETS } from "../../config/profilePresets";

const Avatar = ({
  src,
  alt = "User avatar",
  name = "",
  size = "md",
  anonymous = false,
  preset = "initials",
  className = "",
  ...rest
}) => {
  const sizeStyles = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-xl",
    xl: "w-20 h-20 text-3xl",
    "2xl": "w-24 h-24 text-4xl sm:w-28 sm:h-28",
  };

  const getInitial = (nameStr) => {
    if (!nameStr) return "?";
    return nameStr.trim().charAt(0).toUpperCase();
  };

  const presetObj = AVATAR_PRESETS.find((p) => p.id === preset);
  const symbol = presetObj && presetObj.symbol ? presetObj.symbol : null;

  return (
    <div
      className={`rounded-[28%] ring-3 ring-border/80 aspect-square overflow-hidden flex items-center justify-center font-bold select-none shrink-0 ${
        anonymous
          ? "bg-surface-raised text-text-muted"
          : "bg-surface-raised text-white"
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      aria-label={anonymous ? "Anonymous user avatar" : `${name || "User"} avatar`}
      {...rest}
    >
      {anonymous ? (
        <FaUser className="opacity-70 text-xs" />
      ) : src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : symbol ? (
        <span className="leading-none select-none">{symbol}</span>
      ) : (
        <span>{getInitial(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
