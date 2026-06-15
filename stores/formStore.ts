"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  defaultFormValues,
  type ResumeFormValues,
} from "@/lib/validators/resumeInput";
import type { FormStep } from "@/lib/types";
import { FORM_STEPS } from "@/lib/types";
import {
  DEFAULT_TEMPLATE_ID,
  type ResumeTemplateId,
} from "@/lib/templates";
import type { AtsFeedback } from "@/lib/atsFieldHints";

function getFormDraftStorage(): Storage {
  if (typeof window !== "undefined") {
    return sessionStorage;
  }

  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    length: 0,
    clear: () => {},
    key: () => null,
  };
}

interface FormState {
  currentStep: FormStep;
  formData: ResumeFormValues;
  templateId: ResumeTemplateId;
  inputId: string | null;
  paymentId: string | null;
  generationId: string | null;
  importedFromUpload: boolean;
  missingFieldPaths: string[];
  atsFeedback: AtsFeedback | null;
  improveFromAts: boolean;
  setStep: (step: FormStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<ResumeFormValues>) => void;
  setFormData: (data: ResumeFormValues) => void;
  setTemplateId: (id: ResumeTemplateId) => void;
  setInputId: (id: string | null) => void;
  setPaymentId: (id: string | null) => void;
  setGenerationId: (id: string | null) => void;
  setImportedFromUpload: (value: boolean) => void;
  setMissingFieldPaths: (paths: string[]) => void;
  setAtsFeedback: (feedback: AtsFeedback | null) => void;
  setImproveFromAts: (value: boolean) => void;
  reset: () => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      currentStep: "personal",
      formData: defaultFormValues,
      templateId: DEFAULT_TEMPLATE_ID,
      inputId: null,
      paymentId: null,
      generationId: null,
      importedFromUpload: false,
      missingFieldPaths: [],
      atsFeedback: null,
      improveFromAts: false,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => {
        const idx = FORM_STEPS.indexOf(get().currentStep);
        if (idx < FORM_STEPS.length - 1) {
          set({ currentStep: FORM_STEPS[idx + 1] });
        }
      },
      prevStep: () => {
        const idx = FORM_STEPS.indexOf(get().currentStep);
        if (idx > 0) {
          set({ currentStep: FORM_STEPS[idx - 1] });
        }
      },
      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setFormData: (data) => set({ formData: data }),
      setTemplateId: (id) => set({ templateId: id }),
      setInputId: (id) => set({ inputId: id }),
      setPaymentId: (id) => set({ paymentId: id }),
      setGenerationId: (id) => set({ generationId: id }),
      setImportedFromUpload: (value) => set({ importedFromUpload: value }),
      setMissingFieldPaths: (paths) => set({ missingFieldPaths: paths }),
      setAtsFeedback: (feedback) => set({ atsFeedback: feedback }),
      setImproveFromAts: (value) => set({ improveFromAts: value }),
      reset: () =>
        set({
          currentStep: "personal",
          formData: defaultFormValues,
          templateId: DEFAULT_TEMPLATE_ID,
          inputId: null,
          paymentId: null,
          generationId: null,
          importedFromUpload: false,
          missingFieldPaths: [],
          atsFeedback: null,
          improveFromAts: false,
        }),
    }),
    {
      name: "rizzme-form-draft",
      storage: createJSONStorage(() => getFormDraftStorage()),
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        templateId: state.templateId,
        inputId: state.inputId,
        paymentId: state.paymentId,
        generationId: state.generationId,
        importedFromUpload: state.importedFromUpload,
        missingFieldPaths: state.missingFieldPaths,
        atsFeedback: state.atsFeedback,
        improveFromAts: state.improveFromAts,
      }),
    }
  )
);
