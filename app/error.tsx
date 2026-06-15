"use client";

import { useEffect } from "react";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { PageContainer } from "@/components/shared/PageContainer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer size="sm">
      <Card className="space-y-4 text-center">
        <h1 className="display-sm">Something went wrong</h1>
        <p className="text-sm text-muted">
          An unexpected error occurred. Please try again or return home.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
