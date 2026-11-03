import React from "react";

const IconButton = ({
  icon,
  children,
  "aria-label": ariaLabel,
  variant = "ghost",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...rest
}) => {
  const baseStyles =
    "inline-flex items-center justify-center transition-colors duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  const sizeStyles = {
    sm: "w-9 h-9 min-w-[36px] min-h-[36px] text-sm rounded-button",
    md: "w-11 h-11 min-w-[44px] min-h-[44px] text-base rounded-button",
    lg: "w-13 h-13 min-w-[52px] min-h-[52px] text-lg rounded-button",
    round: "w-11 h-11 min-w-[44px] min-h-[44px] text-base rounded-full",
  };

  const variantStyles = {
    ghost:
      "bg-transparent text-text-muted hover:text-text hover:bg-primary-soft/50 active:bg-primary-soft",
    primary:
      "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm",
    secondary:
      "bg-primary-soft text-primary-dark hover:bg-primary-soft/80",
    outline:
      "border border-border bg-surface text-text hover:bg-bg",
    danger:
      "text-danger hover:bg-danger/10 active:bg-danger/20",
    private:
      "bg-private text-white hover:opacity-90 active:opacity-80",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.ghost
      } ${className}`}
      {...rest}
    >
      {icon || children}
    </button>
  );
};

export default IconButton;
