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

export function ProjectsForm({ form, missingPaths = [] }: Props) {
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

  const missing = (path: string) => isFieldMissing(path, missingPaths);

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
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
            missing={missing(`projects.${index}.name`)}
            missingMessage={MISSING_LABEL}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Start date"
              required
              placeholder="Jan 2024"
              {...register(`projects.${index}.startDate`)}
              error={errors.projects?.[index]?.startDate?.message}
              missing={missing(`projects.${index}.startDate`)}
              missingMessage={MISSING_LABEL}
            />
            <TextInput
              label="End date"
              required
              placeholder="Mar 2024 or Present"
              {...register(`projects.${index}.endDate`)}
              error={errors.projects?.[index]?.endDate?.message}
              missing={missing(`projects.${index}.endDate`)}
              missingMessage={MISSING_LABEL}
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
          />
          <TextInput
            label="Technologies"
            required
            placeholder="React, Node.js, MongoDB"
            {...register(`projects.${index}.technologies`)}
            error={errors.projects?.[index]?.technologies?.message}
            missing={missing(`projects.${index}.technologies`)}
            missingMessage={MISSING_LABEL}
          />
          <TextInput
            label="Project link"
            required
            placeholder="https://github.com/you/project"
            {...register(`projects.${index}.link`)}
            error={errors.projects?.[index]?.link?.message}
            missing={missing(`projects.${index}.link`)}
            missingMessage={MISSING_LABEL}
          />
        </div>
      ))}
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
