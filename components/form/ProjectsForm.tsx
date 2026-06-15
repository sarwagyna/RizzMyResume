"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { TextArea } from "@/components/shared/TextArea";
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

export function ProjectsForm({
  form,
  missingPaths = [],
  atsHints = {},
  atsStepHint,
}: Props) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  const highlight = (path: string) =>
    getFieldHighlight(path, missingPaths, atsHints);

  return (
    <div className="space-y-6">
      <AtsStepCallout hint={atsStepHint} />
      {fields.map((field, index) => {
        const isFirst = index === 0;
        const fieldHints = isFirst ? atsHints : {};
        const linkHighlight = getFieldHighlight(
          `projects.${index}.link`,
          missingPaths,
          fieldHints
        );

        return (
        <div
          key={field.id}
          className="rounded-lg border border-hairline p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Project {index + 1}</h3>
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
          <TextInput
            label="Project name"
            required
            {...register(`projects.${index}.name`)}
            error={errors.projects?.[index]?.name?.message}
            missing={highlight(`projects.${index}.name`).highlight}
            missingMessage={highlight(`projects.${index}.name`).message}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Start date"
              required
              placeholder="Jan 2024"
              {...register(`projects.${index}.startDate`)}
              error={errors.projects?.[index]?.startDate?.message}
              missing={highlight(`projects.${index}.startDate`).highlight}
              missingMessage={highlight(`projects.${index}.startDate`).message}
            />
            <TextInput
              label="End date"
              required
              placeholder="Mar 2024 or Present"
              {...register(`projects.${index}.endDate`)}
              error={errors.projects?.[index]?.endDate?.message}
              missing={highlight(`projects.${index}.endDate`).highlight}
              missingMessage={highlight(`projects.${index}.endDate`).message}
            />
          </div>
          <TextArea
            label="Description"
            required
            hint="Minimum 50 characters — describe what you built and the impact"
            showCount
            maxLength={500}
            value={watch(`projects.${index}.description`)}
            {...register(`projects.${index}.description`)}
            error={errors.projects?.[index]?.description?.message}
            missing={highlight(`projects.${index}.description`).highlight}
            missingMessage={highlight(`projects.${index}.description`).message}
          />
          <TextInput
            label="Technologies"
            required
            placeholder="React, Node.js, MongoDB"
            {...register(`projects.${index}.technologies`)}
            error={errors.projects?.[index]?.technologies?.message}
            missing={highlight(`projects.${index}.technologies`).highlight}
            missingMessage={highlight(`projects.${index}.technologies`).message}
          />
          <TextInput
            label="Project link"
            required
            placeholder="https://github.com/you/project"
            {...register(`projects.${index}.link`)}
            error={errors.projects?.[index]?.link?.message}
            missing={linkHighlight.highlight}
            missingMessage={linkHighlight.message}
          />
        </div>
        );
      })}
      {errors.projects?.message && (
        <p className="text-sm text-error">{errors.projects.message as string}</p>
      )}
      {fields.length < 4 && (
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            append({
              name: "",
              description: "",
              technologies: "",
              link: "",
              startDate: "",
              endDate: "",
            })
          }
        >
          Add project
        </Button>
      )}
    </div>
  );
}
