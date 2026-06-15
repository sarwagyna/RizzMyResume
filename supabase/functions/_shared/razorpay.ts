import { createHmac } from "node:crypto";

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export function getRazorpayConfig() {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase secrets."
    );
  }

  return { keyId, keySecret };
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  notes?: Record<string, string>
): Promise<{ id: string; amount: number }> {
  const { keyId, keySecret } = getRazorpayConfig();
  const auth = btoa(`${keyId}:${keySecret}`);

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
      notes: notes ?? {},
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Razorpay order failed: ${err}`);
  }

  return response.json();
}
