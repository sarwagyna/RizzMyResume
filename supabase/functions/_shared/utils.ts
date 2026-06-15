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
