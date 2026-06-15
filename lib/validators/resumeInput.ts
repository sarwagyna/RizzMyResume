import { z } from "zod";

const indianPhoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

export const educationSchema = z.object({
  institution: z.string().min(2, "Institution is required"),
  degree: z.string().min(2, "Degree is required"),
  field: z.string().optional(),
  startYear: z.string().min(4, "Start year required"),
  endYear: z.string().min(4, "End year required"),
  cgpa: z.string().min(1, "CGPA is required"),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z
    .string()
    .min(50, "Describe your project in at least 50 characters"),
  technologies: z.string().min(2, "List technologies used"),
  link: z.string().url("Valid project link is required"),
  startDate: z.string().min(4, "Start date required"),
  endDate: z.string().min(2, "End date required"),
});

export const experienceSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role is required"),
  startDate: z.string().min(4, "Start date required"),
  endDate: z.string().min(2, "End date required"),
  description: z.string().min(20, "Describe your work in at least 20 characters"),
});

export const certificationSchema = z.object({
  name: z.string().min(2, "Certification name is required"),
  issuer: z.string().min(2, "Issuer is required"),
  date: z.string().min(4, "Date required"),
  credential: z.string().min(2, "Credential ID or URL is required"),
});

export const personalStepSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .regex(indianPhoneRegex, "Enter a valid Indian mobile number"),
  linkedinUrl: z.string().url("Valid LinkedIn URL is required"),
  githubUrl: z.string().url("Valid GitHub URL is required"),
  city: z.string().min(2, "City is required").max(50),
  state: z.string().min(2, "State is required").max(50),
});

export const educationStepSchema = z.object({
  education: z
    .array(educationSchema)
    .min(1, "Add at least one education entry"),
});

export const skillsStepSchema = z.object({
  skills: z.array(z.string().min(1)),
  softSkills: z.array(z.string().min(1)),
  languages: z.array(z.string().min(1)),
  interests: z.array(z.string().min(1)),
});

export const projectsStepSchema = z.object({
  projects: z
    .array(projectSchema)
    .min(1, "Add at least one project")
    .max(4, "Maximum 4 projects"),
});

export const experienceStepSchema = z.object({
  experience: z.array(experienceSchema),
});

export const certificationsStepSchema = z.object({
  certifications: z.array(certificationSchema),
});

export const targetStepSchema = z.object({
  targetRole: z.string().min(2, "Target role is required").max(100),
  jdText: z.string().max(2000, "Job description max 2,000 characters"),
});

export const resumeFormSchema = personalStepSchema
  .merge(educationStepSchema)
  .merge(skillsStepSchema)
  .merge(projectsStepSchema)
  .merge(experienceStepSchema)
  .merge(certificationsStepSchema)
  .merge(targetStepSchema);

export type PersonalStepValues = z.infer<typeof personalStepSchema>;
export type EducationStepValues = z.infer<typeof educationStepSchema>;
export type SkillsStepValues = z.infer<typeof skillsStepSchema>;
export type ProjectsStepValues = z.infer<typeof projectsStepSchema>;
export type ExperienceStepValues = z.infer<typeof experienceStepSchema>;
export type CertificationsStepValues = z.infer<typeof certificationsStepSchema>;
export type TargetStepValues = z.infer<typeof targetStepSchema>;
export type ResumeFormValues = z.infer<typeof resumeFormSchema>;

export const defaultFormValues: ResumeFormValues = {
  fullName: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  githubUrl: "",
  city: "",
  state: "",
  education: [
    {
      institution: "",
      degree: "",
      field: "",
      startYear: "",
      endYear: "",
      cgpa: "",
    },
  ],
  skills: [],
  softSkills: [],
  languages: [],
  interests: [],
  projects: [
    {
      name: "",
      description: "",
      technologies: "",
      link: "",
      startDate: "",
      endDate: "",
    },
  ],
  experience: [],
  certifications: [],
  targetRole: "",
  jdText: "",
};

export function getQualityWarnings(data: ResumeFormValues): string[] {
  const warnings: string[] = [];

  if (data.projects.filter((p) => p.name.trim()).length < 2) {
    warnings.push("Fewer than 2 projects — add more for a stronger resume.");
  }

  if (data.skills.filter((s) => s.trim()).length === 0) {
    warnings.push("No skills listed — ATS systems rely heavily on keywords.");
  }

  if (!data.linkedinUrl.trim()) {
    warnings.push("LinkedIn URL is missing.");
  }

  if (!data.githubUrl.trim()) {
    warnings.push("GitHub URL is missing.");
  }

  data.projects.forEach((project, index) => {
    if (project.name && project.description.length < 50) {
      warnings.push(
        `Project ${index + 1} description is too short (min 50 characters).`
      );
    }
    if (project.name && !project.link.trim()) {
      warnings.push(`Project ${index + 1} is missing a link.`);
    }
  });

  return warnings;
}
