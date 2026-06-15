import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/utils.ts";

const RETENTION_MS = 24 * 60 * 60 * 1000;

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function authorizeCron(req: Request): boolean {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) return false;

  const auth = req.headers.get("Authorization");
  return auth === `Bearer ${cronSecret}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  if (!authorizeCron(req)) {
    return errorResponse("Unauthorized", 401);
  }

  const supabase = getServiceClient();
  const cutoff = new Date(Date.now() - RETENTION_MS).toISOString();

  const { data: stale, error: fetchError } = await supabase
    .from("generations")
    .select("id, pdf_storage_path")
    .lt("created_at", cutoff);

  if (fetchError) {
    return errorResponse(fetchError.message, 500);
  }

  const rows = stale ?? [];
  const storagePaths = rows
    .map((row) => row.pdf_storage_path)
    .filter((path): path is string => Boolean(path));

  let storageErrors = 0;
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("rizzme-resumes")
      .remove(storagePaths);

    if (storageError) storageErrors += 1;
  }

  const { error: deleteError, count } = await supabase
    .from("generations")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (deleteError) {
    return errorResponse(deleteError.message, 500);
  }

  return jsonResponse({
    deleted_generations: count ?? rows.length,
    storage_files_removed: storagePaths.length,
    storage_errors: storageErrors,
    cutoff,
  });
});
