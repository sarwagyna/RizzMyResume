import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, max = 100, className, label }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">{label}</span>
          <span className="text-muted">{Math.round(percent)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
