"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { isFieldMissing, MISSING_LABEL } from "@/lib/missingFields";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
}

export function CertificationsForm({ form, missingPaths = [] }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  const missing = (path: string) => isFieldMissing(path, missingPaths);

  return (
    <div className="space-y-6">
      {fields.length === 0 && (
        <p className="text-muted">
          Certifications are optional — add any you have or skip ahead.
        </p>
      )}
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-lg border border-hairline p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">
              Certification {index + 1}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>
          <TextInput
            label="Name"
            required
            {...register(`certifications.${index}.name`)}
            error={errors.certifications?.[index]?.name?.message}
            missing={missing(`certifications.${index}.name`)}
            missingMessage={MISSING_LABEL}
          />
          <TextInput
            label="Issuer"
            required
            {...register(`certifications.${index}.issuer`)}
            error={errors.certifications?.[index]?.issuer?.message}
            missing={missing(`certifications.${index}.issuer`)}
            missingMessage={MISSING_LABEL}
          />
          <TextInput
            label="Date"
            required
            placeholder="Mar 2024"
            {...register(`certifications.${index}.date`)}
            error={errors.certifications?.[index]?.date?.message}
            missing={missing(`certifications.${index}.date`)}
            missingMessage={MISSING_LABEL}
          />
          <TextInput
            label="Credential ID or URL"
            required
            placeholder="ABC123 or https://credly.com/badges/..."
            {...register(`certifications.${index}.credential`)}
            error={errors.certifications?.[index]?.credential?.message}
            missing={missing(`certifications.${index}.credential`)}
            missingMessage={MISSING_LABEL}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({ name: "", issuer: "", date: "", credential: "" })
        }
      >
        Add certification
      </Button>
    </div>
  );
}
