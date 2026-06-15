import { getClientEnv } from "@/lib/env";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export function getRazorpayPublicKey(fallbackFromServer?: string | null): string {
  const env = getClientEnv();
  const key = fallbackFromServer || env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!key) {
    throw new Error(
      "Razorpay key is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local and RAZORPAY_KEY_ID to Supabase secrets."
    );
  }

  return key;
}

export type { RazorpaySuccessResponse };
