import { createClient } from "@/lib/supabase/client";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

function toDbPayload(data: ResumeFormValues, userId: string) {
  return {
    user_id: userId,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    linkedin_url: data.linkedinUrl || null,
    github_url: data.githubUrl || null,
    city: data.city,
    state: data.state,
    education: data.education,
    skills: data.skills,
    soft_skills: data.softSkills,
    languages: data.languages,
    interests: data.interests,
    projects: data.projects,
    experience: data.experience,
    certifications: data.certifications,
    target_role: data.targetRole,
    jd_text: data.jdText || null,
    is_draft: true,
  };
}

export async function saveDraft(
  data: ResumeFormValues,
  inputId: string | null
): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const payload = toDbPayload(data, user.id);

  if (inputId) {
    const { data: updated, error } = await supabase
      .from("resume_inputs")
      .update(payload)
      .eq("id", inputId)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (error) throw error;

    if (data.fullName.trim()) {
      void supabase.auth.updateUser({
        data: { full_name: data.fullName.trim() },
      });
    }

    return updated.id;
  }

  const { data: created, error } = await supabase
    .from("resume_inputs")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;

  if (data.fullName.trim()) {
    void supabase.auth.updateUser({
      data: { full_name: data.fullName.trim() },
    });
  }

  return created.id;
}

export async function finalizeInput(inputId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("resume_inputs")
    .update({ is_draft: false })
    .eq("id", inputId);

  if (error) throw error;
}
