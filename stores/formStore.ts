"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  defaultFormValues,
  type ResumeFormValues,
} from "@/lib/validators/resumeInput";
import type { FormStep } from "@/lib/types";
import { FORM_STEPS } from "@/lib/types";

interface FormState {
  currentStep: FormStep;
  formData: ResumeFormValues;
  inputId: string | null;
  paymentId: string | null;
  generationId: string | null;
  importedFromUpload: boolean;
  missingFieldPaths: string[];
  setStep: (step: FormStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<ResumeFormValues>) => void;
  setFormData: (data: ResumeFormValues) => void;
  setInputId: (id: string | null) => void;
  setPaymentId: (id: string | null) => void;
  setGenerationId: (id: string | null) => void;
  setImportedFromUpload: (value: boolean) => void;
  setMissingFieldPaths: (paths: string[]) => void;
  reset: () => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      currentStep: "personal",
      formData: defaultFormValues,
      inputId: null,
      paymentId: null,
      generationId: null,
      importedFromUpload: false,
      missingFieldPaths: [],
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
      setInputId: (id) => set({ inputId: id }),
      setPaymentId: (id) => set({ paymentId: id }),
      setGenerationId: (id) => set({ generationId: id }),
      setImportedFromUpload: (value) => set({ importedFromUpload: value }),
      setMissingFieldPaths: (paths) => set({ missingFieldPaths: paths }),
      reset: () =>
        set({
          currentStep: "personal",
          formData: defaultFormValues,
          inputId: null,
          paymentId: null,
          generationId: null,
          importedFromUpload: false,
          missingFieldPaths: [],
        }),
    }),
    {
      name: "rizzme-form-draft",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        inputId: state.inputId,
        paymentId: state.paymentId,
        generationId: state.generationId,
        importedFromUpload: state.importedFromUpload,
        missingFieldPaths: state.missingFieldPaths,
      }),
    }
  )
);
