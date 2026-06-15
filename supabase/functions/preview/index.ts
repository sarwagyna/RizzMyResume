import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
  isGenerationStale,
} from "../_shared/utils.ts";
import { runResumeGeneration } from "../_shared/generationPipeline.ts";

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

function completedPreviewResponse(
  generation: {
    id: string;
    pdf_signed_url: string | null;
    pdf_url_expires_at: string | null;
    ats_score: number | null;
    ats_tips: unknown;
    what_changed: string | null;
    jd_keywords_matched: unknown;
    jd_keywords_missed: unknown;
  },
  stale = false
) {
  return jsonResponse({
    generation_id: generation.id,
    status: "completed",
    expires_at: generation.pdf_url_expires_at,
    ats_score: generation.ats_score,
    ats_tips: generation.ats_tips,
    what_changed: generation.what_changed,
    jd_keywords_matched: generation.jd_keywords_matched,
    jd_keywords_missed: generation.jd_keywords_missed,
    is_paid: false,
    stale,
  });
}

async function regeneratePreview(
  supabase: ReturnType<typeof getServiceClient>,
  userId: string,
  inputId: string,
  generationId: string
) {
  await supabase
    .from("generations")
    .update({ status: "processing" })
    .eq("id", generationId);

  try {
    const result = await runResumeGeneration(
      supabase,
      userId,
      inputId,
      generationId
    );

    return jsonResponse({
      generation_id: result.generation_id,
      status: result.status,
      expires_at: result.expires_at,
      ats_score: result.ats_score,
      ats_tips: result.ats_tips,
      what_changed: result.what_changed,
      jd_keywords_matched: result.jd_keywords_matched,
      jd_keywords_missed: result.jd_keywords_missed,
      is_paid: false,
      regenerated: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Preview failed";
    await supabase
      .from("generations")
      .update({ status: "failed" })
      .eq("id", generationId);

    return errorResponse(message, 500);
  }
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

  const { input_id } = await req.json();
  if (!input_id) return errorResponse("input_id required");

  const supabase = getServiceClient();

  const { data: input, error: inputError } = await supabase
    .from("resume_inputs")
    .select("id, updated_at")
    .eq("id", input_id)
    .eq("user_id", user.id)
    .single();

  if (inputError || !input) return errorResponse("Input not found", 404);

  const { data: existing } = await supabase
    .from("generations")
    .select(
      "id, status, pdf_signed_url, pdf_url_expires_at, ats_score, what_changed, jd_keywords_matched, jd_keywords_missed, ats_tips, payment_id, completed_at"
    )
    .eq("input_id", input_id)
    .eq("user_id", user.id)
    .is("payment_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "completed") {
    const stale = isGenerationStale(input.updated_at, existing.completed_at);

    if (!stale) {
      return completedPreviewResponse(existing);
    }

    return regeneratePreview(supabase, user.id, input_id, existing.id);
  }

  if (existing?.status === "processing") {
    return jsonResponse({
      generation_id: existing.id,
      status: "processing",
    });
  }

  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      input_id,
      payment_id: null,
      status: "processing",
    })
    .select("id")
    .single();

  if (genError) return errorResponse(genError.message, 500);

  return regeneratePreview(supabase, user.id, input_id, generation.id);
});
