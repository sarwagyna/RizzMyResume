"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { LANGUAGE_LEVELS, languageLevelLabel } from "@/lib/languageLevels";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  required?: boolean;
}

export function LanguageEntriesForm({ form, required = false }: Props) {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languageEntries",
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-ink">
          Languages{required ? " *" : " (optional)"}
        </h3>
        <p className="mt-1 text-sm text-muted">
          Match the template format: English: C1 with Advanced (C1) below.
        </p>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted">No languages added yet.</p>
      )}

      {fields.map((field, index) => {
        const level = watch(`languageEntries.${index}.level`);

        return (
          <div
            key={field.id}
            className="rounded-lg border border-hairline p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-ink">Language {index + 1}</h4>
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
                label="Language"
                required
                placeholder="English"
                {...register(`languageEntries.${index}.language`)}
                error={errors.languageEntries?.[index]?.language?.message}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Level *
                </label>
                <select
                  className="w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink"
                  {...register(`languageEntries.${index}.level`, {
                    onChange: (event) => {
                      const nextLevel = event.target.value;
                      setValue(
                        `languageEntries.${index}.label`,
                        languageLevelLabel(nextLevel),
                        { shouldValidate: true }
                      );
                    },
                  })}
                >
                  <option value="">Select level</option>
                  {LANGUAGE_LEVELS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.languageEntries?.[index]?.level?.message && (
                  <p className="mt-1 text-sm text-error">
                    {errors.languageEntries[index]?.level?.message}
                  </p>
                )}
              </div>
              <TextInput
                label="Proficiency label"
                required
                placeholder="Advanced (C1)"
                {...register(`languageEntries.${index}.label`)}
                error={errors.languageEntries?.[index]?.label?.message}
                className="md:col-span-2"
              />
            </div>
            {level && (
              <p className="text-xs text-muted">
                Preview: {watch(`languageEntries.${index}.language`) || "Language"}:{" "}
                {level}
                {" · "}
                {watch(`languageEntries.${index}.label`) || languageLevelLabel(level)}
              </p>
            )}
          </div>
        );
      })}

      {errors.languageEntries?.message && (
        <p className="text-sm text-error">
          {errors.languageEntries.message as string}
        </p>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({ language: "", level: "", label: "" })
        }
      >
        Add language
      </Button>
    </div>
  );
}
