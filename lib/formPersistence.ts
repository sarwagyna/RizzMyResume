import { createClient } from "@/lib/supabase/client";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";
import {
  resolveTemplateId,
  toDbTemplateId,
  type ResumeTemplateId,
} from "@/lib/templates";
import type { PostgrestError } from "@supabase/supabase-js";

type SaveOptions = {
  includeTemplateId: boolean;
  includeSummary: boolean;
  dbTemplateId?: string;
};

type ResumeInputInsert = ReturnType<typeof toInsertPayload>;
type ResumeInputUpdate = ReturnType<typeof toUpdatePayload>;

function toInsertPayload(
  data: ResumeFormValues,
  userId: string,
  options: SaveOptions
) {
  return {
    user_id: userId,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    linkedin_url: data.linkedinUrl || null,
    github_url: data.githubUrl || null,
    city: data.city,
    state: data.state,
    ...(options.includeSummary ? { summary: data.summary || null } : {}),
    education: data.education,
    skills: data.skills,
    soft_skills: data.softSkills,
    languages: data.languageEntries,
    interests: data.interests,
    projects: data.projects,
    experience: data.experience,
    certifications: data.certifications,
    target_role: data.targetRole,
    jd_text: data.jdText || null,
    ...(options.includeTemplateId
      ? { template_id: options.dbTemplateId ?? "template-001" }
      : {}),
    is_draft: true,
  };
}

function toUpdatePayload(data: ResumeFormValues, options: SaveOptions) {
  return {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    linkedin_url: data.linkedinUrl || null,
    github_url: data.githubUrl || null,
    city: data.city,
    state: data.state,
    ...(options.includeSummary ? { summary: data.summary || null } : {}),
    education: data.education,
    skills: data.skills,
    soft_skills: data.softSkills,
    languages: data.languageEntries,
    interests: data.interests,
    projects: data.projects,
    experience: data.experience,
    certifications: data.certifications,
    target_role: data.targetRole,
    jd_text: data.jdText || null,
    ...(options.includeTemplateId
      ? { template_id: options.dbTemplateId ?? "template-001" }
      : {}),
    is_draft: true,
  };
}

function isPostgrestError(err: unknown): err is PostgrestError {
  return typeof err === "object" && err !== null && "code" in err;
}

function isMissingColumn(error: PostgrestError, column: string): boolean {
  return (
    error.code === "PGRST204" &&
    error.message.toLowerCase().includes(column.toLowerCase())
  );
}

function isTemplateIdCheckViolation(error: PostgrestError): boolean {
  return (
    error.code === "23514" &&
    error.message.toLowerCase().includes("template_id")
  );
}

async function persistResumeInput(
  payload: ResumeInputInsert | ResumeInputUpdate,
  inputId: string | null,
  userId: string
): Promise<string> {
  const supabase = createClient();

  if (inputId) {
    const { data: updated, error } = await supabase
      .from("resume_inputs")
      .update(payload)
      .eq("id", inputId)
      .eq("user_id", userId)
      .select("id")
      .single();

    if (error) throw error;
    return updated.id;
  }

  const { data: created, error } = await supabase
    .from("resume_inputs")
    .insert(payload as ResumeInputInsert)
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

function buildPayload(
  data: ResumeFormValues,
  userId: string | null,
  templateId: ResumeTemplateId,
  options: SaveOptions
) {
  if (userId) {
    return toInsertPayload(data, userId, options);
  }
  return toUpdatePayload(data, options);
}

async function trySave(
  data: ResumeFormValues,
  inputId: string | null,
  userId: string,
  templateId: ResumeTemplateId,
  options: SaveOptions
): Promise<string> {
  const payload = buildPayload(data, inputId ? null : userId, templateId, options);
  return persistResumeInput(payload, inputId, userId);
}

export async function saveDraft(
  data: ResumeFormValues,
  inputId: string | null,
  templateId: ResumeTemplateId = "template-001"
): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const resolvedTemplateId = resolveTemplateId(templateId);

  const attempts: SaveOptions[] = [
    {
      includeTemplateId: true,
      includeSummary: true,
      dbTemplateId: resolvedTemplateId,
    },
    {
      includeTemplateId: true,
      includeSummary: true,
      dbTemplateId: toDbTemplateId(resolvedTemplateId),
    },
    { includeTemplateId: true, includeSummary: false, dbTemplateId: resolvedTemplateId },
    {
      includeTemplateId: true,
      includeSummary: false,
      dbTemplateId: toDbTemplateId(resolvedTemplateId),
    },
    { includeTemplateId: false, includeSummary: true },
    { includeTemplateId: false, includeSummary: false },
  ];

  let lastError: PostgrestError | Error | null = null;

  for (const options of attempts) {
    try {
      const id = await trySave(
        data,
        inputId,
        user.id,
        resolvedTemplateId,
        options
      );

      if (data.fullName.trim()) {
        void supabase.auth
          .updateUser({ data: { full_name: data.fullName.trim() } })
          .catch(() => {
            // Non-blocking profile metadata sync.
          });
      }

      return id;
    } catch (err) {
      if (!isPostgrestError(err)) throw err;
      lastError = err;

      if (
        !isTemplateIdCheckViolation(err) &&
        !isMissingColumn(err, "template_id") &&
        !isMissingColumn(err, "summary")
      ) {
        throw err;
      }
    }
  }

  if (isTemplateIdCheckViolation(lastError as PostgrestError)) {
    throw new Error(
      "Could not save template choice. Run supabase/migrations/013_fix_template_003_constraint.sql in the Supabase SQL editor, then reload the API schema."
    );
  }

  throw lastError ?? new Error("Failed to save draft");
}

export async function finalizeInput(inputId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("resume_inputs")
    .update({ is_draft: false })
    .eq("id", inputId);

  if (error) throw error;
}
