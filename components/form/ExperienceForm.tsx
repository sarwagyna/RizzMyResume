"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { TextArea } from "@/components/shared/TextArea";
import { isFieldMissing, MISSING_LABEL } from "@/lib/missingFields";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
}

export function ExperienceForm({ form, missingPaths = [] }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const missing = (path: string) => isFieldMissing(path, missingPaths);

  return (
    <div className="space-y-6">
      {fields.length === 0 && (
        <p className="text-muted">
          No experience yet? That&apos;s fine for freshers — skip to the next step.
        </p>
      )}
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-lg border border-hairline p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Experience {index + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Company"
              required
              {...register(`experience.${index}.company`)}
              error={errors.experience?.[index]?.company?.message}
              missing={missing(`experience.${index}.company`)}
              missingMessage={MISSING_LABEL}
            />
            <TextInput
              label="Role"
              required
              {...register(`experience.${index}.role`)}
              error={errors.experience?.[index]?.role?.message}
              missing={missing(`experience.${index}.role`)}
              missingMessage={MISSING_LABEL}
            />
            <TextInput
              label="Start date"
              required
              placeholder="Jan 2024"
              {...register(`experience.${index}.startDate`)}
              error={errors.experience?.[index]?.startDate?.message}
              missing={missing(`experience.${index}.startDate`)}
              missingMessage={MISSING_LABEL}
            />
            <TextInput
              label="End date"
              required
              placeholder="Present"
              {...register(`experience.${index}.endDate`)}
              error={errors.experience?.[index]?.endDate?.message}
              missing={missing(`experience.${index}.endDate`)}
              missingMessage={MISSING_LABEL}
            />
          </div>
          <TextArea
            label="Description"
            required
            {...register(`experience.${index}.description`)}
            error={errors.experience?.[index]?.description?.message}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            description: "",
          })
        }
      >
        Add experience
      </Button>
    </div>
  );
}
