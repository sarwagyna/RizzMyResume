import type { FormStep } from "@/lib/types";
import { FORM_STEPS } from "@/lib/types";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";
import type { ResumeTemplateId } from "@/lib/templates";
import { isProfessionalTemplate } from "@/lib/templateFormRules";

export const ATS_IMPROVE_THRESHOLD = 80;

export interface AtsFeedback {
  score: number;
  tips: string[];
  matched: string[];
  missed: string[];
}

export interface AtsFieldHint {
  path: string;
  message: string;
  step: FormStep;
}

export interface AtsStepHint {
  step: FormStep;
  message: string;
  keywords: string[];
}

const SOFT_KEYWORD_RE =
  /leadership|inclusion|inclusive|empathy|empathetic|communication|collaboration|persuasive|influenc|diverse|capability|stakeholder|mentor|culture|integrity|adapt|teamwork|interpersonal|manager|people|inclusivity|compassion|motivat/i;

type TipTarget = { path: string; step: FormStep };

type TipRule = {
  priority: number;
  pattern: RegExp;
  resolve: (
    data: ResumeFormValues,
    professional: boolean
  ) => TipTarget[];
};

function partitionMissedKeywords(missed: string[]): {
  soft: string[];
  other: string[];
} {
  const soft: string[] = [];
  const other: string[] = [];

  for (const keyword of missed) {
    if (SOFT_KEYWORD_RE.test(keyword)) {
      soft.push(keyword);
    } else {
      other.push(keyword);
    }
  }

  return { soft, other };
}

function formatKeywordList(keywords: string[], max = 8): string {
  if (keywords.length === 0) return "";
  const slice = keywords.slice(0, max);
  return slice.join(", ") + (keywords.length > max ? "…" : "");
}

function firstExperienceBullets(data: ResumeFormValues): TipTarget[] {
  if (data.experience.length === 0) return [];
  return [{ path: "experience.0.bullets", step: "experience" }];
}

function firstProjectLink(data: ResumeFormValues): TipTarget[] {
  if (data.projects.length === 0) return [];
  return [{ path: "projects.0.link", step: "projects" }];
}

function educationGraduationDates(data: ResumeFormValues): TipTarget[] {
  if (data.education.length === 0) return [];
  return [
    { path: "education.0.endMonth", step: "education" },
    { path: "education.0.endYear", step: "education" },
  ];
}

function firstExperienceDates(data: ResumeFormValues): TipTarget[] {
  if (data.experience.length === 0) return [];
  return [
    { path: "experience.0.startDate", step: "experience" },
    { path: "experience.0.endDate", step: "experience" },
  ];
}

/** Most specific rules first — only the first matching rule applies per tip. */
const TIP_RULES: TipRule[] = [
  {
    priority: 10,
    pattern:
      /github|gitlab|\brepo\b|deployment|live code|project link|url.*live|portfolio link|individual repos/i,
    resolve: (data) => [
      { path: "githubUrl", step: "personal" },
      ...firstProjectLink(data),
    ],
  },
  {
    priority: 10,
    pattern:
      /linkedin|\blinkedin url\b|social link|header.*link|contact link/i,
    resolve: () => [{ path: "linkedinUrl", step: "personal" }],
  },
  {
    priority: 10,
    pattern:
      /date discrep|timeline|future-dated|impossible|projected date|overlap|chronolog|actual dates/i,
    resolve: (data) => [
      ...educationGraduationDates(data),
      ...firstExperienceDates(data),
    ],
  },
  {
    priority: 20,
    pattern: /keyword|skill|technical|stack|\btool\b|language/i,
    resolve: () => [{ path: "skills", step: "skills" }],
  },
  {
    priority: 20,
    pattern: /job description|\bjd\b|tailor|role fit|target role/i,
    resolve: () => [
      { path: "jdText", step: "target" },
      { path: "targetRole", step: "target" },
    ],
  },
  {
    priority: 30,
    pattern: /bullet|verb|action|metric|quantif|impact|specific|achievement/i,
    resolve: (data) => firstExperienceBullets(data),
  },
  {
    priority: 30,
    pattern: /\bacademic project\b|\bproject description\b|\bproject name\b/i,
    resolve: (data) =>
      data.projects.length > 0
        ? [{ path: "projects.0.description", step: "projects" }]
        : [],
  },
  {
    priority: 35,
    pattern: /\bproject\b|\bprojects\b/i,
    resolve: (data) => firstProjectLink(data),
  },
  {
    priority: 40,
    pattern:
      /\bexperience\b|\binternship\b|\bemployment\b|\bwork history\b|\bjob entry\b/i,
    resolve: (data) => firstExperienceBullets(data),
  },
  {
    priority: 40,
    pattern: /\bsummary\b|\bprofessional summary\b|\bobjective\b|\bheadline\b/i,
    resolve: (_data, professional) =>
      professional ? [{ path: "summary", step: "personal" }] : [],
  },
  {
    priority: 45,
    pattern: /\bdegree\b|\bgpa\b|\bcgpa\b|\buniversity\b|\binstitution\b|\bcollege\b/i,
    resolve: (data) =>
      data.education.length > 0
        ? [{ path: "education.0.degree", step: "education" }]
        : [],
  },
  {
    priority: 45,
    pattern: /\bcertification\b|\bcertificate\b|\bcert\b/i,
    resolve: (data) =>
      data.certifications.length > 0
        ? [{ path: "certifications.0.name", step: "certifications" }]
        : [],
  },
  {
    priority: 50,
    pattern: /ban|clich|generic|flag|phrase|red flag/i,
    resolve: (data, professional) => [
      ...firstExperienceBullets(data),
      ...(professional
        ? [{ path: "summary", step: "personal" as FormStep }]
        : []),
    ],
  },
];

function resolveTipTargets(
  tip: string,
  data: ResumeFormValues,
  professional: boolean
): TipTarget[] {
  const sorted = [...TIP_RULES].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    if (!rule.pattern.test(tip)) continue;
    return rule.resolve(data, professional);
  }

  return [];
}

function isTimelineTip(tip: string): boolean {
  return /date discrep|timeline|future-dated|impossible|projected date|overlap|chronolog|experience start|education end/i.test(
    tip
  );
}

function isGithubLinkTip(tip: string): boolean {
  return /github|gitlab|\brepo\b|project link|individual repos|live code/i.test(
    tip
  );
}

export function shouldOfferAtsImprovement(
  score: number | null | undefined
): boolean {
  return score !== null && score !== undefined && score < ATS_IMPROVE_THRESHOLD;
}

export function deriveAtsStepHints(
  feedback: AtsFeedback,
  data: ResumeFormValues
): AtsStepHint[] {
  const hints: AtsStepHint[] = [];

  if (feedback.missed.length > 0) {
    const { soft, other } = partitionMissedKeywords(feedback.missed);
    const allKeywords = [...other, ...soft];

    hints.push({
      step: "skills",
      message:
        "Add JD keywords you genuinely have to your skills. Don't paste leadership terms into technical project fields.",
      keywords: allKeywords,
    });

    if (soft.length > 0 && data.experience.length > 0) {
      hints.push({
        step: "experience",
        message:
          "Where true for your role, weave these soft-skill / leadership JD terms into achievement bullets — one or two strong examples beat repeating keywords everywhere.",
        keywords: soft,
      });
    }

    if (other.length > 0 && data.projects.length > 0) {
      hints.push({
        step: "projects",
        message:
          "Technical JD terms belong in Skills first. Only mention a tool in a project if you actually used it on that project.",
        keywords: other,
      });
    }
  }

  for (const tip of feedback.tips) {
    if (isTimelineTip(tip)) {
      hints.push({
        step: "education",
        message: tip,
        keywords: [],
      });
      if (data.experience.length > 0) {
        hints.push({
          step: "experience",
          message: tip,
          keywords: [],
        });
      }
    }

    if (isGithubLinkTip(tip)) {
      hints.push({
        step: "personal",
        message: tip,
        keywords: [],
      });
      if (data.projects.length > 0) {
        hints.push({
          step: "projects",
          message: tip,
          keywords: [],
        });
      }
    }
  }

  const seen = new Set<string>();
  return hints.filter((hint) => {
    const key = `${hint.step}:${hint.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function deriveAtsFieldHints(
  feedback: AtsFeedback,
  data: ResumeFormValues,
  templateId: ResumeTemplateId = "template-001"
): AtsFieldHint[] {
  const hints: AtsFieldHint[] = [];
  const seen = new Set<string>();
  const professional = isProfessionalTemplate(templateId);

  const add = (path: string, message: string, step: FormStep) => {
    if (seen.has(path)) return;
    seen.add(path);
    hints.push({ path, message, step });
  };

  if (feedback.missed.length > 0) {
    const { soft, other } = partitionMissedKeywords(feedback.missed);

    if (other.length > 0) {
      add(
        "skills",
        `Add technical JD keywords you have: ${formatKeywordList(other)}`,
        "skills"
      );
    }

    if (soft.length > 0) {
      if (professional) {
        add(
          "summary",
          `Reflect these JD soft-skill themes in your summary where accurate: ${formatKeywordList(soft)}`,
          "personal"
        );
      } else {
        add(
          "softSkills",
          `Add soft-skill JD keywords you have: ${formatKeywordList(soft)}`,
          "skills"
        );
      }

      if (data.experience.length > 0) {
        add(
          "experience.0.bullets",
          `Where relevant, show these in bullets (don't keyword-stuff): ${formatKeywordList(soft, 5)}`,
          "experience"
        );
      }
    }

    if (!data.jdText.trim()) {
      add(
        "jdText",
        "Paste the job description so ATS can match role-specific keywords",
        "target"
      );
    }

    if (feedback.missed.length >= 3) {
      add(
        "targetRole",
        "Ensure your target role matches the job title in the JD",
        "target"
      );
    }
  }

  for (const tip of feedback.tips) {
    const targets = resolveTipTargets(tip, data, professional);
    for (const { path, step } of targets) {
      add(path, tip, step);
    }
  }

  if (feedback.score < 70 && hints.length === 0) {
    add(
      "skills",
      "Strengthen technical skills and align them with the job description",
      "skills"
    );
    add(
      "targetRole",
      "Ensure your target role matches the job you are applying for",
      "target"
    );
  }

  return hints;
}

export function atsHintsToMap(hints: AtsFieldHint[]): Record<string, string> {
  return Object.fromEntries(hints.map((hint) => [hint.path, hint.message]));
}

export function getAtsStepHint(
  step: FormStep,
  stepHints: AtsStepHint[]
): AtsStepHint | undefined {
  return stepHints.find((hint) => hint.step === step);
}

export function countAtsReviewAreas(
  fieldHints: AtsFieldHint[],
  stepHints: AtsStepHint[] = []
): number {
  const steps = new Set<FormStep>([
    ...fieldHints.map((hint) => hint.step),
    ...stepHints.map((hint) => hint.step),
  ]);
  return steps.size;
}

export function getAtsCountByStep(
  fieldHints: AtsFieldHint[],
  stepHints: AtsStepHint[] = []
): Record<FormStep, number> {
  const counts = {} as Record<FormStep, number>;
  for (const step of FORM_STEPS) {
    counts[step] = 0;
  }

  for (const step of FORM_STEPS) {
    const hasFieldHint = fieldHints.some((hint) => hint.step === step);
    const hasStepHint = stepHints.some((hint) => hint.step === step);
    counts[step] = hasFieldHint || hasStepHint ? 1 : 0;
  }

  return counts;
}

export function getFirstAtsStep(
  fieldHints: AtsFieldHint[],
  stepHints: AtsStepHint[] = []
): FormStep {
  for (const step of FORM_STEPS) {
    if (
      fieldHints.some((hint) => hint.step === step) ||
      stepHints.some((hint) => hint.step === step)
    ) {
      return step;
    }
  }
  return "skills";
}
