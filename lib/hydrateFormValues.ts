import {
  defaultFormValues,
  type ResumeFormValues,
} from "@/lib/validators/resumeInput";

export function hydrateFormValues(
  data: Partial<ResumeFormValues> | ResumeFormValues
): ResumeFormValues {
  return {
    ...defaultFormValues,
    ...data,
    education:
      data.education?.length
        ? data.education.map((entry) => ({
            institution: entry.institution ?? "",
            degree: entry.degree ?? "",
            field: entry.field ?? "",
            startYear: entry.startYear ?? "",
            endYear: entry.endYear ?? "",
            cgpa: entry.cgpa ?? "",
          }))
        : defaultFormValues.education,
    skills: data.skills ?? [],
    softSkills: data.softSkills ?? [],
    languages: data.languages ?? [],
    interests: data.interests ?? [],
    projects:
      data.projects?.length
        ? data.projects.map((project) => ({
            name: project.name ?? "",
            description: project.description ?? "",
            technologies: project.technologies ?? "",
            link: project.link ?? "",
            startDate: project.startDate ?? "",
            endDate: project.endDate ?? "",
          }))
        : defaultFormValues.projects,
    experience: (data.experience ?? []).map((entry) => ({
      company: entry.company ?? "",
      role: entry.role ?? "",
      startDate: entry.startDate ?? "",
      endDate: entry.endDate ?? "",
      description: entry.description ?? "",
    })),
    certifications: (data.certifications ?? []).map((entry) => ({
      name: entry.name ?? "",
      issuer: entry.issuer ?? "",
      date: entry.date ?? "",
      credential: entry.credential ?? "",
    })),
  };
}
