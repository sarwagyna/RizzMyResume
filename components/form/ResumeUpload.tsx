"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { invokeFunction } from "@/lib/supabase/client";
import {
  ACCEPTED_RESUME_TYPES,
  mergeParsedResume,
  readResumeFile,
} from "@/lib/resumeUpload";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface ResumeUploadProps {
  onParsed: (data: ResumeFormValues) => void;
  onManual: () => void;
}

interface ParseResponse {
  form: Partial<ResumeFormValues>;
  warnings?: string[];
}

export function ResumeUpload({ onParsed, onManual }: ResumeUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      setWarnings([]);

      try {
        const payload = await readResumeFile(file);
        const result = await invokeFunction<ParseResponse>("parse-resume", payload);
        const merged = mergeParsedResume(result.form);
        setWarnings(result.warnings ?? []);
        onParsed(merged);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse resume");
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const accept = Object.values(ACCEPTED_RESUME_TYPES).flat().join(",");

  return (
    <div className="space-y-6">
      <Card variant="soft">
        <h2 className="mb-2 text-lg font-semibold text-ink">
          Upload your existing resume
        </h2>
        <p className="mb-6 text-sm text-muted">
          We&apos;ll read your PDF or text resume and pre-fill the form. You can
          review and edit everything before paying.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-primary bg-surface-soft"
              : "border-hairline bg-canvas"
          }`}
        >
          {loading ? (
            <LoadingSpinner label="Reading your resume..." />
          ) : (
            <>
              <p className="mb-2 font-medium text-ink">
                Drag & drop your resume here
              </p>
              <p className="mb-4 text-sm text-muted">PDF or .txt — max 5MB</p>
              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                  }}
                />
                <span className="inline-flex h-10 items-center justify-center rounded-md border border-hairline bg-canvas px-5 text-sm font-semibold text-ink hover:bg-surface-soft">
                  Choose file
                </span>
              </label>
            </>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-error">{error}</p>}
        {warnings.length > 0 && (
          <ul className="mt-4 list-inside list-disc text-sm text-warning">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-hairline" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-canvas px-3 text-muted">or</span>
        </div>
      </div>

      <Button variant="secondary" className="w-full" onClick={onManual}>
        Fill in manually instead
      </Button>
    </div>
  );
}
