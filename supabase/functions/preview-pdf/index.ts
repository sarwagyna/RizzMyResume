import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
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

  const url = new URL(req.url);
  const generationId = url.searchParams.get("id");
  if (!generationId) return errorResponse("id query param required");

  const supabase = getServiceClient();

  const { data: gen, error } = await supabase
    .from("generations")
    .select("id, status, pdf_storage_path, payment_id")
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single();

  if (error || !gen) return errorResponse("Generation not found", 404);

  if (gen.payment_id) {
    return errorResponse("Preview stream not available for paid generations", 403);
  }

  if (gen.status !== "completed" || !gen.pdf_storage_path) {
    return errorResponse("Preview PDF not ready", 404);
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from("rizzme-resumes")
    .download(gen.pdf_storage_path);

  if (downloadError || !fileData) {
    return errorResponse("Failed to load preview PDF", 500);
  }

  const pdfBytes = await fileData.arrayBuffer();

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
