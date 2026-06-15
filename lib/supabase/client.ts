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

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: method !== "GET" && body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}
