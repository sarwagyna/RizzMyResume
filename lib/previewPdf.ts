import { createClient } from "@/lib/supabase/client";
import { getClientEnv } from "@/lib/env";

export async function fetchPreviewPdf(generationId: string): Promise<ArrayBuffer> {
  const env = getClientEnv();
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/preview-pdf?id=${encodeURIComponent(generationId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session?.access_token ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Failed to load preview";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // Response body may not be JSON.
    }
    throw new Error(message);
  }

  return response.arrayBuffer();
}
