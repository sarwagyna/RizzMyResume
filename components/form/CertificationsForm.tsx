"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { getFieldHighlight } from "@/lib/fieldHighlight";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
  atsHints?: Record<string, string>;
}

export function CertificationsForm({
  form,
  missingPaths = [],
  atsHints = {},
}: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  const highlight = (path: string) =>
    getFieldHighlight(path, missingPaths, atsHints);

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
            missing={highlight(`certifications.${index}.name`).highlight}
            missingMessage={highlight(`certifications.${index}.name`).message}
          />
          <TextInput
            label="Issuer"
            required
            {...register(`certifications.${index}.issuer`)}
            error={errors.certifications?.[index]?.issuer?.message}
            missing={highlight(`certifications.${index}.issuer`).highlight}
            missingMessage={highlight(`certifications.${index}.issuer`).message}
          />
          <TextInput
            label="Date (optional)"
            placeholder="Mar 2024"
            {...register(`certifications.${index}.date`)}
            error={errors.certifications?.[index]?.date?.message}
            missing={highlight(`certifications.${index}.date`).highlight}
            missingMessage={highlight(`certifications.${index}.date`).message}
          />
          <TextInput
            label="Credential ID or URL (optional)"
            placeholder="ABC123 or https://credly.com/badges/..."
            {...register(`certifications.${index}.credential`)}
            error={errors.certifications?.[index]?.credential?.message}
            missing={highlight(`certifications.${index}.credential`).highlight}
            missingMessage={highlight(`certifications.${index}.credential`).message}
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
