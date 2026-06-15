"use client";

import { UseFormReturn } from "react-hook-form";
import { TagListField } from "@/components/form/TagListField";
import { LanguageEntriesForm } from "@/components/form/LanguageEntriesForm";
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

export function SkillsForm({
  form,
  missingPaths = [],
  atsHints = {},
  atsStepHint,
  templateId = "template-001",
}: Props) {
  const skills = form.watch("skills");
  const softSkills = form.watch("softSkills");
  const interests = form.watch("interests");
  const { errors } = form.formState;
  const professional = isProfessionalTemplate(templateId);
  const highlight = (path: string) =>
    getFieldHighlight(path, missingPaths, atsHints);
  const skillsHighlight = highlight("skills");
  const softSkillsHighlight = highlight("softSkills");
  const interestsHighlight = highlight("interests");

  return (
    <div className="space-y-8">
      <AtsStepCallout hint={atsStepHint} />
      <TagListField
        label="Technical skills"
        placeholder="React, Python, SQL..."
        values={skills}
        onChange={(values) =>
          form.setValue("skills", values, { shouldValidate: true })
        }
        error={errors.skills?.message as string | undefined}
        missing={skillsHighlight.highlight}
        missingMessage={skillsHighlight.message}
      />
      {!professional && (
        <TagListField
          label="Soft skills (optional)"
          placeholder="Communication, teamwork, problem-solving..."
          values={softSkills}
          onChange={(values) =>
            form.setValue("softSkills", values, { shouldValidate: true })
          }
          error={errors.softSkills?.message as string | undefined}
          missing={softSkillsHighlight.highlight}
          missingMessage={softSkillsHighlight.message}
        />
      )}
      <LanguageEntriesForm form={form} required={professional} />
      {!professional && (
        <TagListField
          label="Interests (optional)"
          placeholder="Open source, hackathons, cricket..."
          values={interests}
          onChange={(values) =>
            form.setValue("interests", values, { shouldValidate: true })
          }
          error={errors.interests?.message as string | undefined}
          missing={interestsHighlight.highlight}
          missingMessage={interestsHighlight.message}
        />
      )}
    </div>
  );
}
