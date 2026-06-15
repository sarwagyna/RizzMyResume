"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldPath } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PersonalDetails } from "@/components/form/PersonalDetails";
import { EducationForm } from "@/components/form/EducationForm";
import { SkillsForm } from "@/components/form/SkillsForm";
import { ProjectsForm } from "@/components/form/ProjectsForm";
import { ExperienceForm } from "@/components/form/ExperienceForm";
import { CertificationsForm } from "@/components/form/CertificationsForm";
import { JDInput } from "@/components/form/JDInput";
import { QualityWarnings } from "@/components/form/QualityWarnings";
import { ResumeUpload } from "@/components/form/ResumeUpload";
import { FormStepNav } from "@/components/form/FormStepNav";
import { PageContainer } from "@/components/shared/PageContainer";
import { useFormStore } from "@/stores/formStore";
import { saveDraft } from "@/lib/formPersistence";
import { hydrateFormValues } from "@/lib/hydrateFormValues";
import {
  getMissingCountByStep,
  getMissingFieldPaths,
  pruneMissingPaths,
} from "@/lib/missingFields";
import type { z } from "zod";
import {
  defaultFormValues,
  personalStepSchema,
  educationStepSchema,
  skillsStepSchema,
  projectsStepSchema,
  experienceStepSchema,
  certificationsStepSchema,
  targetStepSchema,
  type ResumeFormValues,
} from "@/lib/validators/resumeInput";
import { FORM_STEPS, FORM_STEP_LABELS, type FormStep } from "@/lib/types";

const stepSchemas: Record<FormStep, z.ZodTypeAny> = {
  personal: personalStepSchema,
  education: educationStepSchema,
  skills: skillsStepSchema,
  projects: projectsStepSchema,
  experience: experienceStepSchema,
  certifications: certificationsStepSchema,
  target: targetStepSchema,
};

type WizardMode = "choose" | "form";

function GenerateWizard() {
  const router = useRouter();
  const {
    currentStep,
    formData,
    inputId,
    missingFieldPaths,
    importedFromUpload,
    setStep,
    nextStep,
    prevStep,
    setFormData,
    setInputId,
    setGenerationId,
    setImportedFromUpload,
    setMissingFieldPaths,
    reset: resetStore,
  } = useFormStore();

  const [mode, setMode] = useState<WizardMode>("choose");
  const [importNote, setImportNote] = useState<string | null>(null);

  const form = useForm<ResumeFormValues>({
    defaultValues: hydrateFormValues(formData),
    mode: "onBlur",
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current || mode !== "form") return;
    form.reset(hydrateFormValues(formData));
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const debouncedSave = useCallback(
    (data: ResumeFormValues) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const id = await saveDraft(data, inputId);
          setInputId(id);
        } catch {
          // Draft save requires auth — sessionStorage backup handles offline
        }
      }, 2000);
    },
    [inputId, setInputId]
  );

  useEffect(() => {
    if (mode !== "form") return;

    const subscription = form.watch(() => {
      const values = form.getValues();
      setFormData(values);
      debouncedSave(values);

      const state = useFormStore.getState();
      if (state.importedFromUpload) {
        state.setMissingFieldPaths(
          pruneMissingPaths(values, state.missingFieldPaths)
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setFormData, debouncedSave, mode]);

  const handleParsed = (data: ResumeFormValues) => {
    const hydratedData = hydrateFormValues(data);
    const missing = getMissingFieldPaths(hydratedData);

    setFormData(hydratedData);
    form.reset(hydratedData);
    hydrated.current = true;
    setImportedFromUpload(true);
    setMissingFieldPaths(missing);
    setImportNote(
      missing.length > 0
        ? `Resume imported — ${missing.length} field${missing.length === 1 ? "" : "s"} missing. Review each step and fill highlighted fields.`
        : "Resume imported — review each step before generating."
    );
    setMode("form");
    setStep("personal");
  };

  const handleManualStart = () => {
    setImportNote(null);
    setImportedFromUpload(false);
    setMissingFieldPaths([]);
    setMode("form");
    setStep("personal");
  };

  const stepIndex = FORM_STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / FORM_STEPS.length) * 100;
  const missingByStep = getMissingCountByStep(form.getValues(), missingFieldPaths);

  const validateCurrentStep = async () => {
    const schema = stepSchemas[currentStep];
    const values = form.getValues();
    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".") as FieldPath<ResumeFormValues>;
        form.setError(path, { message: issue.message });
      });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    if (currentStep === "target") {
      const data = form.getValues();
      try {
        const id = await saveDraft(data, inputId);
        setInputId(id);
        setGenerationId(null);
        router.push("/generate/preview");
      } catch {
        router.push("/login?redirect=/generate");
      }
      return;
    }

    nextStep();
  };

  const formStepProps = { form, missingPaths: missingFieldPaths };

  const renderStep = () => {
    switch (currentStep) {
      case "personal":
        return <PersonalDetails {...formStepProps} />;
      case "education":
        return <EducationForm {...formStepProps} />;
      case "skills":
        return <SkillsForm {...formStepProps} />;
      case "projects":
        return <ProjectsForm {...formStepProps} />;
      case "experience":
        return <ExperienceForm {...formStepProps} />;
      case "certifications":
        return <CertificationsForm {...formStepProps} />;
      case "target":
        return (
          <div className="space-y-6">
            <JDInput {...formStepProps} />
            <QualityWarnings data={form.getValues()} />
          </div>
        );
      default:
        return null;
    }
  };

  if (mode === "choose") {
    return (
      <PageContainer>
        <div className="mb-6 sm:mb-8">
          <h1 className="display-md mb-2">Create your resume</h1>
          <p className="text-sm text-muted sm:text-base">
            Upload an existing resume or fill in your details step by step.
          </p>
        </div>
        <ResumeUpload onParsed={handleParsed} onManual={handleManualStart} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4 sm:mb-6">
        <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="display-md text-ink">Create your resume</h1>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start sm:self-auto"
            onClick={() => {
              setMode("choose");
              setImportNote(null);
              setImportedFromUpload(false);
              setMissingFieldPaths([]);
            }}
          >
            Upload different resume
          </Button>
        </div>
        {importNote && (
          <p className="mb-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-body">
            {importNote}
          </p>
        )}
        <p className="text-sm text-muted">
          Step {stepIndex + 1} of {FORM_STEPS.length}:{" "}
          {FORM_STEP_LABELS[currentStep]}
        </p>
        <ProgressBar value={progress} className="mt-3" />
      </div>

      <FormStepNav
        currentStep={currentStep}
        missingByStep={missingByStep}
        importedFromUpload={importedFromUpload}
        onStepChange={setStep}
      />

      <Card className="mt-4 sm:mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          {renderStep()}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                if (stepIndex === 0) {
                  resetStore();
                  form.reset(defaultFormValues);
                  setMode("choose");
                  setImportNote(null);
                } else {
                  prevStep();
                }
              }}
            >
              {stepIndex === 0 ? "Start over" : "Back"}
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {currentStep === "target" ? "Generate preview" : "Next"}
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}

export default function GeneratePage() {
  return (
    <ErrorBoundary>
      <GenerateWizard />
    </ErrorBoundary>
  );
}
