import { RESUME_RETENTION_NOTICE } from "@/lib/resumeRetention";
import { cn } from "@/lib/utils";

interface RetentionNoticeProps {
  className?: string;
  compact?: boolean;
}

export function RetentionNotice({ className, compact }: RetentionNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-hairline bg-surface-soft",
        compact ? "px-3 py-2" : "px-4 py-3",
        className
      )}
      role="note"
    >
      <p
        className={cn(
          "text-ink",
          compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"
        )}
      >
        <span className="font-semibold">24-hour storage limit.</span>{" "}
        {RESUME_RETENTION_NOTICE}
      </p>
    </div>
  );
}
