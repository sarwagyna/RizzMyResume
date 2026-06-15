import {
  defaultFormValues,
  type LanguageEntryValues,
  type ResumeFormValues,
} from "@/lib/validators/resumeInput";
import { languageLevelLabel } from "@/lib/languageLevels";

function parseLegacyLanguage(value: string): LanguageEntryValues {
  const trimmed = value.trim();
  const nativeMatch = trimmed.match(/^(.+?):\s*Native$/i);
  if (nativeMatch) {
    return {
      language: nativeMatch[1]!.trim(),
      level: "Native",
      label: "Native",
    };
  }

  const codedMatch = trimmed.match(/^(.+?):\s*([A-C][12])$/i);
  if (codedMatch) {
    const level = codedMatch[2]!.toUpperCase();
    return {
      language: codedMatch[1]!.trim(),
      level,
      label: languageLevelLabel(level),
    };
  }

  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    const label = parenMatch[2]!.trim();
    const levelMatch = label.match(/([A-C][12]|Native)/i);
    return {
      language: parenMatch[1]!.trim(),
      level: levelMatch?.[1]?.toUpperCase() ?? label,
      label,
    };
  }

  return {
    language: trimmed,
    level: "B2",
    label: languageLevelLabel("B2"),
  };
}

function hydrateLanguageEntries(
  languageEntries: LanguageEntryValues[] | undefined,
  legacyLanguages: string[] | undefined
): LanguageEntryValues[] {
  if (languageEntries?.length) {
    return languageEntries.map((entry) => ({
      language: entry.language ?? "",
      level: entry.level ?? "",
      label: entry.label ?? languageLevelLabel(entry.level ?? ""),
    }));
  }

  return (legacyLanguages ?? [])
    .filter(Boolean)
    .map((value) => parseLegacyLanguage(String(value)));
}

function splitDescriptionToBullets(description: string): string[] {
  return description
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length >= 10);
}

export function hydrateFormValues(
  data: Partial<ResumeFormValues> | ResumeFormValues
): ResumeFormValues {
  const legacyLanguages = (data as { languages?: string[] }).languages;

  return {
    ...defaultFormValues,
    ...data,
    summary: data.summary ?? "",
    education:
      data.education?.length
        ? data.education.map((entry) => ({
            institution: entry.institution ?? "",
            degree: entry.degree ?? "",
            field: entry.field ?? "",
            city: entry.city ?? "",
            startYear: entry.startYear ?? "",
            endYear: entry.endYear ?? "",
            endMonth: entry.endMonth ?? "",
            cgpa: entry.cgpa ?? "",
          }))
        : defaultFormValues.education,
    skills: data.skills ?? [],
    softSkills: data.softSkills ?? [],
    languageEntries: hydrateLanguageEntries(
      data.languageEntries,
      legacyLanguages
    ),
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
    experience: (data.experience ?? []).map((entry) => {
      const bullets =
        entry.bullets?.filter(Boolean) ??
        splitDescriptionToBullets(entry.description ?? "");

      return {
        company: entry.company ?? "",
        role: entry.role ?? "",
        location: entry.location ?? "",
        startDate: entry.startDate ?? "",
        endDate: entry.endDate ?? "",
        bullets,
        description: entry.description ?? "",
      };
    }),
    certifications: (data.certifications ?? []).map((entry) => ({
      name: entry.name ?? "",
      issuer: entry.issuer ?? "",
      date: entry.date ?? "",
      credential: entry.credential ?? "",
    })),
  };
}
