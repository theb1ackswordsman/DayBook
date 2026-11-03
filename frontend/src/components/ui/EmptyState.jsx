import React from "react";
import Button from "./Button";

const EmptyState = ({
  icon,
  title = "No entries yet",
  description = "A quiet space for your thoughts. Whenever you're ready, take a moment to write.",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-surface border border-border rounded-card max-w-lg mx-auto ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center text-2xl mb-4 select-none">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>

      <p className="text-text-muted text-base leading-relaxed mb-6 max-w-md">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
