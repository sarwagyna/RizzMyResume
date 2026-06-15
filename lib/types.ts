export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  city: string;
  startYear?: string;
  endYear: string;
  endMonth: string;
  cgpa?: string;
}

export interface LanguageEntry {
  language: string;
  level: string;
  label: string;
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
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  description?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date?: string;
  credential?: string;
}

export interface ResumeFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  city: string;
  state: string;
  summary?: string;
  education: EducationEntry[];
  skills: string[];
  softSkills: string[];
  languageEntries: LanguageEntry[];
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

export interface CreditRedeemResponse {
  redeemed: boolean;
  payment_id: string;
  credits_spent: number;
  credits_remaining: number;
}

export interface ReferralStats {
  referral_code: string;
  credits: number;
  referral_count: number;
  referred_by: string | null;
  referral_link: string;
  credits_per_referral: number;
  credits_per_resume: number;
  recent_referrals: {
    id: string;
    created_at: string;
    email: string | null;
    full_name: string | null;
  }[];
  transactions: {
    id: string;
    amount: number;
    balance_after: number;
    type: string;
    description: string | null;
    created_at: string;
  }[];
}

export interface ReferralApplyResponse {
  applied: boolean;
  credits_earned: number;
  credits: number;
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
  skills: "Skills & languages",
  projects: "Projects",
  experience: "Experience",
  certifications: "Certifications",
  target: "Target role",
};
