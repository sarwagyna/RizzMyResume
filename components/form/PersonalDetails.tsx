"use client";

import { UseFormReturn } from "react-hook-form";
import { TextInput } from "@/components/shared/TextInput";
import { isFieldMissing, MISSING_LABEL } from "@/lib/missingFields";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
}

export function PersonalDetails({ form, missingPaths = [] }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  const missing = (path: string) => isFieldMissing(path, missingPaths);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput
        label="Full name"
        required
        {...register("fullName")}
        error={errors.fullName?.message}
        missing={missing("fullName")}
        missingMessage={MISSING_LABEL}
        className="md:col-span-2"
      />
      <TextInput
        label="Email"
        type="email"
        required
        {...register("email")}
        error={errors.email?.message}
        missing={missing("email")}
        missingMessage={MISSING_LABEL}
      />
      <TextInput
        label="Phone"
        required
        placeholder="+91 9876543210"
        {...register("phone")}
        error={errors.phone?.message}
        missing={missing("phone")}
        missingMessage={MISSING_LABEL}
      />
      <TextInput
        label="LinkedIn URL"
        required
        placeholder="https://linkedin.com/in/you"
        {...register("linkedinUrl")}
        error={errors.linkedinUrl?.message}
        missing={missing("linkedinUrl")}
        missingMessage={MISSING_LABEL}
      />
      <TextInput
        label="GitHub URL"
        required
        placeholder="https://github.com/you"
        {...register("githubUrl")}
        error={errors.githubUrl?.message}
        missing={missing("githubUrl")}
        missingMessage={MISSING_LABEL}
      />
      <TextInput
        label="City"
        required
        {...register("city")}
        error={errors.city?.message}
        missing={missing("city")}
        missingMessage={MISSING_LABEL}
      />
      <TextInput
        label="State"
        required
        {...register("state")}
        error={errors.state?.message}
        missing={missing("state")}
        missingMessage={MISSING_LABEL}
      />
    </div>
  );
}
