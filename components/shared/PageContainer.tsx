import { cn } from "@/lib/utils";

type PageSize = "sm" | "md" | "lg";

const sizeClasses: Record<PageSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-6xl",
};

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: PageSize;
}

export function PageContainer({
  children,
  className,
  size = "md",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 sm:py-12",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
