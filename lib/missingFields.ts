import type { FormStep } from "@/lib/types";
import { FORM_STEPS } from "@/lib/types";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";
import { isProfessionalTemplate } from "@/lib/templateFormRules";
import type { ResumeTemplateId } from "@/lib/templates";

export const MISSING_LABEL = "Missing from uploaded resume — please fill in";

function getStepFields(
  templateId: ResumeTemplateId
): Record<FormStep, (data: ResumeFormValues) => string[]> {
  const professional = isProfessionalTemplate(templateId);

  return {
    personal: (data) => {
      const paths: string[] = [];
      if (!data.fullName.trim()) paths.push("fullName");
      if (!data.email.trim()) paths.push("email");
      if (!data.phone.trim()) paths.push("phone");
      if (!data.linkedinUrl.trim()) paths.push("linkedinUrl");
      if (!data.githubUrl.trim()) paths.push("githubUrl");
      if (!data.city.trim()) paths.push("city");
      if (!data.state.trim()) paths.push("state");
      if (professional && !data.summary?.trim()) paths.push("summary");
      return paths;
    },
    education: (data) => {
      const paths: string[] = [];
      data.education.forEach((entry, index) => {
        if (!entry.institution.trim()) {
          paths.push(`education.${index}.institution`);
        }
        if (!entry.degree.trim()) paths.push(`education.${index}.degree`);
        if (!entry.city.trim()) paths.push(`education.${index}.city`);
        if (!entry.endYear.trim()) paths.push(`education.${index}.endYear`);
        if (!entry.endMonth.trim()) paths.push(`education.${index}.endMonth`);
        if (!professional && !entry.cgpa?.trim()) {
          paths.push(`education.${index}.cgpa`);
        }
      });
      if (data.education.length === 0) paths.push("education");
      return paths;
    },
    skills: (data) => {
      const paths: string[] = [];
      if (data.skills.filter((s) => s.trim()).length === 0) paths.push("skills");
      if (professional) {
        if (data.languageEntries.length === 0) paths.push("languageEntries");
        data.languageEntries.forEach((entry, index) => {
          if (!entry.language.trim()) {
            paths.push(`languageEntries.${index}.language`);
          }
          if (!entry.level.trim()) paths.push(`languageEntries.${index}.level`);
          if (!entry.label.trim()) paths.push(`languageEntries.${index}.label`);
        });
      } else {
        if (data.interests.filter((s) => s.trim()).length === 0) {
          paths.push("interests");
        }
      }
      return paths;
    },
    projects: (data) => {
      const paths: string[] = [];
      data.projects.forEach((project, index) => {
        if (!project.name.trim()) paths.push(`projects.${index}.name`);
        if (!project.description.trim()) {
          paths.push(`projects.${index}.description`);
        }
        if (!project.technologies.trim()) {
          paths.push(`projects.${index}.technologies`);
        }
        if (!project.link.trim()) paths.push(`projects.${index}.link`);
        if (!project.startDate.trim()) paths.push(`projects.${index}.startDate`);
        if (!project.endDate.trim()) paths.push(`projects.${index}.endDate`);
      });
      if (data.projects.length === 0) paths.push("projects");
      return paths;
    },
    experience: (data) => {
      const paths: string[] = [];
      data.experience.forEach((entry, index) => {
        if (!entry.company.trim()) paths.push(`experience.${index}.company`);
        if (!entry.role.trim()) paths.push(`experience.${index}.role`);
        if (professional && !entry.location?.trim()) {
          paths.push(`experience.${index}.location`);
        }
        if (!entry.startDate.trim()) paths.push(`experience.${index}.startDate`);
        if (!entry.endDate.trim()) paths.push(`experience.${index}.endDate`);
        if (professional && entry.bullets.filter(Boolean).length === 0) {
          paths.push(`experience.${index}.bullets`);
        }
      });
      return paths;
    },
    certifications: (data) => {
      const paths: string[] = [];
      data.certifications.forEach((entry, index) => {
        if (!entry.name.trim()) paths.push(`certifications.${index}.name`);
        if (!entry.issuer.trim()) paths.push(`certifications.${index}.issuer`);
      });
      return paths;
    },
    target: (data) => {
      const paths: string[] = [];
      if (!data.targetRole.trim()) paths.push("targetRole");
      return paths;
    },
  };
}

export function getMissingFieldPaths(
  data: ResumeFormValues,
  templateId: ResumeTemplateId = "template-001"
): string[] {
  const paths = new Set<string>();
  const stepFields = getStepFields(templateId);
  for (const step of FORM_STEPS) {
    for (const path of stepFields[step](data)) {
      paths.add(path);
    }
  }
  return Array.from(paths);
}

export function getMissingCountByStep(
  data: ResumeFormValues,
  missingPaths?: string[],
  templateId: ResumeTemplateId = "template-001"
): Record<FormStep, number> {
  const active = new Set(missingPaths ?? getMissingFieldPaths(data, templateId));
  const counts = {} as Record<FormStep, number>;
  const stepFields = getStepFields(templateId);

  for (const step of FORM_STEPS) {
    counts[step] = stepFields[step](data).filter((path) => active.has(path)).length;
  }

  return counts;
}

export function isFieldMissing(path: string, missingPaths: string[]): boolean {
  return missingPaths.includes(path);
}

export function pruneMissingPaths(
  data: ResumeFormValues,
  missingPaths: string[],
  templateId: ResumeTemplateId = "template-001"
): string[] {
  const stillMissing = new Set(getMissingFieldPaths(data, templateId));
  return missingPaths.filter((path) => stillMissing.has(path));
}
