import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "dark";
}

const variantStyles = {
  default: "bg-canvas border border-hairline shadow-card",
  soft: "bg-surface-card",
  dark: "bg-surface-dark text-on-dark",
};

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn("rounded-lg p-4 sm:p-6 md:p-8", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
