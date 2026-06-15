"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResumePreviewViewer } from "@/components/preview/ResumePreviewViewer";
import { ATSScore } from "@/components/result/ATSScore";
import { JDKeywords } from "@/components/result/JDKeywords";
import { WhatChanged } from "@/components/result/WhatChanged";
import { RetentionNotice } from "@/components/preview/RetentionNotice";
import { invokeFunction } from "@/lib/supabase/client";
import { PageContainer } from "@/components/shared/PageContainer";
import { useFormStore } from "@/stores/formStore";
import { COMPANY } from "@/lib/company";

interface PreviewResult {
  generation_id: string;
  status: string;
  pdf_url?: string | null;
  ats_score?: number | null;
  ats_tips?: string[] | null;
  what_changed?: string | null;
  jd_keywords_matched?: string[] | null;
  jd_keywords_missed?: string[] | null;
}

export default function PreviewPage() {
  const router = useRouter();
  const { inputId, generationId, setGenerationId } = useFormStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!inputId) {
      router.replace("/generate");
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    const pollStatus = async (id: string) => {
      const status = await invokeFunction<PreviewResult & { is_paid?: boolean }>(
        `generation-status?id=${id}`,
        undefined,
        { method: "GET" }
      );

      if (cancelled) return;

      if (status.status === "completed") {
        setPreview(status);
        setGenerationId(status.generation_id);
        setProgress(100);
        setLoading(false);
        if (pollTimer) clearInterval(pollTimer);
        return;
      }

      if (status.status === "failed") {
        setError("Preview generation failed. Please try again.");
        setLoading(false);
        if (pollTimer) clearInterval(pollTimer);
      }
    };

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(20);

        if (generationId) {
          const existing = await invokeFunction<PreviewResult & { is_paid?: boolean }>(
            `generation-status?id=${generationId}`,
            undefined,
            { method: "GET" }
          );

          if (existing.status === "completed" && existing.is_paid) {
            router.replace(`/generate/result?id=${existing.generation_id}`);
            return;
          }

          if (existing.status === "processing") {
            setGenerationId(existing.generation_id);
            setProgress(55);
            pollTimer = setInterval(() => {
              setProgress((value) => Math.min(value + 8, 92));
              pollStatus(existing.generation_id).catch(() => {
                // Keep polling until completion or failure.
              });
            }, 2000);

            await pollStatus(existing.generation_id);
            return;
          }
        }

        setProgress(35);
        const result = await invokeFunction<PreviewResult>("preview", {
          input_id: inputId,
        });

        if (cancelled) return;

        setGenerationId(result.generation_id);

        if (result.status === "completed") {
          setPreview(result);
          setProgress(100);
          setLoading(false);
          return;
        }

        setProgress(55);
        pollTimer = setInterval(() => {
          setProgress((value) => Math.min(value + 8, 92));
          pollStatus(result.generation_id).catch(() => {
            // Keep polling until completion or failure.
          });
        }, 2000);

        await pollStatus(result.generation_id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Preview failed");
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [inputId, generationId, router, setGenerationId]);

  if (loading) {
    return (
      <PageContainer>
        <Card className="text-center">
          <LoadingSpinner size="lg" label="" className="mb-6" />
          <h1 className="display-sm mb-2">Generating your preview</h1>
          <p className="mb-6 text-sm text-muted sm:text-base">
            AI is writing and compiling your resume. This usually takes under 40
            seconds.
          </p>
          <ProgressBar value={progress} label="Progress" />
          <RetentionNotice className="mt-6 text-left" compact />
          <p className="mt-3 text-center text-xs text-muted-soft">
            {COMPANY.aiDisclaimer}
          </p>
        </Card>
      </PageContainer>
    );
  }

  if (error || !preview) {
    return (
      <PageContainer size="sm">
        <Card className="space-y-4 text-center">
          <p className="text-error">{error || "Preview not available"}</p>
          <Link href="/generate">
            <Button variant="secondary" className="w-full sm:w-auto">
              Back to form
            </Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="display-md mb-2">Your resume preview</h1>
          <p className="text-sm text-muted sm:text-base">
            Review how it looks before paying. Happy with it? Unlock the PDF for
            ₹50.
          </p>
        </div>
        <Link href="/generate" className="shrink-0">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            Edit details
          </Button>
        </Link>
      </div>

      <RetentionNotice />

      <p className="text-center text-xs text-muted-soft">
        {COMPANY.aiDisclaimer}
      </p>

      <ResumePreviewViewer generationId={preview.generation_id} />

      <ATSScore
        score={preview.ats_score ?? null}
        tips={preview.ats_tips ?? null}
        matched={preview.jd_keywords_matched ?? null}
        missed={preview.jd_keywords_missed ?? null}
      />
      <WhatChanged content={preview.what_changed ?? null} />
      <JDKeywords
        matched={preview.jd_keywords_matched ?? null}
        missed={preview.jd_keywords_missed ?? null}
      />

      <Card className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-semibold text-ink">Ready to download?</p>
          <p className="text-sm text-muted">
            One-time payment of ₹50 unlocks PDF download and email delivery.
          </p>
        </div>
        <Link
          href={`/generate/payment?generation_id=${preview.generation_id}`}
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Continue to payment
          </Button>
        </Link>
      </Card>
    </PageContainer>
  );
}
