import React from "react";

const Textarea = ({
  label,
  id,
  value = "",
  onChange,
  placeholder = "How are you feeling today?",
  required = false,
  error = "",
  helperText = "",
  maxLength = 1000,
  showCharCount = true,
  minRows = 3,
  className = "",
  containerClassName = "",
  disabled = false,
  ...rest
}) => {
  const currentLength = (value || "").length;
  const isNearLimit = maxLength && currentLength >= maxLength * 0.8;
  const isOverLimit = maxLength && currentLength > maxLength;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-text-muted flex items-center justify-between select-none px-1"
        >
          <span className="flex items-center gap-1">
            {label}
            {required && <span className="text-danger">*</span>}
          </span>
          {showCharCount && maxLength && isNearLimit && (
            <span
              className={`text-xs ${
                isOverLimit ? "text-danger font-semibold" : "text-text-muted"
              }`}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </label>
      )}

      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        rows={minRows}
        className={`bg-surface text-text border rounded-[20px] p-4 text-base placeholder:text-text-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-y leading-relaxed ${
          error || isOverLimit
            ? "border-danger focus-visible:outline-danger"
            : "border-border hover:border-text-muted/60"
        } ${className}`}
        {...rest}
      />

      {error ? (
        <p className="text-xs text-danger font-medium mt-0.5 px-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted mt-0.5 px-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Textarea;
