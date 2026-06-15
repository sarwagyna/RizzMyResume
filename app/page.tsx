import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { PageContainer } from "@/components/shared/PageContainer";
import { RetentionNotice } from "@/components/preview/RetentionNotice";

const FEATURES = [
  {
    title: "ATS-optimised output",
    description:
      "One-page Harshibar-style LaTeX resume in Times New Roman — built for applicant tracking systems.",
  },
  {
    title: "Preview before you pay",
    description:
      "See your resume, ATS score, and JD keyword match before a one-time ₹50 unlock.",
  },
  {
    title: "Built for students",
    description:
      "Upload a PDF to auto-fill, or complete a guided form for projects, skills, and experience.",
  },
];

export default function HomePage() {
  return (
    <PageContainer className="space-y-12 py-4 sm:py-8">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
          Resume builder for students & freshers
        </p>
        <h1 className="display-lg mb-4 text-balance">
          Turn your profile into an ATS-ready resume in minutes
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base text-muted sm:text-lg">
          AI tailors your bullets to the job description, compiles a professional
          PDF, and shows an ATS score — preview free, pay once to download.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/generate">
            <Button size="lg" className="w-full min-w-[200px] sm:w-auto">
              Create resume — free preview
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              How it works
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} variant="soft" className="h-full">
            <h2 className="mb-2 text-base font-semibold text-ink">
              {feature.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </Card>
        ))}
      </section>

      <RetentionNotice />

      <Card
        variant="soft"
        className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left"
      >
        <div>
          <p className="font-semibold text-ink">₹50 one-time unlock</p>
          <p className="text-sm text-muted">
            UPI, cards, and net banking via Razorpay. Download + email delivery.
          </p>
        </div>
        <Link href="/login?redirect=%2Fgenerate" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Sign in to start</Button>
        </Link>
      </Card>
    </PageContainer>
  );
}
