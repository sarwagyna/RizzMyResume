export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  startYear: string;
  endYear: string;
  cgpa?: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string;
  link: string;
  startDate: string;
  endDate: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  credential: string;
}

export interface ResumeFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  city: string;
  state: string;
  education: EducationEntry[];
  skills: string[];
  softSkills: string[];
  languages: string[];
  interests: string[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  targetRole: string;
  jdText: string;
}

export interface GenerationRecord {
  id: string;
  user_id: string;
  input_id: string;
  payment_id: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  pdf_signed_url: string | null;
  pdf_url_expires_at: string | null;
  ats_score: number | null;
  ats_tips: string[] | null;
  what_changed: string | null;
  jd_keywords_matched: string[] | null;
  jd_keywords_missed: string[] | null;
  target_role: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PaymentOrderResponse {
  order_id: string;
  amount: number;
  currency?: string;
  key: string;
  payment_id: string;
}

export interface ClaudeGenerationOutput {
  latex_code: string;
  what_changed: string;
  ats_score: number;
  ats_tips: string[];
  jd_keywords_matched: string[];
  jd_keywords_missed: string[];
  input_flags: string[];
}

export type FormStep =
  | "personal"
  | "education"
  | "skills"
  | "projects"
  | "experience"
  | "certifications"
  | "target";

export const FORM_STEPS: FormStep[] = [
  "personal",
  "education",
  "skills",
  "projects",
  "experience",
  "certifications",
  "target",
];

export const FORM_STEP_LABELS: Record<FormStep, string> = {
  personal: "Personal",
  education: "Education",
  skills: "Skills & interests",
  projects: "Projects",
  experience: "Experience",
  certifications: "Certifications",
  target: "Target role",
};
