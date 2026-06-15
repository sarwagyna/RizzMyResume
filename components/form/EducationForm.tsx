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

export function EducationForm({ form, missingPaths = [] }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const missing = (path: string) => isFieldMissing(path, missingPaths);

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-lg border border-hairline p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Education {index + 1}</h3>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Institution"
              required
              {...register(`education.${index}.institution`)}
              error={errors.education?.[index]?.institution?.message}
              missing={missing(`education.${index}.institution`)}
              missingMessage={MISSING_LABEL}
              className="md:col-span-2"
            />
            <TextInput
              label="Degree"
              required
              placeholder="B.Tech, BCA, etc."
              {...register(`education.${index}.degree`)}
              error={errors.education?.[index]?.degree?.message}
              missing={missing(`education.${index}.degree`)}
              missingMessage={MISSING_LABEL}
            />
            <TextInput
              label="Field of study"
              {...register(`education.${index}.field`)}
            />
            <TextInput
              label="Start year"
              required
              placeholder="2021"
              {...register(`education.${index}.startYear`)}
              error={errors.education?.[index]?.startYear?.message}
              missing={missing(`education.${index}.startYear`)}
              missingMessage={MISSING_LABEL}
            />
            <TextInput
              label="End year"
              required
              placeholder="2025"
              {...register(`education.${index}.endYear`)}
              error={errors.education?.[index]?.endYear?.message}
              missing={missing(`education.${index}.endYear`)}
              missingMessage={MISSING_LABEL}
            />
            <TextInput
              label="CGPA"
              required
              placeholder="8.5"
              {...register(`education.${index}.cgpa`)}
              error={errors.education?.[index]?.cgpa?.message}
              missing={missing(`education.${index}.cgpa`)}
              missingMessage={MISSING_LABEL}
            />
          </div>
        </div>
      ))}
      {errors.education?.message && (
        <p className="text-sm text-error">{errors.education.message as string}</p>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({
            institution: "",
            degree: "",
            field: "",
            startYear: "",
            endYear: "",
            cgpa: "",
          })
        }
      >
        Add education
      </Button>
    </div>
  );
}
