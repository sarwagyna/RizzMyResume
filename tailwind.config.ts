import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#111111",
          active: "#242424",
          disabled: "#e5e7eb",
        },
        ink: "#111111",
        body: "#374151",
        muted: {
          DEFAULT: "#6b7280",
          soft: "#898989",
        },
        hairline: {
          DEFAULT: "#e5e7eb",
          soft: "#f3f4f6",
        },
        canvas: "#ffffff",
        surface: {
          soft: "#f8f9fa",
          card: "#f5f5f5",
          strong: "#e5e7eb",
          dark: "#101010",
          "dark-elevated": "#1a1a1a",
        },
        "on-primary": "#ffffff",
        "on-dark": "#ffffff",
        "on-dark-soft": "#a1a1aa",
        "brand-accent": "#3b82f6",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-inter)", "Inter", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1200px",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        section: "96px",
      },
      letterSpacing: {
        display: "-0.04em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
