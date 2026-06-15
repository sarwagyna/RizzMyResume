"use client";

import { Button } from "@/components/shared/Button";

interface PDFDownloadProps {
  pdfUrl: string | null;
  expired?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function PDFDownload({
  pdfUrl,
  expired,
  onRefresh,
  refreshing,
}: PDFDownloadProps) {
  if (expired || !pdfUrl) {
    return (
      <div className="rounded-lg border border-hairline bg-surface-soft p-6 text-center">
        <p className="mb-4 text-muted">
          Download link expired. Refresh to get a new 24-hour link.
        </p>
        {onRefresh && (
          <Button onClick={onRefresh} loading={refreshing} variant="secondary">
            Refresh download link
          </Button>
        )}
      </div>
    );
  }

  return (
    <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
      <Button size="lg" className="w-full">
        Download PDF
      </Button>
    </a>
  );
}
