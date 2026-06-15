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

  if (req.method !== "GET") return errorResponse("Method not allowed", 405);

  const user = await getAuthUser(req);
  if (!user?.id) return errorResponse("Unauthorized", 401);

  const supabase = getServiceClient();

  const { data: generations, error } = await supabase
    .from("generations")
    .select(
      `
      id,
      input_id,
      status,
      payment_id,
      pdf_signed_url,
      pdf_url_expires_at,
      ats_score,
      created_at,
      completed_at,
      resume_inputs ( target_role )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return errorResponse(error.message, 500);

  const items = (generations || []).map((g) => {
    const input = g.resume_inputs as { target_role?: string } | null;
    const isPaid = Boolean(g.payment_id);
    const expired =
      isPaid &&
      g.pdf_url_expires_at &&
      new Date(g.pdf_url_expires_at) < new Date();

    return {
      id: g.id,
      input_id: g.input_id,
      status: g.status,
      target_role: input?.target_role || "Resume",
      is_paid: isPaid,
      pdf_url: isPaid && !expired ? g.pdf_signed_url : null,
      expires_at: g.pdf_url_expires_at,
      expired: Boolean(expired),
      ats_score: g.ats_score,
      created_at: g.created_at,
      completed_at: g.completed_at,
    };
  });

  return jsonResponse({ generations: items });
});
