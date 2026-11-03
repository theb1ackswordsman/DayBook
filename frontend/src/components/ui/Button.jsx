import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...rest
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-colors duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-full";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5",
    md: "text-sm px-5 py-2.5 min-h-[44px] gap-2",
    lg: "text-base px-6 py-3 min-h-[48px] gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm",
    raised:
      "bg-surface-raised text-text hover:opacity-90 active:opacity-80",
    secondary:
      "bg-surface-raised text-text hover:opacity-90 active:opacity-80",
    outline:
      "border border-border bg-transparent text-text hover:bg-surface-raised",
    ghost:
      "bg-transparent text-text-muted hover:text-text hover:bg-surface-raised",
    danger:
      "bg-danger text-white hover:opacity-90 active:opacity-80 shadow-sm",
    private:
      "bg-private text-white hover:opacity-90 active:opacity-80 shadow-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
