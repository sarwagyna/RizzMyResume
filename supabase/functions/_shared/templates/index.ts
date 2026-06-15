import {
  TEMPLATE_001_FALLBACK_PREAMBLE,
  TEMPLATE_001_LATEX_PREAMBLE,
} from "../resumeLatexTemplate.ts";
import {
  TEMPLATE_002_FALLBACK_PREAMBLE,
  TEMPLATE_002_LATEX_PREAMBLE,
} from "./template002.ts";
import {
  TEMPLATE_002_LATEX_SPEC,
  TEMPLATE_003_LATEX_SPEC,
  TEMPLATE_001_LATEX_SPEC,
} from "./promptSpecs.ts";

export type ResumeTemplateId =
  | "template-001"
  | "template-002"
  | "template-003";

export const DEFAULT_TEMPLATE_ID: ResumeTemplateId = "template-001";

export interface ResumeTemplateDefinition {
  id: ResumeTemplateId;
  name: string;
  description: string;
  previewDocx?: string;
  preamble: string;
  fallbackPreamble: string;
  promptSpec: string;
}

export const RESUME_TEMPLATES: Record<ResumeTemplateId, ResumeTemplateDefinition> = {
  "template-001": {
    id: "template-001",
    name: "Template 001",
    description:
      "Palatino, centred blue section rules, two-column skills — from resume_template_2.docx.",
    previewDocx: "/templates/resume_template_2.docx",
    preamble: TEMPLATE_001_LATEX_PREAMBLE,
    fallbackPreamble: TEMPLATE_001_FALLBACK_PREAMBLE,
    promptSpec: TEMPLATE_001_LATEX_SPEC,
  },
  "template-002": {
    id: "template-002",
    name: "Template 002",
    description:
      "11pt serif, piped header, datedline rows, tabular skills, separate Academic Projects section.",
    previewDocx: "/templates/reusme_template_20.docx",
    preamble: TEMPLATE_002_LATEX_PREAMBLE,
    fallbackPreamble: TEMPLATE_002_FALLBACK_PREAMBLE,
    promptSpec: TEMPLATE_002_LATEX_SPEC,
  },
  "template-003": {
    id: "template-003",
    name: "Template 003",
    description:
      "Same as Template 001 — Palatino professional layout from resume_template_2.docx.",
    previewDocx: "/templates/resume_template_2.docx",
    preamble: TEMPLATE_001_LATEX_PREAMBLE,
    fallbackPreamble: TEMPLATE_001_FALLBACK_PREAMBLE,
    promptSpec: TEMPLATE_003_LATEX_SPEC,
  },
};

export function resolveTemplateId(
  value: string | null | undefined
): ResumeTemplateId {
  if (value === "harshibar") return "template-001";
  if (value === "classic-professional") return "template-001";
  if (value && value in RESUME_TEMPLATES) {
    return value as ResumeTemplateId;
  }
  return DEFAULT_TEMPLATE_ID;
}

export function getTemplate(id: ResumeTemplateId): ResumeTemplateDefinition {
  return RESUME_TEMPLATES[id];
}

export function getTemplatePromptSpec(id: ResumeTemplateId): string {
  return getTemplate(id).promptSpec;
}

export function usesStackedContactHeader(_id: ResumeTemplateId): boolean {
  return false;
}

export function usesPipedContactHeader(id: ResumeTemplateId): boolean {
  return id === "template-001" || id === "template-002" || id === "template-003";
}
