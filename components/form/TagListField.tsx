"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";

interface TagListFieldProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  missing?: boolean;
  missingMessage?: string;
  required?: boolean;
}

export function TagListField({
  label,
  placeholder,
  values,
  onChange,
  error,
  missing,
  missingMessage,
  required,
}: TagListFieldProps) {
  const [input, setInput] = useState("");

  const addValue = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...values, trimmed]);
    setInput("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <TextInput
          label={label}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          error={error}
          missing={missing}
          missingMessage={missingMessage}
          required={required}
          className="flex-1"
        />
        <div className="flex items-end">
          <Button type="button" onClick={addValue}>
            Add
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-2 rounded-full bg-surface-card px-3 py-1 text-sm"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="text-muted hover:text-ink"
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
