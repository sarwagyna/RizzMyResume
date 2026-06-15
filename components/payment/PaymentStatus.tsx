"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/shared/Card";
import { QualityWarnings } from "@/components/form/QualityWarnings";
import { RazorpayButton } from "@/components/payment/RazorpayButton";
import { CreditRedeemButton } from "@/components/payment/CreditRedeemButton";
import { ResumePreviewViewer } from "@/components/preview/ResumePreviewViewer";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useFormStore } from "@/stores/formStore";
import { invokeFunction, createClient } from "@/lib/supabase/client";
import { PageContainer } from "@/components/shared/PageContainer";
import { CREDITS_PER_FREE_RESUME } from "@/lib/referrals";
import { fetchReferralStats } from "@/lib/referralStats";

interface GenerationStatus {
  generation_id: string;
  input_id: string;
  status: string;
  is_paid: boolean;
}

interface PaymentContact {
  fullName: string;
  email: string;
  phone: string;
  targetRole: string;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const generationIdParam = searchParams.get("generation_id");

  const {
    formData,
    inputId,
    generationId,
    setInputId,
    setGenerationId,
    updateFormData,
  } = useFormStore();

  const [hydrating, setHydrating] = useState(Boolean(generationIdParam));
  const [hydrateError, setHydrateError] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [contact, setContact] = useState<PaymentContact>({
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    targetRole: formData.targetRole,
  });

  const resolvedGenerationId = generationIdParam ?? generationId;

  const loadInputDetails = useCallback(
    async (input_id: string) => {
      const supabase = createClient();
      const { data } = await supabase
        .from("resume_inputs")
        .select("full_name, email, phone, target_role")
        .eq("id", input_id)
        .single();

      if (data) {
        const details: PaymentContact = {
          fullName: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          targetRole: data.target_role || "",
        };
        setContact(details);
        updateFormData({
          fullName: details.fullName,
          email: details.email,
          phone: details.phone,
          targetRole: details.targetRole,
        });
      }
    },
    [updateFormData]
  );

  useEffect(() => {
    setContact({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      targetRole: formData.targetRole,
    });
  }, [formData.fullName, formData.email, formData.phone, formData.targetRole]);

  useEffect(() => {
    let active = true;

    fetchReferralStats()
      .then((stats) => {
        if (active) setCredits(stats.credits);
      })
      .catch(() => {
        // Credits are optional on the payment page.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!generationIdParam) {
      setHydrating(false);
      return;
    }

    if (generationId === generationIdParam && inputId) {
      void loadInputDetails(inputId);
      setHydrating(false);
      return;
    }

    let active = true;

    invokeFunction<GenerationStatus>(
      `generation-status?id=${generationIdParam}`,
      undefined,
      { method: "GET" }
    )
      .then(async (result) => {
        if (!active) return;
        if (result.is_paid) {
          setHydrateError("This resume is already paid. Open it from your dashboard.");
          return;
        }
        if (result.status !== "completed") {
          setHydrateError("This resume is not ready for payment yet.");
          return;
        }
        setGenerationId(result.generation_id);
        setInputId(result.input_id);
        await loadInputDetails(result.input_id);
      })
      .catch((err) => {
        if (!active) return;
        setHydrateError(
          err instanceof Error ? err.message : "Failed to load resume"
        );
      })
      .finally(() => {
        if (active) setHydrating(false);
      });

    return () => {
      active = false;
    };
  }, [
    generationIdParam,
    generationId,
    inputId,
    setGenerationId,
    setInputId,
    loadInputDetails,
  ]);

  if (hydrating) {
    return (
      <PageContainer size="sm">
        <LoadingSpinner className="py-12" label="Loading resume..." />
      </PageContainer>
    );
  }

  if (hydrateError) {
    return (
      <PageContainer size="sm">
        <Card className="space-y-4 text-center">
          <p className="text-error">{hydrateError}</p>
          <Link href="/dashboard" className="text-sm font-semibold text-ink underline">
            Back to dashboard
          </Link>
        </Card>
      </PageContainer>
    );
  }

  if (!inputId) {
    return (
      <PageContainer size="sm">
        <Card className="text-center">
          <p className="mb-4 text-muted">
            Complete the form first before proceeding to payment.
          </p>
          <Link href="/generate" className="text-sm font-semibold text-ink underline">
            Back to form
          </Link>
        </Card>
      </PageContainer>
    );
  }

  if (!generationId && !generationIdParam) {
    return (
      <PageContainer size="sm">
        <Card className="text-center">
          <p className="mb-4 text-muted">
            Generate a preview of your resume before payment.
          </p>
          <Link href="/generate/preview" className="text-sm font-semibold text-ink underline">
            Generate preview
          </Link>
        </Card>
      </PageContainer>
    );
  }

  if (!resolvedGenerationId) {
    return null;
  }

  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="display-md mb-2">Unlock your resume</h1>
        <p className="text-muted">
          {credits >= CREDITS_PER_FREE_RESUME
            ? `You have ${credits} credits — use 50 for a free download, or pay ₹50.`
            : "Pay ₹50 once to download your ATS-optimised PDF and receive it by email."}
        </p>
      </div>

      <ResumePreviewViewer generationId={resolvedGenerationId} />

      <Card className="space-y-6">
        <div className="space-y-2 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="text-muted">Name</span>
            <span className="font-medium text-ink sm:text-right">
              {contact.fullName || "—"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="text-muted">Target role</span>
            <span className="font-medium text-ink sm:text-right">
              {contact.targetRole || "—"}
            </span>
          </div>
          <div className="flex justify-between border-t border-hairline pt-2">
            <span className="font-semibold text-ink">Total</span>
            <span className="font-semibold text-ink">
              {credits >= CREDITS_PER_FREE_RESUME ? "₹0 with credits" : "₹50"}
            </span>
          </div>
        </div>

        <QualityWarnings data={formData} />

        <CreditRedeemButton
          inputId={inputId}
          generationId={resolvedGenerationId}
          credits={credits}
          onRedeemed={setCredits}
        />

        {credits >= CREDITS_PER_FREE_RESUME ? (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-canvas px-2 text-muted">or pay ₹50</span>
            </div>
          </div>
        ) : null}

        <RazorpayButton
          inputId={inputId}
          generationId={resolvedGenerationId}
          fullName={contact.fullName}
          email={contact.email}
          phone={contact.phone}
        />

        <p className="text-center text-xs text-muted-soft">
          UPI, cards, and net banking accepted via Razorpay.
          {credits > 0 && credits < CREDITS_PER_FREE_RESUME ? (
            <>
              {" "}
              You have {credits} credits —{" "}
              <Link href="/referrals" className="font-medium text-ink underline">
                invite friends
              </Link>{" "}
              to earn more.
            </>
          ) : null}
        </p>
      </Card>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted hover:text-ink"
        >
          Back to dashboard
        </Link>
      </div>
    </PageContainer>
  );
}

export function PaymentStatus() {
  return (
    <Suspense
      fallback={
        <PageContainer size="sm">
          <LoadingSpinner className="py-12" label="Loading..." />
        </PageContainer>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
