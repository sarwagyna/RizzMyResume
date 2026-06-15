import { z } from "zod";
import { getAppUrl } from "@/lib/site";

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

/** Validated public env for browser + server components. Throws in production if invalid. */
export function getClientEnv(): ClientEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = clientEnvSchema.safeParse(readRawEnv());

  if (!parsed.success) {
    if (process.env.NODE_ENV === "production") {
      const fields = parsed.error.flatten().fieldErrors;
      throw new Error(
        `Invalid public environment configuration: ${JSON.stringify(fields)}`
      );
    }

    cachedEnv = {
      NEXT_PUBLIC_SUPABASE_URL:
        readRawEnv().NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        readRawEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dev-anon-key-placeholder",
      NEXT_PUBLIC_APP_URL: getAppUrl(),
      NEXT_PUBLIC_RAZORPAY_KEY_ID:
        readRawEnv().NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_devplaceholder",
    };
    return cachedEnv;
  }

  if (
    process.env.NODE_ENV === "production" &&
    !parsed.data.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_live_")
  ) {
    console.warn(
      "[Rizz My Resume] Production is using a Razorpay TEST key. Set rzp_live_ keys before accepting real payments."
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV === "production") {
    getClientEnv();
  }
}
