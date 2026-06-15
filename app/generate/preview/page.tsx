"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  invokeFunction,
  triggerGenerationWorker,
} from "@/lib/supabase/client";
import { fetchReferralStats } from "@/lib/referralStats";
import { CREDITS_PER_FREE_RESUME } from "@/lib/referrals";
import { PageContainer } from "@/components/shared/PageContainer";
import { useFormStore } from "@/stores/formStore";
import { useFormStoreHydrated } from "@/lib/useFormStoreHydrated";
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
  error_message?: string | null;
}

const POLL_INTERVAL_MS = 3000;
const WORKER_RETRY_MS = 90_000;

function formatFailureMessage(
  status: PreviewResult & { error_message?: string | null }
): string {
  if (status.error_message) return status.error_message;
  if (status.what_changed?.startsWith("Generation failed:")) {
    return status.what_changed.replace(/^Generation failed:\s*/i, "");
  }
  return "Preview generation failed. Please try again from the form.";
}

export default function PreviewPage() {
  const router = useRouter();
  const hydrated = useFormStoreHydrated();
  const { inputId, setGenerationId, setStep } = useFormStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [progress, setProgress] = useState(15);
  const [credits, setCredits] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workerRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeGenerationIdRef = useRef<string | null>(null);
  const workerRetriedRef = useRef(false);
  const pollInFlightRef = useRef(false);
  const kickoffStartedRef = useRef<string | null>(null);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (workerRetryTimerRef.current) {
      clearTimeout(workerRetryTimerRef.current);
      workerRetryTimerRef.current = null;
    }
  }, []);

  const pollUntilComplete = useCallback(
    async (id: string) => {
      const status = await invokeFunction<
        PreviewResult & { is_paid?: boolean; error_message?: string | null }
      >(`generation-status?id=${id}`, undefined, { method: "GET" });

      if (status.status === "completed") {
        setPreview(status);
        setGenerationId(status.generation_id);
        setProgress(100);
        setLoading(false);
        setRegenerating(false);
        setStatusMessage(null);
        clearPollTimer();
        return true;
      }

      if (status.status === "failed") {
        setError(formatFailureMessage(status));
        setLoading(false);
        setRegenerating(false);
        setStatusMessage(null);
        clearPollTimer();
        return true;
      }

      return false;
    },
    [clearPollTimer, setGenerationId]
  );

  const beginGeneration = useCallback(
    (generationId: string, resolvedInputId: string) => {
      activeGenerationIdRef.current = generationId;
      workerRetriedRef.current = false;

      setProgress(50);
      setStatusMessage("Writing and compiling your resume…");

      triggerGenerationWorker(generationId, resolvedInputId);

      void pollUntilComplete(generationId);

      clearPollTimer();
      pollTimerRef.current = setInterval(() => {
        setProgress((value) => Math.min(value + 2, 92));
        const activeId = activeGenerationIdRef.current;
        if (!activeId || pollInFlightRef.current) return;

        pollInFlightRef.current = true;
        pollUntilComplete(activeId)
          .catch(() => {
            // Keep polling on transient errors.
          })
          .finally(() => {
            pollInFlightRef.current = false;
          });
      }, POLL_INTERVAL_MS);

      workerRetryTimerRef.current = setTimeout(async () => {
        if (workerRetriedRef.current || !activeGenerationIdRef.current) return;

        try {
          const status = await invokeFunction<
            PreviewResult & { error_message?: string | null }
          >(
            `generation-status?id=${activeGenerationIdRef.current}`,
            undefined,
            { method: "GET" }
          );

          if (status.status === "completed" || status.status === "failed") {
            return;
          }
        } catch {
          // If status check fails, still allow one worker retry.
        }

        workerRetriedRef.current = true;
        setStatusMessage("Still working — retrying generation…");
        triggerGenerationWorker(activeGenerationIdRef.current, resolvedInputId);
      }, WORKER_RETRY_MS);
    },
    [clearPollTimer, pollUntilComplete]
  );

  const kickoffPreview = useCallback(
    async (forceRegenerate = false) => {
      if (!inputId) return;

      if (forceRegenerate) {
        kickoffStartedRef.current = null;
      }

      setLoading(true);
      setError(null);
      setProgress(forceRegenerate ? 25 : 20);
      if (!forceRegenerate) {
        setStatusMessage(null);
      }

      const result = await invokeFunction<PreviewResult>("preview", {
        input_id: inputId,
        ...(forceRegenerate ? { force_regenerate: true } : {}),
      });

      setGenerationId(result.generation_id);

      if (result.status === "completed") {
        setPreview(result);
        setProgress(100);
        setLoading(false);
        setRegenerating(false);
        setStatusMessage(null);
        return;
      }

      beginGeneration(result.generation_id, inputId);
    },
    [beginGeneration, inputId, setGenerationId]
  );

  useEffect(() => {
    fetchReferralStats()
      .then((stats) => setCredits(stats.credits))
      .catch(() => setCredits(0));
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!inputId) {
      router.replace("/generate");
      return;
    }

    if (kickoffStartedRef.current === inputId) return;
    kickoffStartedRef.current = inputId;

    kickoffPreview().catch((err) => {
      setError(err instanceof Error ? err.message : "Preview failed");
      setLoading(false);
    });

    return () => {
      clearPollTimer();
    };
  }, [hydrated, inputId, router, kickoffPreview, clearPollTimer]);

  const handleRegenerate = async () => {
    if (!inputId || regenerating) return;

    setRegenerating(true);
    try {
      await kickoffPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleEditDetails = () => {
    setStep("personal");
    router.push("/generate");
  };

  if (!hydrated) {
    return (
      <PageContainer>
        <Card className="text-center">
          <LoadingSpinner size="lg" label="" className="mb-6" />
          <p className="text-sm text-muted">Loading your session…</p>
        </Card>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <Card className="text-center">
          <LoadingSpinner size="lg" label="" className="mb-6" />
          <h1 className="display-sm mb-2">Generating your preview</h1>
          <p className="mb-6 text-sm text-muted sm:text-base">
            AI is writing, optimizing for ATS, and compiling your resume. This
            usually takes 1–2 minutes — keep this tab open while we work.
          </p>
          {statusMessage && (
            <p className="mb-4 text-sm text-warning">{statusMessage}</p>
          )}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setError(null);
                kickoffPreview(true).catch((err) => {
                  setError(
                    err instanceof Error ? err.message : "Preview failed"
                  );
                  setLoading(false);
                });
              }}
            >
              Try again
            </Button>
            <Link href="/generate">
              <Button variant="ghost" className="w-full sm:w-auto">
                Back to form
              </Button>
            </Link>
          </div>
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
            Review how it looks before applying. Happy with it? Unlock the PDF for
            ₹50.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {(preview.ats_score ?? 0) < 90 && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "Re-optimizing…" : "Re-optimize for ATS"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleEditDetails}
          >
            Edit details
          </Button>
        </div>
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
        subtitle="AI optimized your resume for ATS — this score reflects the generated resume, not your raw form input."
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
            {credits >= CREDITS_PER_FREE_RESUME
              ? `You have ${credits} credits — unlock free on the next step (50 credits).`
              : "One-time payment of ₹50 unlocks PDF download and email delivery."}
          </p>
        </div>
        <Link
          href={`/generate/payment?generation_id=${preview.generation_id}`}
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="w-full sm:w-auto">
            {credits >= CREDITS_PER_FREE_RESUME
              ? "Unlock with credits"
              : "Continue to payment"}
          </Button>
        </Link>
      </Card>
    </PageContainer>
  );
}
