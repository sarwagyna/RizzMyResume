"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PDFDownload } from "@/components/result/PDFDownload";
import { ATSScore } from "@/components/result/ATSScore";
import { WhatChanged } from "@/components/result/WhatChanged";
import { JDKeywords } from "@/components/result/JDKeywords";
import { invokeFunction } from "@/lib/supabase/client";
import { PageContainer } from "@/components/shared/PageContainer";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface GenerationData {
  status: string;
  pdf_url: string | null;
  expires_at: string | null;
  expired: boolean;
  is_paid: boolean;
  input_id: string;
  ats_score: number | null;
  ats_tips: string[] | null;
  what_changed: string | null;
  jd_keywords_matched: string[] | null;
  jd_keywords_missed: string[] | null;
  generation_id: string;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const generationId = searchParams.get("id");
  const [data, setData] = useState<GenerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!generationId) return;
    const result = await invokeFunction<GenerationData>(
      `generation-status?id=${generationId}`,
      undefined,
      { method: "GET" }
    );
    setData(result);
  }, [generationId]);

  useEffect(() => {
    if (!generationId) {
      setError("No generation ID provided");
      setLoading(false);
      return;
    }

    fetchStatus()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load result")
      )
      .finally(() => setLoading(false));
  }, [generationId, fetchStatus]);

  const handleRefresh = async () => {
    if (!generationId) return;
    setRefreshing(true);
    try {
      const refreshed = await invokeFunction<{ pdf_url: string }>("download", {
        generation_id: generationId,
      });
      setData((prev) =>
        prev
          ? { ...prev, pdf_url: refreshed.pdf_url, expired: false }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer size="sm">
        <LoadingSpinner className="py-12" label="Loading your resume..." />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer size="sm">
        <Card className="text-center">
          <p className="text-error">{error || "Result not found"}</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="sm" className="space-y-6">
      <div className="text-center">
        <h1 className="display-md mb-2">Your resume is ready</h1>
        <p className="text-sm text-muted sm:text-base">
          Download your PDF or check your email for a backup copy.
        </p>
      </div>

      {!data.is_paid ? (
        <Card className="space-y-4 text-center">
          <p className="text-muted">
            Payment is required before you can download this resume.
          </p>
          <Link href={`/generate/payment?generation_id=${data.generation_id}`}>
            <Button className="w-full sm:w-auto">Complete payment — ₹50</Button>
          </Link>
        </Card>
      ) : (
        <PDFDownload
          pdfUrl={data.pdf_url}
          expired={data.expired}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}

      <ATSScore
        score={data.ats_score}
        tips={data.ats_tips}
        matched={data.jd_keywords_matched}
        missed={data.jd_keywords_missed}
        subtitle="Score for your AI-optimized resume after ATS fixes were applied."
      />
      <WhatChanged content={data.what_changed} />
      <JDKeywords
        matched={data.jd_keywords_matched}
        missed={data.jd_keywords_missed}
      />

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 sm:pt-4">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            View history
          </Button>
        </Link>
        <Link href="/generate" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create another resume</Button>
        </Link>
      </div>
    </PageContainer>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-section" />}>
      <ResultContent />
    </Suspense>
  );
}
