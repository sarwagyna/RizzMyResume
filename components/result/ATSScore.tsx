"use client";

import { useState } from "react";
import { Card } from "@/components/shared/Card";
import {
  countAtsIssues,
  deriveAtsCategories,
  scoreAccentColor,
  scoreBadgeClasses,
  type AtsCategory,
} from "@/lib/atsBreakdown";
import { cn } from "@/lib/utils";

interface ATSScoreProps {
  score: number | null;
  tips?: string[] | null;
  matched?: string[] | null;
  missed?: string[] | null;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 72;
  const stroke = 12;
  const center = 100;
  const arcLength = Math.PI * radius;
  const progress = (score / 100) * arcLength;
  const accent = scoreAccentColor(score);

  return (
    <div className="relative mx-auto h-[120px] w-[200px]">
      <svg
        viewBox="0 0 200 120"
        className="h-full w-full"
        aria-hidden="true"
      >
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${arcLength}`}
        />
        <line
          x1={center - 28}
          y1={center + 2}
          x2={center + 28}
          y2={center + 2}
          stroke="#d1d5db"
          strokeWidth={1.5}
        />
        <circle cx={center} cy={center + 2} r={3} fill="#374151" />
      </svg>
    </div>
  );
}

function CategoryRow({
  category,
  expanded,
  onToggle,
}: {
  category: AtsCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-hairline-soft first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
        aria-expanded={expanded}
      >
        <span className="text-xs font-semibold tracking-wide text-muted">
          {category.label}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
              scoreBadgeClasses(category.score)
            )}
          >
            {category.score}%
          </span>
          <svg
            viewBox="0 0 20 20"
            className={cn(
              "h-4 w-4 text-muted transition-transform",
              expanded && "rotate-180"
            )}
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {expanded && category.detail && (
        <p className="pb-3.5 pr-8 text-sm leading-relaxed text-body">
          {category.detail}
        </p>
      )}
    </div>
  );
}

export function ATSScore({ score, tips, matched, missed }: ATSScoreProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (score === null || score === undefined) return null;

  const categories = deriveAtsCategories(score, tips, matched, missed);
  const issueCount = countAtsIssues(categories, tips);
  const accent = scoreAccentColor(score);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-hairline-soft px-6 pb-6 pt-8 text-center md:px-8">
        <h2 className="mb-4 text-base font-semibold text-ink">Your Score</h2>
        <ScoreGauge score={score} />
        <p
          className="mt-1 text-4xl font-bold tabular-nums tracking-tight"
          style={{ color: accent }}
        >
          {score}/100
        </p>
        <p className="mt-1 text-sm text-muted">
          {issueCount} {issueCount === 1 ? "Issue" : "Issues"}
        </p>
      </div>

      <div className="px-6 md:px-8">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            expanded={expandedId === category.id}
            onToggle={() =>
              setExpandedId((current) =>
                current === category.id ? null : category.id
              )
            }
          />
        ))}
      </div>

      {tips && tips.length > 0 && (
        <div className="border-t border-hairline-soft bg-surface-soft px-6 py-5 md:px-8">
          <p className="mb-3 text-sm font-semibold text-ink">Quick tips</p>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-sm leading-relaxed text-body"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
