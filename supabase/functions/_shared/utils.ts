export function getCorsHeaders(): Record<string, string> {
  const allowedOrigin =
    Deno.env.get("ALLOWED_ORIGIN")?.trim() ||
    Deno.env.get("APP_URL")?.trim() ||
    "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

/** @deprecated Use getCorsHeaders() — kept for static re-exports during deploy. */
export const corsHeaders = getCorsHeaders();

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

export function isGenerationStale(
  inputUpdatedAt: string | null | undefined,
  generationCompletedAt: string | null | undefined
): boolean {
  if (!inputUpdatedAt || !generationCompletedAt) return false;
  return (
    new Date(inputUpdatedAt).getTime() >
    new Date(generationCompletedAt).getTime()
  );
}

const PROCESSING_STALE_MS = 3 * 60 * 1000;

/** True when a generation has been processing too long (likely a crashed/timed-out worker). */
export function isProcessingStale(
  createdAt: string | null | undefined,
  completedAt: string | null | undefined,
  status: string | null | undefined
): boolean {
  if (status !== "processing") return false;
  if (completedAt) return false;
  if (!createdAt) return true;
  return Date.now() - new Date(createdAt).getTime() > PROCESSING_STALE_MS;
}

export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authHeader,
      apikey: supabaseAnonKey,
    },
  });

  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? user : null;
}
