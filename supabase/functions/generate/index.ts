import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
} from "../_shared/utils.ts";
import {
  runResumeGeneration,
  unlockGeneration,
} from "../_shared/generationPipeline.ts";

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxCalls = 5;
  const timestamps = (rateLimitMap.get(userId) || []).filter(
    (t) => now - t < windowMs
  );
  if (timestamps.length >= maxCalls) return false;
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const user = await getAuthUser(req);
  if (!user?.id) return errorResponse("Unauthorized", 401);

  if (!checkRateLimit(user.id)) {
    return errorResponse("Rate limit exceeded. Try again in a minute.", 429);
  }

  const body = await req.json();
  const { payment_id, input_id, generation_id } = body;

  if (!payment_id) {
    return errorResponse("payment_id required");
  }

  const supabase = getServiceClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, status, user_id")
    .eq("id", payment_id)
    .eq("user_id", user.id)
    .single();

  if (!payment || payment.status !== "verified") {
    return errorResponse("Payment not verified", 402);
  }

  if (generation_id) {
    try {
      const result = await unlockGeneration(
        supabase,
        user.id,
        generation_id,
        payment_id
      );
      return jsonResponse(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unlock failed";
      return errorResponse(message, 400);
    }
  }

  if (!input_id) {
    return errorResponse("input_id or generation_id required");
  }

  const { data: existing } = await supabase
    .from("generations")
    .select(
      "id, status, pdf_signed_url, pdf_url_expires_at, ats_score, what_changed, jd_keywords_matched, jd_keywords_missed, ats_tips"
    )
    .eq("payment_id", payment_id)
    .maybeSingle();

  if (existing?.status === "completed") {
    return jsonResponse({
      generation_id: existing.id,
      status: "completed",
      pdf_url: existing.pdf_signed_url,
      expires_at: existing.pdf_url_expires_at,
      ats_score: existing.ats_score,
      what_changed: existing.what_changed,
      jd_keywords_matched: existing.jd_keywords_matched,
      jd_keywords_missed: existing.jd_keywords_missed,
      ats_tips: existing.ats_tips,
    });
  }

  const { data: input, error: inputError } = await supabase
    .from("resume_inputs")
    .select("id")
    .eq("id", input_id)
    .eq("user_id", user.id)
    .single();

  if (inputError || !input) return errorResponse("Input not found", 404);

  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      input_id,
      payment_id,
      status: "processing",
    })
    .select("id")
    .single();

  if (genError) return errorResponse(genError.message, 500);

  try {
    const result = await runResumeGeneration(
      supabase,
      user.id,
      input_id,
      generation.id
    );

    await supabase.rpc("increment_generations", { user_uuid: user.id });

    await supabase
      .from("resume_inputs")
      .update({ is_draft: false })
      .eq("id", input_id);

    const { data: inputRow } = await supabase
      .from("resume_inputs")
      .select("email, full_name")
      .eq("id", input_id)
      .single();

    if (inputRow?.email && result.pdf_url) {
      const { data: genRow } = await supabase
        .from("generations")
        .select("pdf_storage_path")
        .eq("id", generation.id)
        .single();

      if (genRow?.pdf_storage_path) {
        const { data: fileData } = await supabase.storage
          .from("rizzme-resumes")
          .download(genRow.pdf_storage_path);

        if (fileData) {
          const pdfBytes = new Uint8Array(await fileData.arrayBuffer());
          const { sendResumeEmail } = await import("../_shared/email.ts");
          await sendResumeEmail(
            inputRow.email,
            inputRow.full_name || "Student",
            pdfBytes,
            result.pdf_url
          );
          await supabase
            .from("generations")
            .update({ email_sent_at: new Date().toISOString() })
            .eq("id", generation.id);
        }
      }
    }

    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    await supabase
      .from("generations")
      .update({ status: "failed" })
      .eq("id", generation.id);

    return errorResponse(message, 500);
  }
});
