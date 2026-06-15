import type { FormStep } from "@/lib/types";
import { FORM_STEPS } from "@/lib/types";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

export const MISSING_LABEL = "Missing from uploaded resume — please fill in";

const STEP_FIELDS: Record<FormStep, (data: ResumeFormValues) => string[]> = {
  personal: (data) => {
    const paths: string[] = [];
    if (!data.fullName.trim()) paths.push("fullName");
    if (!data.email.trim()) paths.push("email");
    if (!data.phone.trim()) paths.push("phone");
    if (!data.linkedinUrl.trim()) paths.push("linkedinUrl");
    if (!data.githubUrl.trim()) paths.push("githubUrl");
    if (!data.city.trim()) paths.push("city");
    if (!data.state.trim()) paths.push("state");
    return paths;
  },
  education: (data) => {
    const paths: string[] = [];
    data.education.forEach((entry, index) => {
      if (!entry.institution.trim()) paths.push(`education.${index}.institution`);
      if (!entry.degree.trim()) paths.push(`education.${index}.degree`);
      if (!entry.startYear.trim()) paths.push(`education.${index}.startYear`);
      if (!entry.endYear.trim()) paths.push(`education.${index}.endYear`);
      if (!entry.cgpa.trim()) paths.push(`education.${index}.cgpa`);
    });
    if (data.education.length === 0) paths.push("education");
    return paths;
  },
  skills: (data) => {
    const paths: string[] = [];
    if (data.skills.filter((s) => s.trim()).length === 0) paths.push("skills");
    if (data.languages.filter((s) => s.trim()).length === 0) paths.push("languages");
    if (data.interests.filter((s) => s.trim()).length === 0) paths.push("interests");
    return paths;
  },
  projects: (data) => {
    const paths: string[] = [];
    data.projects.forEach((project, index) => {
      if (!project.name.trim()) paths.push(`projects.${index}.name`);
      if (!project.description.trim()) paths.push(`projects.${index}.description`);
      if (!project.technologies.trim()) paths.push(`projects.${index}.technologies`);
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
      if (!entry.startDate.trim()) paths.push(`experience.${index}.startDate`);
      if (!entry.endDate.trim()) paths.push(`experience.${index}.endDate`);
      if (!entry.description.trim()) paths.push(`experience.${index}.description`);
    });
    return paths;
  },
  certifications: (data) => {
    const paths: string[] = [];
    data.certifications.forEach((entry, index) => {
      if (!entry.name.trim()) paths.push(`certifications.${index}.name`);
      if (!entry.issuer.trim()) paths.push(`certifications.${index}.issuer`);
      if (!entry.date.trim()) paths.push(`certifications.${index}.date`);
      if (!entry.credential.trim()) paths.push(`certifications.${index}.credential`);
    });
    return paths;
  },
  target: (data) => {
    const paths: string[] = [];
    if (!data.targetRole.trim()) paths.push("targetRole");
    return paths;
  },
};

export function getMissingFieldPaths(data: ResumeFormValues): string[] {
  const paths = new Set<string>();
  for (const step of FORM_STEPS) {
    for (const path of STEP_FIELDS[step](data)) {
      paths.add(path);
    }
  }
  return Array.from(paths);
}

export function getMissingCountByStep(
  data: ResumeFormValues,
  missingPaths?: string[]
): Record<FormStep, number> {
  const active = new Set(missingPaths ?? getMissingFieldPaths(data));
  const counts = {} as Record<FormStep, number>;

  for (const step of FORM_STEPS) {
    counts[step] = STEP_FIELDS[step](data).filter((path) => active.has(path)).length;
  }

  return counts;
}

export function isFieldMissing(path: string, missingPaths: string[]): boolean {
  return missingPaths.includes(path);
}

export function pruneMissingPaths(
  data: ResumeFormValues,
  missingPaths: string[]
): string[] {
  const stillMissing = new Set(getMissingFieldPaths(data));
  return missingPaths.filter((path) => stillMissing.has(path));
}
