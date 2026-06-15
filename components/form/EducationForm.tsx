"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { AtsStepCallout } from "@/components/form/AtsStepCallout";
import { getFieldHighlight } from "@/lib/fieldHighlight";
import type { AtsStepHint } from "@/lib/atsFieldHints";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
  atsHints?: Record<string, string>;
  atsStepHint?: AtsStepHint;
}

export function EducationForm({
  form,
  missingPaths = [],
  atsHints = {},
  atsStepHint,
}: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const highlight = (path: string) =>
    getFieldHighlight(path, missingPaths, atsHints);

  return (
    <div className="space-y-6">
      <AtsStepCallout hint={atsStepHint} />
      {fields.map((field, index) => {
        const isFirst = index === 0;
        const fieldHints = isFirst ? atsHints : {};
        const dateHighlight = (path: string) =>
          getFieldHighlight(path, missingPaths, fieldHints);

        return (
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
              missing={highlight(`education.${index}.institution`).highlight}
              missingMessage={highlight(`education.${index}.institution`).message}
              className="md:col-span-2"
            />
            <TextInput
              label="Degree"
              required
              placeholder="B.Tech, BCA, etc."
              {...register(`education.${index}.degree`)}
              error={errors.education?.[index]?.degree?.message}
              missing={highlight(`education.${index}.degree`).highlight}
              missingMessage={highlight(`education.${index}.degree`).message}
            />
            <TextInput
              label="Field of study"
              {...register(`education.${index}.field`)}
            />
            <TextInput
              label="City"
              required
              placeholder="Madurai"
              {...register(`education.${index}.city`)}
              error={errors.education?.[index]?.city?.message}
              missing={highlight(`education.${index}.city`).highlight}
              missingMessage={highlight(`education.${index}.city`).message}
            />
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm font-medium text-ink">
                Graduation date <span className="text-error">*</span>
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Month"
                  required
                  placeholder="May"
                  {...register(`education.${index}.endMonth`)}
                  error={errors.education?.[index]?.endMonth?.message}
                  missing={dateHighlight(`education.${index}.endMonth`).highlight}
                  missingMessage={dateHighlight(`education.${index}.endMonth`).message}
                />
                <TextInput
                  label="Year"
                  required
                  placeholder="2027"
                  {...register(`education.${index}.endYear`)}
                  error={errors.education?.[index]?.endYear?.message}
                  missing={dateHighlight(`education.${index}.endYear`).highlight}
                  missingMessage={dateHighlight(`education.${index}.endYear`).message}
                />
              </div>
            </div>
            <TextInput
              label="CGPA (optional)"
              placeholder="8.84"
              {...register(`education.${index}.cgpa`)}
              error={errors.education?.[index]?.cgpa?.message}
              missing={highlight(`education.${index}.cgpa`).highlight}
              missingMessage={highlight(`education.${index}.cgpa`).message}
            />
          </div>
        </div>
        );
      })}
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
            city: "",
            startYear: "",
            endYear: "",
            endMonth: "",
            cgpa: "",
          })
        }
      >
        Add education
      </Button>
    </div>
  );
}
