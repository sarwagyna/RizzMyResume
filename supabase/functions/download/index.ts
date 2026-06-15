import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
} from "../_shared/utils.ts";

const SIGNED_URL_EXPIRY = 86400;

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

  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const user = await getAuthUser(req);
  if (!user?.id) return errorResponse("Unauthorized", 401);

  const { generation_id } = await req.json();
  if (!generation_id) return errorResponse("generation_id required");

  const supabase = getServiceClient();

  const { data: gen, error } = await supabase
    .from("generations")
    .select("id, pdf_storage_path, pdf_url_expires_at, created_at, payment_id")
    .eq("id", generation_id)
    .eq("user_id", user.id)
    .single();

  if (error || !gen) return errorResponse("Generation not found", 404);

  if (!gen.payment_id) {
    return errorResponse("Payment required before download", 403);
  }

  const createdAt = new Date(gen.created_at).getTime();
  const maxAge = SIGNED_URL_EXPIRY * 1000;
  if (Date.now() - createdAt > maxAge) {
    return jsonResponse({ expired: true, input_id: null });
  }

  if (!gen.pdf_storage_path) {
    return errorResponse("PDF not available", 404);
  }

  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from("rizzme-resumes")
    .createSignedUrl(gen.pdf_storage_path, SIGNED_URL_EXPIRY);

  if (urlError || !signedUrlData?.signedUrl) {
    return errorResponse("Failed to create download URL", 500);
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000);

  await supabase
    .from("generations")
    .update({
      pdf_signed_url: signedUrlData.signedUrl,
      pdf_url_expires_at: expiresAt.toISOString(),
    })
    .eq("id", generation_id);

  return jsonResponse({
    pdf_url: signedUrlData.signedUrl,
    expires_at: expiresAt.toISOString(),
  });
});
