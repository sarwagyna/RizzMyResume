"use client";

import { Button } from "@/components/shared/Button";
import { scoreAccentColor } from "@/lib/atsBreakdown";
import {
  countAtsReviewAreas,
  type AtsFieldHint,
  type AtsStepHint,
} from "@/lib/atsFieldHints";

interface AtsImproveBannerProps {
  score: number;
  hints: AtsFieldHint[];
  stepHints?: AtsStepHint[];
  onDismiss: () => void;
}

export function AtsImproveBanner({
  score,
  hints,
  stepHints = [],
  onDismiss,
}: AtsImproveBannerProps) {
  const accent = scoreAccentColor(score);
  const areaCount = countAtsReviewAreas(hints, stepHints);

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">
            Improve your ATS score ({areaCount}{" "}
            {areaCount === 1 ? "area" : "areas"} to review)
          </p>
          <p className="mt-1 text-sm text-body">
            Your preview scored{" "}
            <span className="font-semibold" style={{ color: accent }}>
              {score}/100
            </span>
            . Fields highlighted below show what to edit based on the ATS
            feedback. Regenerate the preview after updating.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 self-start"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
