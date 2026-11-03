import React from "react";

const Skeleton = ({
  variant = "text",
  width,
  height,
  className = "",
  count = 1,
}) => {
  const variantStyles = {
    text: "h-4 rounded-button w-full",
    title: "h-6 rounded-button w-3/4",
    avatar: "w-10 h-10 rounded-avatar shrink-0",
    button: "h-11 rounded-button w-28",
    card: "h-44 rounded-card w-full",
  };

  const renderSingle = (index) => (
    <div
      key={index}
      style={{
        width: width,
        height: height,
      }}
      className={`bg-border/60 animate-pulse ${variantStyles[variant] || variantStyles.text} ${className}`}
      aria-hidden="true"
    />
  );

  if (count === 1) return renderSingle(0);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {Array.from({ length: count }).map((_, i) => renderSingle(i))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-5 bg-surface border border-border rounded-card flex flex-col gap-4 w-full animate-pulse shadow-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-avatar bg-border/60 shrink-0" />
        <div className="flex flex-col gap-1.5 w-full">
          <div className="h-4 bg-border/60 rounded-button w-1/3" />
          <div className="h-3 bg-border/40 rounded-button w-1/5" />
        </div>
      </div>
      <div className="space-y-2 mt-1">
        <div className="h-4 bg-border/60 rounded-button w-full" />
        <div className="h-4 bg-border/60 rounded-button w-5/6" />
        <div className="h-4 bg-border/40 rounded-button w-2/3" />
      </div>
    </div>
  );
};

export default Skeleton;
