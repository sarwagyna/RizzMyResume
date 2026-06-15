"use client";

import { ResumeFormValues, getQualityWarnings } from "@/lib/validators/resumeInput";
import { cn } from "@/lib/utils";

interface QualityWarningsProps {
  data: ResumeFormValues;
  className?: string;
}

export function QualityWarnings({ data, className }: QualityWarningsProps) {
  const warnings = getQualityWarnings(data);

  if (warnings.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-warning/30 bg-warning/10 p-4",
        className
      )}
      role="alert"
    >
      <p className="mb-2 text-sm font-semibold text-ink">
        Input quality warnings
      </p>
      <ul className="list-inside list-disc space-y-1 text-sm text-body">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">
        You can still proceed — these are suggestions to improve your resume.
      </p>
    </div>
  );
}
