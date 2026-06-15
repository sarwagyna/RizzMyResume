import { LegalPage } from "@/components/shared/LegalPage";
import { COMPANY } from "@/lib/company";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund policy"
      description={`Effective date: ${COMPANY.effectiveDate} · ${COMPANY.product} by ${COMPANY.name}`}
    >
      <h2 className="text-base font-semibold text-ink">General policy</h2>
      <p>
        All payments made on {COMPANY.product} are for AI-powered resume generation
        services. Due to the instant digital nature of the service, all sales are
        final once the resume generation process has been initiated.
      </p>

      <h2 className="text-base font-semibold text-ink">No refund cases</h2>
      <p>Refunds will not be issued in the following cases:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Resume was successfully generated and PDF was made available for download</li>
        <li>User was dissatisfied with the quality of AI-generated content</li>
        <li>User provided incorrect or incomplete raw input</li>
        <li>User changed their mind after payment was processed</li>
        <li>LaTeX compilation completed successfully but user did not download</li>
      </ul>

      <h2 className="text-base font-semibold text-ink">Eligible refund cases</h2>
      <p>A full refund will be issued if:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Payment was deducted but resume generation failed to initiate</li>
        <li>Payment was charged twice for the same order due to a technical error</li>
        <li>
          LaTeX compilation failed and no PDF was delivered within 60 minutes of
          payment
        </li>
      </ul>

      <h2 className="text-base font-semibold text-ink">How to request a refund</h2>
      <p>
        Email us at{" "}
        <a href={`mailto:${COMPANY.email}`} className="text-ink underline">
          {COMPANY.email}
        </a>{" "}
        within 7 days of the transaction with your payment ID and a description of
        the issue. Approved refunds are processed within 5–7 business days to the
        original payment method via Razorpay.
      </p>

      <h2 className="text-base font-semibold text-ink">Contact</h2>
      <p>{COMPANY.name}</p>
      <p>
        <a href={`mailto:${COMPANY.email}`} className="text-ink underline">
          {COMPANY.email}
        </a>
      </p>
    </LegalPage>
  );
}
