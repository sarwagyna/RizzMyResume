"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/shared/Card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { fetchPreviewPdf } from "@/lib/previewPdf";
import { RESUME_RETENTION_HOURS } from "@/lib/resumeRetention";

interface ResumePreviewViewerProps {
  /** Unpaid preview — fetched via authenticated stream, rendered on canvas */
  generationId?: string | null;
  /** Paid download — direct PDF URL allowed */
  pdfUrl?: string | null;
  isPaid?: boolean;
}

function ProtectedPreviewCanvas({ generationId }: { generationId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blockInteraction = useCallback((event: { preventDefault: () => void; stopPropagation?: () => void }) => {
    event.preventDefault();
    event.stopPropagation?.();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blockKeys = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        (event.ctrlKey || event.metaKey) &&
        ["s", "p", "u", "c", "a"].includes(key)
      ) {
        event.preventDefault();
      }
    };

    container.addEventListener("contextmenu", blockInteraction);
    container.addEventListener("dragstart", blockInteraction);
    container.addEventListener("keydown", blockKeys);

    return () => {
      container.removeEventListener("contextmenu", blockInteraction);
      container.removeEventListener("dragstart", blockInteraction);
      container.removeEventListener("keydown", blockKeys);
    };
  }, [blockInteraction]);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setLoading(true);
      setError(null);

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const data = await fetchPreviewPdf(generationId);
        if (cancelled) return;

        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

        container.replaceChildren();

        const containerWidth = container.clientWidth || 720;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(1.75, containerWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });

          const pageWrap = document.createElement("div");
          pageWrap.className = "relative mx-auto w-full max-w-full";

          const canvas = document.createElement("canvas");
          canvas.className = "mx-auto block max-w-full select-none";
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.oncontextmenu = (event) => event.preventDefault();

          const context = canvas.getContext("2d");
          if (!context) continue;

          await page.render({ canvasContext: context, viewport }).promise;
          if (cancelled) return;

          pageWrap.appendChild(canvas);
          container.appendChild(pageWrap);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load preview"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [generationId]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-card/90">
          <LoadingSpinner label="Loading preview..." />
        </div>
      )}
      {error && !loading && (
        <div className="flex h-[min(70vh,720px)] items-center justify-center px-6 text-center">
          <p className="text-sm text-muted">{error}</p>
        </div>
      )}
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative max-h-[min(70vh,720px)] overflow-y-auto overscroll-contain bg-surface-card px-2 py-4 outline-none select-none"
        onContextMenu={blockInteraction}
        onDragStart={blockInteraction}
        aria-label="Resume preview (view only)"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="rotate-[-24deg] text-5xl font-bold tracking-widest text-ink/5 sm:text-6xl">
          PREVIEW
        </span>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas/95 to-transparent"
      />
    </div>
  );
}

export function ResumePreviewViewer({
  generationId,
  pdfUrl,
  isPaid = false,
}: ResumePreviewViewerProps) {
  if (isPaid && pdfUrl) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="border-b border-hairline bg-surface-soft px-4 py-3">
          <p className="text-sm font-medium text-ink">Resume preview</p>
        </div>
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0`}
          title="Resume preview"
          className="h-[min(70vh,720px)] w-full border-0"
        />
      </Card>
    );
  }

  if (!generationId) {
    return (
      <Card className="flex h-[min(70vh,720px)] items-center justify-center bg-surface-soft">
        <p className="text-muted">Preview unavailable. Try refreshing the page.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-hairline bg-surface-soft px-4 py-3">
        <p className="text-sm font-medium text-ink">Resume preview</p>
        <p className="text-xs text-muted">
          View only — pay ₹50 to download. Deleted automatically after{" "}
          {RESUME_RETENTION_HOURS} hours if unpaid.
        </p>
      </div>
      <ProtectedPreviewCanvas generationId={generationId} />
    </Card>
  );
}
