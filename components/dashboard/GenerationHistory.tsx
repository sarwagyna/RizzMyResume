"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { invokeFunction } from "@/lib/supabase/client";

export interface HistoryItem {
  id: string;
  input_id: string;
  status: string;
  target_role: string;
  is_paid: boolean;
  pdf_url: string | null;
  expires_at: string | null;
  expired: boolean;
  ats_score: number | null;
  created_at: string;
}

function StatusBadge({ item }: { item: HistoryItem }) {
  if (!item.is_paid && item.status === "completed") {
    return (
      <span className="inline-flex rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-ink">
        Preview — payment pending
      </span>
    );
  }
  if (item.is_paid && item.expired) {
    return (
      <span className="inline-flex rounded-full bg-surface-strong px-2 py-0.5 text-xs font-medium text-muted">
        Download link expired
      </span>
    );
  }
  if (item.status === "processing") {
    return (
      <span className="inline-flex rounded-full bg-brand-accent/10 px-2 py-0.5 text-xs font-medium text-brand-accent">
        Processing
      </span>
    );
  }
  if (item.status === "failed") {
    return (
      <span className="inline-flex rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
        Failed
      </span>
    );
  }
  if (item.is_paid) {
    return (
      <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        Paid
      </span>
    );
  }
  return null;
}

export function GenerationCard({
  item,
  onRefreshed,
}: {
  item: HistoryItem;
  onRefreshed: (id: string, pdfUrl: string) => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const date = new Date(item.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleRefreshLink = async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const result = await invokeFunction<{ pdf_url: string }>("download", {
        generation_id: item.id,
      });
      onRefreshed(item.id, result.pdf_url);
    } catch (err) {
      setRefreshError(
        err instanceof Error ? err.message : "Failed to refresh link"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const renderActions = () => {
    if (!item.is_paid) {
      if (item.status !== "completed") {
        return (
          <p className="text-sm text-muted">
            Complete preview generation to unlock payment.
          </p>
        );
      }
      return (
        <Link
          href={`/generate/payment?generation_id=${item.id}`}
          className="w-full sm:w-auto"
        >
          <Button size="sm" className="w-full sm:w-auto">
            Complete payment — ₹50
          </Button>
        </Link>
      );
    }

    if (item.expired || !item.pdf_url) {
      return (
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <Button
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto"
            loading={refreshing}
            onClick={handleRefreshLink}
          >
            Refresh download link
          </Button>
          {refreshError && (
            <p className="text-xs text-error">{refreshError}</p>
          )}
        </div>
      );
    }

    return (
      <a
        href={item.pdf_url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto"
      >
        <Button size="sm" className="w-full sm:w-auto">
          Download PDF
        </Button>
      </a>
    );
  };

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink">{item.target_role}</p>
          <StatusBadge item={item} />
        </div>
        <p className="text-sm text-muted">{date}</p>
        {item.ats_score !== null && (
          <p className="text-sm text-muted">ATS score: {item.ats_score}/100</p>
        )}
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
        {renderActions()}
      </div>
    </Card>
  );
}

export function GenerationHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invokeFunction<{ generations: HistoryItem[] }>("history", undefined, {
      method: "GET",
    })
      .then((res) => setItems(res.generations))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load history")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleRefreshed = (id: string, pdfUrl: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, pdf_url: pdfUrl, expired: false }
          : item
      )
    );
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <LoadingSpinner className="py-12" label="Loading history..." />;
  }

  if (error) {
    return <p className="text-error">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-muted">No resumes yet.</p>
        <Link href="/generate">
          <Button>Create your first resume</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <GenerationCard
          key={item.id}
          item={item}
          onRefreshed={handleRefreshed}
        />
      ))}
    </div>
  );
}
