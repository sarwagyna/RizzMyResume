export interface AtsCategory {
  id: string;
  label: string;
  score: number;
  detail?: string;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tipMatching(tips: string[], pattern: RegExp): string | undefined {
  return tips.find((tip) => pattern.test(tip));
}

export function deriveAtsCategories(
  score: number,
  tips?: string[] | null,
  matched?: string[] | null,
  missed?: string[] | null
): AtsCategory[] {
  const tipsList = tips ?? [];
  const matchedCount = matched?.length ?? 0;
  const missedCount = missed?.length ?? 0;
  const keywordTotal = matchedCount + missedCount;

  const tailoring =
    keywordTotal > 0
      ? clamp((matchedCount / keywordTotal) * 100)
      : clamp(score);

  const atsEssentials =
    keywordTotal > 0
      ? clamp(score - (missedCount / keywordTotal) * 35)
      : clamp(score - 8);

  const issuePenalty = Math.min(tipsList.length * 4, 24);

  return [
    {
      id: "content",
      label: "CONTENT",
      score: clamp(score + 4),
      detail:
        tipMatching(tipsList, /content|bullet|verb|word|phrase/i) ??
        "Bullet quality, action verbs, and specificity.",
    },
    {
      id: "sections",
      label: "SECTIONS",
      score: clamp(score + 5),
      detail:
        tipMatching(tipsList, /section|structure|order|layout/i) ??
        "Section order, headings, and one-page layout.",
    },
    {
      id: "ats_essentials",
      label: "ATS ESSENTIALS",
      score: atsEssentials,
      detail:
        missedCount > 0
          ? `Missing keywords: ${missed!.slice(0, 4).join(", ")}${missedCount > 4 ? "…" : ""}`
          : tipMatching(tipsList, /ats|format|keyword|parse/i) ??
            "Format compatibility and keyword coverage.",
    },
    {
      id: "hr_red_flags",
      label: "HR RED FLAGS",
      score: clamp(score - issuePenalty),
      detail:
        tipMatching(tipsList, /ban|clich|generic|flag|phrase/i) ??
        tipsList[0] ??
        "Banned phrases and generic language checks.",
    },
    {
      id: "discrimination",
      label: "DISCRIMINATION",
      score: clamp(score + 2),
      detail: "Personal data, photos, and bias-prone fields removed.",
    },
    {
      id: "seniority",
      label: "SENIORITY",
      score: clamp(score - 3),
      detail: "Role title realism for student / fresher level.",
    },
    {
      id: "tailoring",
      label: "TAILORING",
      score: tailoring,
      detail:
        keywordTotal > 0
          ? `${matchedCount} of ${keywordTotal} JD keywords matched.`
          : "No job description provided — general engineering focus applied.",
    },
  ];
}

export function countAtsIssues(
  categories: AtsCategory[],
  tips?: string[] | null
): number {
  const weakCategories = categories.filter((category) => category.score < 70).length;
  return Math.max(weakCategories, tips?.length ?? 0);
}

export function scoreAccentColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

export function scoreBadgeClasses(score: number): string {
  if (score >= 80) return "bg-success/10 text-success";
  if (score >= 60) return "bg-warning/10 text-warning";
  return "bg-error/10 text-error";
}
