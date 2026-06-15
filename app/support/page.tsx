import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { PageContainer } from "@/components/shared/PageContainer";
import { SUPPORT_EMAIL } from "@/components/shared/Footer";

const ISSUES = [
  {
    title: "Preview won't load",
    steps: [
      "Refresh the page and ensure you're signed in.",
      "If you edited the form, regenerate the preview from the last step.",
      "Check your internet connection — PDF preview loads via a secure stream.",
    ],
  },
  {
    title: "Payment failed or stuck",
    steps: [
      "Confirm Razorpay test/live keys are configured for your environment.",
      "Try UPI or a different card. Failed payments are not charged.",
      "Return to the dashboard — your unpaid preview is saved for 24 hours.",
    ],
  },
  {
    title: "Download link expired",
    steps: [
      "Paid download links last 24 hours. Use Refresh download link on the dashboard.",
      "Check your email for the backup PDF we sent after payment.",
    ],
  },
];

export default function SupportPage() {
  return (
    <PageContainer size="sm" className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          Support
        </p>
        <h1 className="display-md mb-2">Get support</h1>
        <p className="text-sm text-muted">
          Troubleshooting steps and ways to reach us.
        </p>
      </div>

      <div className="space-y-4">
        {ISSUES.map((issue) => (
          <Card key={issue.title} className="!p-4 sm:!p-5">
            <h2 className="mb-3 font-semibold text-ink">{issue.title}</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
              {issue.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>
        ))}
      </div>

      <Card variant="soft" className="space-y-4">
        <div>
          <h2 className="font-semibold text-ink">Contact support</h2>
          <p className="mt-1 text-sm text-muted">
            Email us with your account email, generation ID (from dashboard), and
            a short description of the issue.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">{SUPPORT_EMAIL}</Button>
          </a>
          <Link href="/feedback" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Send feedback
            </Button>
          </Link>
        </div>
      </Card>

      <p className="text-sm text-muted">
        See also{" "}
        <Link href="/help" className="font-medium text-ink underline">
          Help FAQ
        </Link>
        .
      </p>
    </PageContainer>
  );
}
