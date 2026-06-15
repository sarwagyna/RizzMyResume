"use client";

import { UseFormReturn } from "react-hook-form";
import { TagListField } from "@/components/form/TagListField";
import { isFieldMissing, MISSING_LABEL } from "@/lib/missingFields";
import type { ResumeFormValues } from "@/lib/validators/resumeInput";

interface Props {
  form: UseFormReturn<ResumeFormValues>;
  missingPaths?: string[];
}

export function SkillsForm({ form, missingPaths = [] }: Props) {
  const skills = form.watch("skills");
  const softSkills = form.watch("softSkills");
  const languages = form.watch("languages");
  const interests = form.watch("interests");
  const { errors } = form.formState;

  return (
    <div className="space-y-8">
      <TagListField
        label="Technical skills"
        placeholder="React, Python, SQL..."
        values={skills}
        onChange={(values) =>
          form.setValue("skills", values, { shouldValidate: true })
        }
        error={errors.skills?.message as string | undefined}
        missing={isFieldMissing("skills", missingPaths)}
        missingMessage={MISSING_LABEL}
      />
      <TagListField
        label="Soft skills (optional)"
        placeholder="Communication, teamwork, problem-solving..."
        values={softSkills}
        onChange={(values) =>
          form.setValue("softSkills", values, { shouldValidate: true })
        }
        error={errors.softSkills?.message as string | undefined}
        missing={isFieldMissing("softSkills", missingPaths)}
        missingMessage={MISSING_LABEL}
      />
      <TagListField
        label="Languages (optional)"
        placeholder="English (Fluent), Hindi (Native)..."
        values={languages}
        onChange={(values) =>
          form.setValue("languages", values, { shouldValidate: true })
        }
        error={errors.languages?.message as string | undefined}
        missing={isFieldMissing("languages", missingPaths)}
        missingMessage={MISSING_LABEL}
      />
      <TagListField
        label="Interests (optional)"
        placeholder="Open source, hackathons, cricket..."
        values={interests}
        onChange={(values) =>
          form.setValue("interests", values, { shouldValidate: true })
        }
        error={errors.interests?.message as string | undefined}
        missing={isFieldMissing("interests", missingPaths)}
        missingMessage={MISSING_LABEL}
      />
    </div>
  );
}
