import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
} from "../_shared/utils.ts";

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const user = await getAuthUser(req);
  if (!user?.id) return errorResponse("Unauthorized", 401);

  const url = new URL(req.url);
  const generationId = url.searchParams.get("id");
  if (!generationId) return errorResponse("id query param required");

  const supabase = getServiceClient();

  const { data: gen, error } = await supabase
    .from("generations")
    .select(
      "id, status, pdf_signed_url, pdf_url_expires_at, ats_score, ats_tips, what_changed, jd_keywords_matched, jd_keywords_missed, input_id, payment_id, created_at, completed_at"
    )
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single();

  if (error || !gen) return errorResponse("Generation not found", 404);

  const expired =
    gen.pdf_url_expires_at &&
    new Date(gen.pdf_url_expires_at) < new Date();

  return jsonResponse({
    status: gen.status,
    pdf_url:
      gen.payment_id && !expired ? gen.pdf_signed_url : null,
    expires_at: gen.pdf_url_expires_at,
    expired,
    ats_score: gen.ats_score,
    ats_tips: gen.ats_tips,
    what_changed: gen.what_changed,
    jd_keywords_matched: gen.jd_keywords_matched,
    jd_keywords_missed: gen.jd_keywords_missed,
    generation_id: gen.id,
    input_id: gen.input_id,
    is_paid: Boolean(gen.payment_id),
    created_at: gen.created_at,
    error_message:
      gen.status === "failed" && gen.what_changed
        ? gen.what_changed.replace(/^Generation failed:\s*/i, "")
        : null,
  });
});
