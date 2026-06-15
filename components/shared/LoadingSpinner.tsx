import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeStyles = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)} role="status">
      <div
        className={cn(
          "animate-spin rounded-full border-hairline border-t-primary",
          sizeStyles[size]
        )}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
      {label && size !== "sm" && (
        <p className="text-sm text-muted">{label}</p>
      )}
    </div>
  );
}
