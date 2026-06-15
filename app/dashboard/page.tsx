"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GenerationHistory } from "@/components/dashboard/GenerationHistory";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { fetchReferralStats } from "@/lib/referralStats";
import { CREDITS_PER_FREE_RESUME } from "@/lib/referrals";

export default function DashboardPage() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetchReferralStats()
      .then((stats) => setCredits(stats.credits))
      .catch(() => setCredits(null));
  }, []);

  return (
    <ErrorBoundary>
      <PageContainer size="sm">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="display-md mb-2">Your resumes</h1>
            <p className="text-sm text-muted sm:text-base">
              Last 5 generations. Paid resumes can be downloaded for 24 hours, then
              removed from our servers.
            </p>
          </div>
          <Link href="/generate" className="w-full shrink-0 sm:w-auto">
            <Button className="w-full sm:w-auto">Create resume</Button>
          </Link>
        </div>

        {credits !== null && (
          <Card className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Referral credits</p>
              <p className="font-display text-3xl text-ink">{credits}</p>
              <p className="text-xs text-muted-soft">
                {CREDITS_PER_FREE_RESUME} credits = 1 free resume
              </p>
            </div>
            <Link href="/referrals" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Invite friends
              </Button>
            </Link>
          </Card>
        )}

        <GenerationHistory />
      </PageContainer>
    </ErrorBoundary>
  );
}
