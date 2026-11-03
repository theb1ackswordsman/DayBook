import React from "react";

const Input = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  helperText = "",
  className = "",
  containerClassName = "",
  disabled = false,
  ...rest
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-text-muted flex items-center gap-1 select-none px-1"
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`bg-surface text-text border rounded-full px-4 py-2.5 min-h-[44px] text-sm placeholder:text-text-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? "border-danger focus-visible:outline-danger" : "border-border hover:border-text-muted/60"
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

export default Input;
