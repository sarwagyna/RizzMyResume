"use client";

import { UseFormReturn } from "react-hook-form";
import { TextInput } from "@/components/shared/TextInput";
import { TextArea } from "@/components/shared/TextArea";
import { getFieldHighlight } from "@/lib/fieldHighlight";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
  atsHints?: Record<string, string>;
}

export function JDInput({
  form,
  missingPaths = [],
  atsHints = {},
}: Props) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const targetRoleHighlight = getFieldHighlight(
    "targetRole",
    missingPaths,
    atsHints
  );
  const jdTextHighlight = getFieldHighlight("jdText", missingPaths, atsHints);

  return (
    <div className="space-y-4">
      <TextInput
        label="Target role"
        required
        placeholder="Software Engineer Intern, Data Analyst, etc."
        {...register("targetRole")}
        error={errors.targetRole?.message}
        missing={targetRoleHighlight.highlight}
        missingMessage={targetRoleHighlight.message}
      />
      <TextArea
        label="Job description (optional)"
        hint="Paste the JD to tailor keywords for ATS screening"
        showCount
        maxLength={2000}
        value={watch("jdText")}
        {...register("jdText")}
        error={errors.jdText?.message}
        missing={jdTextHighlight.highlight}
        missingMessage={jdTextHighlight.message}
      />
    </div>
  );
}
