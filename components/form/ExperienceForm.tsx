"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { TagListField } from "@/components/form/TagListField";
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

export function ExperienceForm({
  form,
  missingPaths = [],
  atsHints = {},
  atsStepHint,
  templateId = "template-001",
}: Props) {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const highlight = (path: string) =>
    getFieldHighlight(path, missingPaths, atsHints);
  const professional = isProfessionalTemplate(templateId);

  return (
    <div className="space-y-6">
      <AtsStepCallout hint={atsStepHint} />
      {fields.length === 0 && (
        <p className="text-muted">
          No experience yet? That&apos;s fine for freshers — skip to the next step.
        </p>
      )}
      {fields.map((field, index) => {
        const bullets = watch(`experience.${index}.bullets`) ?? [];
        const bulletsPath = `experience.${index}.bullets`;
        const startDatePath = `experience.${index}.startDate`;
        const endDatePath = `experience.${index}.endDate`;
        const isFirst = index === 0;
        const fieldHints = isFirst ? atsHints : {};
        const bulletsHighlight = getFieldHighlight(
          bulletsPath,
          missingPaths,
          fieldHints
        );
        const startHighlight = getFieldHighlight(
          startDatePath,
          missingPaths,
          fieldHints
        );
        const endHighlight = getFieldHighlight(
          endDatePath,
          missingPaths,
          fieldHints
        );

        return (
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
                missing={highlight(`experience.${index}.company`).highlight}
                missingMessage={highlight(`experience.${index}.company`).message}
              />
              <TextInput
                label="Role"
                required
                {...register(`experience.${index}.role`)}
                error={errors.experience?.[index]?.role?.message}
                missing={highlight(`experience.${index}.role`).highlight}
                missingMessage={highlight(`experience.${index}.role`).message}
              />
              {professional && (
                <TextInput
                  label="City / location"
                  required
                  placeholder="Hyderabad"
                  {...register(`experience.${index}.location`)}
                  error={errors.experience?.[index]?.location?.message}
                  missing={highlight(`experience.${index}.location`).highlight}
                  missingMessage={highlight(`experience.${index}.location`).message}
                />
              )}
              <TextInput
                label="Start date"
                required
                placeholder="Sep 2025"
                {...register(`experience.${index}.startDate`)}
                error={errors.experience?.[index]?.startDate?.message}
                missing={startHighlight.highlight}
                missingMessage={startHighlight.message}
              />
              <TextInput
                label="End date"
                required
                placeholder="Current"
                {...register(`experience.${index}.endDate`)}
                error={errors.experience?.[index]?.endDate?.message}
                missing={endHighlight.highlight}
                missingMessage={endHighlight.message}
              />
            </div>
            {professional ? (
              <TagListField
                label="Achievement bullets"
                placeholder="Worked on data analysis projects involving structured datasets..."
                values={bullets}
                onChange={(values) =>
                  setValue(`experience.${index}.bullets`, values, {
                    shouldValidate: true,
                  })
                }
                error={
                  errors.experience?.[index]?.bullets?.message as
                    | string
                    | undefined
                }
                missing={bulletsHighlight.highlight}
                missingMessage={bulletsHighlight.message}
              />
            ) : (
              <TagListField
                label="Description bullets (optional)"
                placeholder="One achievement per line..."
                values={bullets}
                onChange={(values) =>
                  setValue(`experience.${index}.bullets`, values, {
                    shouldValidate: true,
                  })
                }
                missing={bulletsHighlight.highlight}
                missingMessage={bulletsHighlight.message}
              />
            )}
          </div>
        );
      })}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({
            company: "",
            role: "",
            location: "",
            startDate: "",
            endDate: "",
            bullets: [],
            description: "",
          })
        }
      >
        Add experience
      </Button>
    </div>
  );
}
