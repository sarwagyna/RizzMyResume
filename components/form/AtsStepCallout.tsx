"use client";

import type { AtsStepHint } from "@/lib/atsFieldHints";

interface AtsStepCalloutProps {
  hint?: AtsStepHint;
}

export function AtsStepCallout({ hint }: AtsStepCalloutProps) {
  if (!hint) return null;

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
      <p className="text-sm font-medium text-ink">ATS feedback for this step</p>
      <p className="mt-1 text-sm leading-relaxed text-body">{hint.message}</p>
      {hint.keywords.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          <span className="font-medium text-ink">Missing JD keywords: </span>
          {hint.keywords.slice(0, 10).join(", ")}
          {hint.keywords.length > 10 ? "…" : ""}
        </p>
      )}
    </div>
  );
}
