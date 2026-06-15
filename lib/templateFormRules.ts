import type { ResumeTemplateId } from "@/lib/templates";

export function isProfessionalTemplate(id: ResumeTemplateId): boolean {
  return id === "template-001" || id === "template-002" || id === "template-003";
}

export function isStudentTemplate(_id: ResumeTemplateId): boolean {
  return false;
}
