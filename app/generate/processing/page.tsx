"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/shared/Card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { invokeFunction } from "@/lib/supabase/client";
import { PageContainer } from "@/components/shared/PageContainer";
import { useFormStore } from "@/stores/formStore";

type Stage = "unlocking" | "ready";

interface GenerationResult {
  generation_id: string;
  status: string;
}

export default function ProcessingPage() {
  const router = useRouter();
  const { inputId, paymentId, generationId, setGenerationId } = useFormStore();
  const [stage, setStage] = useState<Stage>("unlocking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      router.replace("/generate");
      return;
    }

    if (!generationId && !inputId) {
      router.replace("/generate");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setStage("unlocking");

        const payload = generationId
          ? { payment_id: paymentId, generation_id: generationId }
          : { payment_id: paymentId, input_id: inputId };

        const result = await invokeFunction<GenerationResult>("generate", payload);

        if (cancelled) return;

        setGenerationId(result.generation_id);
        setStage("ready");

        setTimeout(() => {
          router.push(`/generate/result?id=${result.generation_id}`);
        }, 800);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unlock failed");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [inputId, paymentId, generationId, router, setGenerationId]);

  const progress = stage === "unlocking" ? 70 : 100;

  return (
    <PageContainer size="sm">
      <Card className="text-center">
        {error ? (
          <>
            <h1 className="display-sm mb-4 text-error">Something went wrong</h1>
            <p className="text-muted">{error}</p>
          </>
        ) : (
          <>
            <LoadingSpinner size="lg" label="" className="mb-6" />
            <h1 className="display-sm mb-2">
              {generationId ? "Unlocking your resume" : "Building your resume"}
            </h1>
            <p className="mb-6 text-muted">
              {stage === "unlocking" &&
                (generationId
                  ? "Confirming payment and preparing your download..."
                  : "AI is writing your resume content...")}
              {stage === "ready" && "Almost done!"}
            </p>
            <ProgressBar value={progress} label="Progress" />
          </>
        )}
      </Card>
    </PageContainer>
  );
}
