"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { invokeFunction } from "@/lib/supabase/client";
import { useFormStore } from "@/stores/formStore";
import { CREDITS_PER_FREE_RESUME } from "@/lib/referrals";
import type { CreditRedeemResponse } from "@/lib/types";

interface CreditRedeemButtonProps {
  inputId: string;
  generationId: string;
  credits: number;
  onRedeemed?: (remaining: number) => void;
}

export function CreditRedeemButton({
  inputId,
  generationId,
  credits,
  onRedeemed,
}: CreditRedeemButtonProps) {
  const router = useRouter();
  const { setPaymentId } = useFormStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRedeem = credits >= CREDITS_PER_FREE_RESUME;

  const handleRedeem = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await invokeFunction<CreditRedeemResponse>(
        "payment?action=redeem",
        {
          input_id: inputId,
          generation_id: generationId,
        }
      );

      setPaymentId(result.payment_id);
      onRedeemed?.(result.credits_remaining);
      router.push("/generate/processing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Redemption failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleRedeem}
        loading={loading}
        disabled={!canRedeem}
        variant={canRedeem ? "primary" : "secondary"}
        className="w-full"
        size="lg"
      >
        {canRedeem
          ? `Use ${CREDITS_PER_FREE_RESUME} credits — download free`
          : `Need ${CREDITS_PER_FREE_RESUME} credits for free download`}
      </Button>
      <p className="text-center text-xs text-muted-soft">
        You have {credits} credit{credits === 1 ? "" : "s"}.
        {canRedeem
          ? " Redeem for a free resume download."
          : ` Earn ${CREDITS_PER_FREE_RESUME - credits} more to unlock free.`}
      </p>
      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
