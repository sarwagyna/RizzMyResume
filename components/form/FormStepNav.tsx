"use client";

import { FORM_STEPS, FORM_STEP_LABELS, type FormStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const SHORT_STEP_LABELS: Record<FormStep, string> = {
  personal: "Personal",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  certifications: "Certs",
  target: "Target",
};

interface FormStepNavProps {
  currentStep: FormStep;
  missingByStep: Partial<Record<FormStep, number>>;
  importedFromUpload: boolean;
  onStepChange: (step: FormStep) => void;
  sticky?: boolean;
}

export function FormStepNav({
  currentStep,
  missingByStep,
  importedFromUpload,
  onStepChange,
  sticky = true,
}: FormStepNavProps) {
  return (
    <div
      className={cn(
        sticky &&
          "sticky top-14 z-40 -mx-4 border-b border-hairline bg-canvas/95 px-4 py-3 backdrop-blur-sm sm:top-16 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none"
      )}
    >
      <div className="-mx-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full gap-2 sm:w-auto sm:flex-wrap">
          {FORM_STEPS.map((step) => {
            const missingCount = missingByStep[step] ?? 0;
            const isActive = step === currentStep;

            return (
              <button
                key={step}
                type="button"
                onClick={() => onStepChange(step)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:rounded-md",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-soft text-muted hover:text-ink"
                )}
              >
                <span className="sm:hidden">{SHORT_STEP_LABELS[step]}</span>
                <span className="hidden sm:inline">
                  {FORM_STEP_LABELS[step]}
                </span>
                {importedFromUpload && missingCount > 0 && (
                  <span className="rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                    {missingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
