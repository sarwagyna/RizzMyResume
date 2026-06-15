import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.invalid";
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      "placeholder-anon-key-for-ssr";
    return createBrowserClient(url, key);
  }

  if (!browserClient) {
    const env = getClientEnv();
    browserClient = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return browserClient;
}

export async function invokeFunction<T>(
  name: string,
  body?: Record<string, unknown>,
  options?: { method?: string }
): Promise<T> {
  const env = getClientEnv();
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const method = options?.method ?? "POST";
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session?.access_token ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  };

  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: method !== "GET" && body ? JSON.stringify(body) : undefined,
  });

  let data: { error?: string; message?: string } = {};
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. platform error pages).
  }

  if (!response.ok) {
    if (response.status === 546) {
      throw new Error(
        "Resume generation is still running. Please wait a moment and try again."
      );
    }
    throw new Error(
      data.error || data.message || `Request failed (${response.status})`
    );
  }
  return data as T;
}

/** Runs AI + PDF generation. May take 1–2 minutes. */
export async function runGenerationWorker(
  generationId: string,
  inputId: string
): Promise<{ generation_id: string; status: string }> {
  return invokeFunction("process-generation", {
    generation_id: generationId,
    input_id: inputId,
  });
}

/** Non-blocking — starts generation; poll generation-status for completion. */
export function triggerGenerationWorker(
  generationId: string,
  inputId: string
): void {
  void runGenerationWorker(generationId, inputId).catch((err) => {
    console.warn("Generation worker:", err);
  });
}
