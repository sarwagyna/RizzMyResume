import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
} from "../_shared/utils.ts";
import { runGenerationSafe } from "../_shared/generationPipeline.ts";

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

  const { generation_id, input_id } = await req.json();

  if (!generation_id || !input_id) {
    return errorResponse("generation_id and input_id required");
  }

  const supabase = getServiceClient();

  const { data: gen, error: genError } = await supabase
    .from("generations")
    .select("id, status, input_id, user_id")
    .eq("id", generation_id)
    .eq("user_id", user.id)
    .single();

  if (genError || !gen) {
    return errorResponse("Generation not found", 404);
  }

  if (gen.input_id !== input_id) {
    return errorResponse("Generation does not match input", 400);
  }

  if (gen.status === "completed") {
    return jsonResponse({ generation_id, status: "completed" });
  }

  console.log(
    `process-generation: starting ${generation_id} for user ${user.id}`
  );

  await runGenerationSafe(supabase, user.id, input_id, generation_id);

  const { data: updated } = await supabase
    .from("generations")
    .select("status, what_changed")
    .eq("id", generation_id)
    .single();

  console.log(
    `process-generation: finished ${generation_id} status=${updated?.status ?? "unknown"}`
  );

  if (updated?.status === "failed") {
    const reason =
      updated.what_changed?.replace(/^Generation failed:\s*/i, "") ||
      "Resume generation failed";
    return errorResponse(reason, 500);
  }

  return jsonResponse({
    generation_id,
    status: updated?.status ?? "failed",
  });
});
