import {
  defaultFormValues,
  type ResumeFormValues,
} from "@/lib/validators/resumeInput";

/** Merge AI-parsed partial resume into form defaults. */
export function mergeParsedResume(
  parsed: Partial<ResumeFormValues>
): ResumeFormValues {
  const filteredEducation =
    parsed.education?.filter(
      (e) => e.institution?.trim() || e.degree?.trim()
    ) ?? [];

  const education =
    filteredEducation.length > 0
      ? filteredEducation.map((e) => ({
          institution: e.institution ?? "",
          degree: e.degree ?? "",
          field: e.field ?? "",
          startYear: e.startYear ?? "",
          endYear: e.endYear ?? "",
          cgpa: e.cgpa ?? "",
        }))
      : defaultFormValues.education;

  const projects =
    parsed.projects?.filter((p) => p.name?.trim()).slice(0, 4) ?? [];
  const normalizedProjects =
    projects.length > 0
      ? projects.map((p) => ({
          name: p.name ?? "",
          description: p.description ?? "",
          technologies: p.technologies ?? "",
          link: p.link ?? "",
          startDate: p.startDate ?? "",
          endDate: p.endDate ?? "",
        }))
      : defaultFormValues.projects;

  return {
    fullName: parsed.fullName?.trim() ?? "",
    email: parsed.email?.trim() ?? "",
    phone: normalizePhone(parsed.phone ?? ""),
    linkedinUrl: parsed.linkedinUrl?.trim() ?? "",
    githubUrl: parsed.githubUrl?.trim() ?? "",
    city: parsed.city?.trim() ?? "",
    state: parsed.state?.trim() ?? "",
    education,
    skills: (parsed.skills ?? []).filter(Boolean).map((s) => s.trim()),
    softSkills: (parsed.softSkills ?? []).filter(Boolean).map((s) => s.trim()),
    languages: (parsed.languages ?? []).filter(Boolean).map((s) => s.trim()),
    interests: (parsed.interests ?? []).filter(Boolean).map((s) => s.trim()),
    projects: normalizedProjects,
    experience: (parsed.experience ?? []).map((e) => ({
      company: e.company ?? "",
      role: e.role ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      description: e.description ?? "",
    })),
    certifications: (parsed.certifications ?? []).map((c) => ({
      name: c.name ?? "",
      issuer: c.issuer ?? "",
      date: c.date ?? "",
      credential: c.credential ?? "",
    })),
    targetRole: parsed.targetRole?.trim() ?? "",
    jdText: parsed.jdText?.trim() ?? "",
  };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return phone.trim();
}

export const ACCEPTED_RESUME_TYPES = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
} as const;

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export async function readResumeFile(file: File): Promise<{
  content_base64?: string;
  media_type?: string;
  text?: string;
  filename: string;
}> {
  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  const allowed = Object.keys(ACCEPTED_RESUME_TYPES);
  if (!allowed.includes(file.type)) {
    throw new Error("Upload a PDF or plain text (.txt) resume.");
  }

  if (file.type === "text/plain") {
    return {
      text: await file.text(),
      filename: file.name,
    };
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return {
    content_base64: btoa(binary),
    media_type: "application/pdf",
    filename: file.name,
  };
}
