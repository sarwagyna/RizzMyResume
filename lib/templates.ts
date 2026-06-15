export type ResumeTemplateId =
  | "template-001"
  | "template-002"
  | "template-003";

export const DEFAULT_TEMPLATE_ID: ResumeTemplateId = "template-001";

export interface ResumeTemplateOption {
  id: ResumeTemplateId;
  name: string;
  description: string;
  previewDocx?: string;
}

export const RESUME_TEMPLATE_OPTIONS: ResumeTemplateOption[] = [
  {
    id: "template-001",
    name: "Template 001",
    description:
      "Palatino, centred blue section rules, two-column skills — from resume_template_2.docx.",
    previewDocx: "/templates/resume_template_2.docx",
  },
  {
    id: "template-002",
    name: "Template 002",
    description:
      "11pt serif, piped header, datedline rows, tabular skills, separate Academic Projects section.",
    previewDocx: "/templates/reusme_template_20.docx",
  },
  {
    id: "template-003",
    name: "Template 003",
    description:
      "Same as Template 001 — Palatino professional layout from resume_template_2.docx.",
    previewDocx: "/templates/resume_template_2.docx",
  },
];

export function isResumeTemplateId(value: string): value is ResumeTemplateId {
  return RESUME_TEMPLATE_OPTIONS.some((t) => t.id === value);
}

export function resolveTemplateId(
  value: string | null | undefined
): ResumeTemplateId {
  if (value === "harshibar") return "template-001";
  if (value === "classic-professional") return "template-001";
  if (value && isResumeTemplateId(value)) return value;
  return DEFAULT_TEMPLATE_ID;
}

/** Map app template id to a value allowed by older DB check constraints. */
export function toDbTemplateId(id: ResumeTemplateId): string {
  if (id === "template-001" || id === "template-003") {
    return "classic-professional";
  }
  return id;
}
