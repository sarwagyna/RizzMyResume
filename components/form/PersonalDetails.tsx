"use client";

import { UseFormReturn } from "react-hook-form";
import { TextInput } from "@/components/shared/TextInput";
import { TextArea } from "@/components/shared/TextArea";
import { AtsStepCallout } from "@/components/form/AtsStepCallout";
import { getFieldHighlight } from "@/lib/fieldHighlight";
import { isProfessionalTemplate } from "@/lib/templateFormRules";
import type { ResumeTemplateId } from "@/lib/templates";
import type { AtsStepHint } from "@/lib/atsFieldHints";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
  atsHints?: Record<string, string>;
  atsStepHint?: AtsStepHint;
  templateId?: ResumeTemplateId;
}

export function PersonalDetails({
  form,
  missingPaths = [],
  atsHints = {},
  atsStepHint,
  templateId = "template-001",
}: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  const highlight = (path: string) =>
    getFieldHighlight(path, missingPaths, atsHints);

  return (
    <div className="space-y-4">
      <AtsStepCallout hint={atsStepHint} />
      <div className="grid gap-4 md:grid-cols-2">
      <TextInput
        label="Full name"
        required
        {...register("fullName")}
        error={errors.fullName?.message}
        missing={highlight("fullName").highlight}
        missingMessage={highlight("fullName").message}
        className="md:col-span-2"
      />
      <TextInput
        label="Email"
        type="email"
        required
        {...register("email")}
        error={errors.email?.message}
        missing={highlight("email").highlight}
        missingMessage={highlight("email").message}
      />
      <TextInput
        label="Phone"
        required
        placeholder="+91 9876543210"
        {...register("phone")}
        error={errors.phone?.message}
        missing={highlight("phone").highlight}
        missingMessage={highlight("phone").message}
      />
      <TextInput
        label="LinkedIn URL"
        required
        placeholder="https://linkedin.com/in/you"
        {...register("linkedinUrl")}
        error={errors.linkedinUrl?.message}
        missing={highlight("linkedinUrl").highlight}
        missingMessage={highlight("linkedinUrl").message}
      />
      <TextInput
        label="GitHub URL"
        required
        placeholder="https://github.com/you"
        {...register("githubUrl")}
        error={errors.githubUrl?.message}
        missing={highlight("githubUrl").highlight}
        missingMessage={highlight("githubUrl").message}
      />
      <TextInput
        label="City"
        required
        {...register("city")}
        error={errors.city?.message}
        missing={highlight("city").highlight}
        missingMessage={highlight("city").message}
      />
      <TextInput
        label="State"
        required
        {...register("state")}
        error={errors.state?.message}
        missing={highlight("state").highlight}
        missingMessage={highlight("state").message}
      />
      {isProfessionalTemplate(templateId) && (
        <TextArea
          label="Professional summary"
          required
          placeholder="2–3 sentences about your experience, strengths, and target role."
          {...register("summary")}
          error={errors.summary?.message}
          missing={highlight("summary").highlight}
          missingMessage={highlight("summary").message}
          className="md:col-span-2"
        />
      )}
      </div>
    </div>
  );
}
