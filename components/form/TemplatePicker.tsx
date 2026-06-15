"use client";

import { clsx } from "clsx";
import {
  RESUME_TEMPLATE_OPTIONS,
  type ResumeTemplateId,
} from "@/lib/templates";

interface TemplatePickerProps {
  value: ResumeTemplateId;
  onChange: (id: ResumeTemplateId) => void;
}

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-ink">Choose a template</h2>
        <p className="mt-1 text-sm text-muted">
          Pick the layout for your generated PDF. You can switch before generating.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESUME_TEMPLATE_OPTIONS.map((template) => {
          const selected = value === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={clsx(
                "rounded-lg border p-4 text-left transition-colors",
                selected
                  ? "border-accent bg-accent/5 ring-1 ring-accent"
                  : "border-border bg-surface hover:border-accent/40"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-ink">{template.name}</span>
                {selected && (
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                    Selected
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">{template.description}</p>
              {template.previewDocx && (
                <a
                  href={template.previewDocx}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-block text-sm text-accent underline-offset-2 hover:underline"
                >
                  Download sample .docx
                </a>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
