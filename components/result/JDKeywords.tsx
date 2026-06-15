"use client";

import { Card } from "@/components/shared/Card";

interface JDKeywordsProps {
  matched?: string[] | null;
  missed?: string[] | null;
}

export function JDKeywords({ matched, missed }: JDKeywordsProps) {
  const hasMatched = matched && matched.length > 0;
  const hasMissed = missed && missed.length > 0;

  if (!hasMatched && !hasMissed) return null;

  return (
    <Card variant="soft">
      <h2 className="mb-4 text-lg font-semibold text-ink">
        JD keyword analysis
      </h2>
      <div className="space-y-4">
        {hasMatched && (
          <div>
            <p className="mb-2 text-sm font-medium text-success">
              Matched keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {matched!.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
        {hasMissed && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted">
              Missed keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {missed!.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-surface-strong px-3 py-1 text-sm text-muted"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
