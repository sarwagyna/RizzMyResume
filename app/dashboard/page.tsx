"use client";

import Link from "next/link";
import { GenerationHistory } from "@/components/dashboard/GenerationHistory";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/shared/Button";

export default function DashboardPage() {
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
        <GenerationHistory />
      </PageContainer>
    </ErrorBoundary>
  );
}
