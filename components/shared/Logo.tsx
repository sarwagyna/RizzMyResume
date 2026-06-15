"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const uid = useId().replace(/:/g, "");
  const fillId = `logo-fill-${uid}`;
  const shineId = `logo-shine-${uid}`;
  const shadowId = `logo-shadow-${uid}`;

  return (
    <svg
      viewBox="0 0 248 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Rizz My Resume"
      className={cn("h-8 w-auto sm:h-9", className)}
    >
      <defs>
        <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="45%" stopColor="#333333" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={shadowId} x="-8%" y="-20%" width="116%" height="150%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="0.8" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      <path
        d="M6 36 C 70 28, 120 34, 242 30"
        fill="none"
        stroke="#111111"
        strokeWidth="2.25"
        strokeLinecap="round"
        opacity="0.12"
      />

      <text
        x="4"
        y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="27"
        fontWeight="700"
        fontStyle="italic"
        fill={`url(#${fillId})`}
        filter={`url(#${shadowId})`}
      >
        Rizz
      </text>

      <text
        x="72"
        y="30"
        fontFamily="var(--font-inter), Inter, system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.04em"
        fill={`url(#${fillId})`}
        filter={`url(#${shadowId})`}
      >
        My Resume
      </text>

      <text
        x="4"
        y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="27"
        fontWeight="700"
        fontStyle="italic"
        fill={`url(#${shineId})`}
        opacity="0.35"
      >
        Rizz
      </text>
    </svg>
  );
}
