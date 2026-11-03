import React from "react";

const Card = ({
  children,
  className = "",
  variant = "default",
  onClick,
  ...rest
}) => {
  const variantStyles = {
    default:
      "bg-surface text-text border border-border rounded-[24px] shadow-card transition-shadow duration-150",
    raised:
      "bg-surface-raised text-text border border-border rounded-[24px]",
    private:
      "bg-surface text-text border-2 border-private/40 rounded-[24px]",
    flat:
      "bg-surface text-text border border-border rounded-[24px]",
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
