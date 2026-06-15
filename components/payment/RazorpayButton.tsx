"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { invokeFunction } from "@/lib/supabase/client";
import {
  getRazorpayPublicKey,
  loadRazorpayScript,
  type RazorpaySuccessResponse,
} from "@/lib/razorpay";
import { useFormStore } from "@/stores/formStore";
import type { PaymentOrderResponse } from "@/lib/types";

interface RazorpayButtonProps {
  inputId: string;
  generationId?: string | null;
  fullName: string;
  email: string;
  phone: string;
}

export function RazorpayButton({
  inputId,
  generationId,
  fullName,
  email,
  phone,
}: RazorpayButtonProps) {
  const router = useRouter();
  const { setPaymentId } = useFormStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!generationId) {
      setError("Generate a preview before paying.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await invokeFunction<PaymentOrderResponse>(
        "payment?action=create",
        {
          input_id: inputId,
          generation_id: generationId,
        }
      );

      const razorpayKey = getRazorpayPublicKey(order.key);
      await loadRazorpayScript();

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        window.location.origin;

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Rizz My Resume",
        description: "ATS-ready resume PDF download",
        image: `${appUrl}/logo.svg`,
        order_id: order.order_id,
        prefill: {
          name: fullName || undefined,
          email: email || undefined,
          contact: phone || undefined,
        },
        theme: { color: "#111111" },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verified = await invokeFunction<{
              verified: boolean;
              payment_id: string;
            }>("payment?action=verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verified.verified) {
              setPaymentId(verified.payment_id);
              router.push("/generate/processing");
            }
          } catch (verifyErr) {
            setError(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment verification failed"
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. Your preview is saved — try again.");
          },
        },
      });

      rzp.on("payment.failed", (response: { error?: { description?: string } }) => {
        setLoading(false);
        setError(response.error?.description || "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayment}
        loading={loading}
        disabled={!generationId}
        className="w-full"
        size="lg"
      >
        Pay ₹50 with Razorpay
      </Button>
      {!generationId && (
        <p className="text-center text-xs text-muted-soft">
          Generate a preview first to unlock payment.
        </p>
      )}
      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
