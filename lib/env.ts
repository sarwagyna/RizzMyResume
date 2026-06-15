import { z } from "zod";
import { getAppUrl, PRODUCTION_APP_URL } from "@/lib/site";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string()
    .regex(/^rzp_(test|live)_/, "Must be a Razorpay test or live key"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedEnv: ClientEnv | null = null;

function readRawEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? getAppUrl(),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function buildFallbackEnv(): ClientEnv {
  const raw = readRawEnv();
  return {
    NEXT_PUBLIC_SUPABASE_URL:
      raw.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      raw.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dev-anon-key-placeholder0000",
    NEXT_PUBLIC_APP_URL: raw.NEXT_PUBLIC_APP_URL ?? PRODUCTION_APP_URL,
    NEXT_PUBLIC_RAZORPAY_KEY_ID:
      raw.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_buildplaceholder",
  };
}

/**
 * Validated public env. Strict in the browser at runtime; lenient during
 * `next build` / SSR so Vercel can prerender before env is wired everywhere.
 */
export function getClientEnv(): ClientEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = clientEnvSchema.safeParse(readRawEnv());
  const lenient =
    isBuildPhase() ||
    typeof window === "undefined";

  if (!parsed.success) {
    if (lenient || process.env.NODE_ENV !== "production") {
      cachedEnv = buildFallbackEnv();
      return cachedEnv;
    }

    const fields = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid public environment configuration: ${JSON.stringify(fields)}`
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    !parsed.data.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_live_")
  ) {
    console.warn(
      "[Rizz My Resume] Production is using a Razorpay TEST key. Set rzp_live_ keys before accepting real payments."
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/** Clear cache (tests only). */
export function resetClientEnvCache(): void {
  cachedEnv = null;
}
