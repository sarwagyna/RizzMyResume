"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  missing?: boolean;
  missingMessage?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, label, error, hint, missing, missingMessage, id, ...props }, ref) => {
    const inputId = id || props.name;
    const showMissing = missing && !error;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink">
            {label}
            {props.required && <span className="text-error"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 text-base text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-surface-soft",
            (error || showMissing) && "border-warning focus:border-warning focus:ring-warning",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {hint && !error && !showMissing && <p className="text-sm text-muted">{hint}</p>}
        {showMissing && (
          <p className="text-sm text-warning">{missingMessage ?? "Missing — please fill in"}</p>
        )}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
