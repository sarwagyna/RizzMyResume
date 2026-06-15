"use client";

import { UseFormReturn } from "react-hook-form";
import { TextInput } from "@/components/shared/TextInput";
import { TextArea } from "@/components/shared/TextArea";
import { isFieldMissing, MISSING_LABEL } from "@/lib/missingFields";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
}

export function JDInput({ form, missingPaths = [] }: Props) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <TextInput
        label="Target role"
        required
        placeholder="Software Engineer Intern, Data Analyst, etc."
        {...register("targetRole")}
        error={errors.targetRole?.message}
        missing={isFieldMissing("targetRole", missingPaths)}
        missingMessage={MISSING_LABEL}
      />
      <TextArea
        label="Job description (optional)"
        hint="Paste the JD to tailor keywords for ATS screening"
        showCount
        maxLength={2000}
        value={watch("jdText")}
        {...register("jdText")}
        error={errors.jdText?.message}
      />
    </div>
  );
}
