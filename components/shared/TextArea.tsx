"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { className, label, error, hint, id, showCount, maxLength, value, ...props },
    ref
  ) => {
    const inputId = id || props.name;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink">
            {label}
            {props.required && <span className="text-error"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          className={cn(
            "min-h-[120px] w-full rounded-md border border-hairline bg-canvas px-3.5 py-2.5 text-base text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-surface-soft",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-2">
          <div>
            {hint && !error && <p className="text-sm text-muted">{hint}</p>}
            {error && <p className="text-sm text-error">{error}</p>}
          </div>
          {showCount && maxLength && (
            <p className="text-sm text-muted-soft">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
