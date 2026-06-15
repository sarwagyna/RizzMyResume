"use client";

import { Card } from "@/components/shared/Card";
import { parseWhatChanged } from "@/lib/parseWhatChanged";

interface WhatChangedProps {
  content: string | null;
}

export function WhatChanged({ content }: WhatChangedProps) {
  if (!content) return null;

  const items = parseWhatChanged(content);
  if (items.length === 0) return null;

  return (
    <Card>
      <h2 className="mb-5 text-lg font-semibold text-ink">
        What I changed and why
      </h2>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={`${item.label ?? "item"}-${index}`} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-soft text-xs font-semibold text-muted">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              {item.label && (
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink">
                  {item.label}
                </p>
              )}
              <p className="text-sm leading-relaxed text-body">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
