import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  generateResumeContent,
  formatRawInput,
} from "./claude.ts";
import {
  buildLatexDocument,
  compileLatex,
  normalizeLatexDocument,
  pdfFilename,
} from "./latexlite.ts";

const SIGNED_URL_EXPIRY = 86400;

export interface GenerationOutput {
  generation_id: string;
  status: "completed";
  pdf_url: string | null;
  expires_at: string;
  ats_score: number;
  ats_tips: string[];
  what_changed: string;
  jd_keywords_matched: string[];
  jd_keywords_missed: string[];
}

export async function runResumeGeneration(
  supabase: SupabaseClient,
  userId: string,
  inputId: string,
  generationId: string
): Promise<GenerationOutput> {
  const { data: input, error: inputError } = await supabase
    .from("resume_inputs")
    .select("*")
    .eq("id", inputId)
    .eq("user_id", userId)
    .single();

  if (inputError || !input) {
    throw new Error("Input not found");
  }

  const rawInput = formatRawInput(input);
  const claudeOutput = await generateResumeContent(
    rawInput,
    input.jd_text || "",
    input.target_role || undefined
  );

  const rawLatex = claudeOutput.latex_code.includes("\\documentclass")
    ? claudeOutput.latex_code
    : buildLatexDocument(
        claudeOutput.latex_body || claudeOutput.latex_code,
        input.full_name || "Candidate",
        input.email || "",
        input.phone || ""
      );

  const latexCode = normalizeLatexDocument(rawLatex);

  const pdfBytes = await compileLatex(latexCode);

  const filename = pdfFilename(input.full_name || "resume");
  const storagePath = `${userId}/resumes/${generationId}/${filename}`;

  let uploadError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.storage
      .from("rizzme-resumes")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (!error) {
      uploadError = null;
      break;
    }
    uploadError = new Error(error.message);
  }

  if (uploadError) {
    throw uploadError;
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000);
  const { data: signedUrlData } = await supabase.storage
    .from("rizzme-resumes")
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

  const pdfUrl = signedUrlData?.signedUrl || null;

  await supabase
    .from("generations")
    .update({
      status: "completed",
      generated_content: claudeOutput.what_changed,
      latex_code: latexCode,
      pdf_storage_path: storagePath,
      pdf_signed_url: pdfUrl,
      pdf_url_expires_at: expiresAt.toISOString(),
      ats_score: claudeOutput.ats_score,
      ats_tips: claudeOutput.ats_tips,
      what_changed: claudeOutput.what_changed,
      input_quality_warnings: claudeOutput.input_flags,
      jd_keywords_matched: claudeOutput.jd_keywords_matched,
      jd_keywords_missed: claudeOutput.jd_keywords_missed,
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  return {
    generation_id: generationId,
    status: "completed",
    pdf_url: pdfUrl,
    expires_at: expiresAt.toISOString(),
    ats_score: claudeOutput.ats_score,
    ats_tips: claudeOutput.ats_tips,
    what_changed: claudeOutput.what_changed,
    jd_keywords_matched: claudeOutput.jd_keywords_matched,
    jd_keywords_missed: claudeOutput.jd_keywords_missed,
  };
}

export async function unlockGeneration(
  supabase: SupabaseClient,
  userId: string,
  generationId: string,
  paymentId: string
): Promise<GenerationOutput> {
  const { data: gen, error: genError } = await supabase
    .from("generations")
    .select(
      "id, status, payment_id, pdf_signed_url, pdf_url_expires_at, pdf_storage_path, ats_score, ats_tips, what_changed, jd_keywords_matched, jd_keywords_missed, input_id"
    )
    .eq("id", generationId)
    .eq("user_id", userId)
    .single();

  if (genError || !gen) {
    throw new Error("Generation not found");
  }

  if (gen.status !== "completed") {
    throw new Error("Resume preview is not ready yet");
  }

  if (gen.payment_id === paymentId) {
    return {
      generation_id: generationId,
      status: "completed",
      pdf_url: gen.pdf_signed_url,
      expires_at: gen.pdf_url_expires_at || new Date().toISOString(),
      ats_score: gen.ats_score ?? 0,
      ats_tips: (gen.ats_tips as string[]) ?? [],
      what_changed: gen.what_changed ?? "",
      jd_keywords_matched: (gen.jd_keywords_matched as string[]) ?? [],
      jd_keywords_missed: (gen.jd_keywords_missed as string[]) ?? [],
    };
  }

  if (gen.payment_id && gen.payment_id !== paymentId) {
    throw new Error("This resume has already been paid for");
  }

  const { data: input } = await supabase
    .from("resume_inputs")
    .select("email, full_name")
    .eq("id", gen.input_id)
    .single();

  await supabase
    .from("generations")
    .update({ payment_id: paymentId })
    .eq("id", generationId);

  await supabase.rpc("increment_generations", { user_uuid: userId });

  await supabase
    .from("resume_inputs")
    .update({ is_draft: false })
    .eq("id", gen.input_id);

  let pdfUrl = gen.pdf_signed_url;
  let expiresAt = gen.pdf_url_expires_at;

  const expired =
    !expiresAt || new Date(expiresAt) < new Date();

  if (expired && gen.pdf_storage_path) {
    const freshExpiry = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000);
    const { data: signedUrlData } = await supabase.storage
      .from("rizzme-resumes")
      .createSignedUrl(gen.pdf_storage_path, SIGNED_URL_EXPIRY);

    pdfUrl = signedUrlData?.signedUrl || null;
    expiresAt = freshExpiry.toISOString();

    await supabase
      .from("generations")
      .update({
        pdf_signed_url: pdfUrl,
        pdf_url_expires_at: expiresAt,
      })
      .eq("id", generationId);
  }

  if (input?.email && gen.pdf_storage_path) {
    const { data: fileData } = await supabase.storage
      .from("rizzme-resumes")
      .download(gen.pdf_storage_path);

    if (fileData) {
      const pdfBytes = new Uint8Array(await fileData.arrayBuffer());
      const { sendResumeEmail } = await import("./email.ts");
      await sendResumeEmail(
        input.email,
        input.full_name || "Student",
        pdfBytes,
        pdfUrl || ""
      );
      await supabase
        .from("generations")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", generationId);
    }
  }

  return {
    generation_id: generationId,
    status: "completed",
    pdf_url: pdfUrl,
    expires_at: expiresAt || new Date().toISOString(),
    ats_score: gen.ats_score ?? 0,
    ats_tips: (gen.ats_tips as string[]) ?? [],
    what_changed: gen.what_changed ?? "",
    jd_keywords_matched: (gen.jd_keywords_matched as string[]) ?? [],
    jd_keywords_missed: (gen.jd_keywords_missed as string[]) ?? [],
  };
}
