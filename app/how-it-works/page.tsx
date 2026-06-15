import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { PageContainer } from "@/components/shared/PageContainer";

const PIPELINE_STEPS = [
  {
    title: "Sign in with email",
    description:
      "Use a magic link — no password. Your session keeps drafts and resume history synced.",
  },
  {
    title: "Add your details",
    description:
      "Upload an existing PDF resume for auto-fill, or complete the 7-step form: personal info, education, skills, projects, experience, certifications, and target role with job description.",
  },
  {
    title: "AI writes your resume",
    description:
      "Claude Haiku tailors bullets to your JD, picks the strongest projects, and outputs a one-page Harshibar-style LaTeX resume in Times New Roman — optimised for ATS parsers.",
  },
  {
    title: "LaTeX compiles to PDF",
    description:
      "LaTeXLite turns the document into a print-ready PDF with consistent spacing, professional typography, and zero template drift.",
  },
  {
    title: "Preview & ATS score",
    description:
      "Review a protected canvas preview, see your ATS score, matched and missed JD keywords, and a numbered list of what changed and why.",
  },
  {
    title: "Pay ₹50 to unlock",
    description:
      "One-time Razorpay checkout — UPI, cards, and net banking. Preview stays view-only until payment.",
  },
  {
    title: "Download & email delivery",
    description:
      "Get a download link plus a backup copy sent to your email via Resend. Files are kept on our servers for 24 hours — save your PDF locally.",
  },
];

export default function HowItWorksPage() {
  return (
    <PageContainer size="md" className="space-y-10">
      <div className="max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          Pipeline
        </p>
        <h1 className="display-md mb-3">How Rizzme works</h1>
        <p className="text-body text-muted">
          From raw student input to an ATS-ready PDF — here is the full flow
          behind every resume we generate.
        </p>
      </div>

      <ol className="space-y-4">
        {PIPELINE_STEPS.map((step, index) => (
          <li key={step.title}>
            <Card className="flex gap-4 sm:gap-5">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary sm:h-10 sm:w-10"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-ink sm:text-lg">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <Card variant="soft" className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">Ready to build yours?</p>
          <p className="text-sm text-muted">
            Most previews are ready in under 40 seconds.
          </p>
        </div>
        <Link href="/generate" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create resume</Button>
        </Link>
      </Card>
    </PageContainer>
  );
}
