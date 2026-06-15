import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { PageContainer } from "@/components/shared/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, createPageMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Help centre — FAQs",
  description:
    "Answers about creating resumes, ₹50 payment, 24-hour file retention, editing previews, and Razorpay payment methods on Rizz My Resume.",
  path: "/help",
});

const FAQ = [
  {
    q: "How do I create a resume?",
    a: "Sign in, upload an existing resume or fill the step-by-step form, add your target role and job description, then generate a preview.",
  },
  {
    q: "Why can't I download before paying?",
    a: "The preview is view-only until you complete the ₹50 Razorpay payment. This protects our AI-generated output.",
  },
  {
    q: "How long is my resume stored?",
    a: "PDF files and generation records are automatically deleted from our servers 24 hours after creation. Download and save your PDF before then.",
  },
  {
    q: "Can I edit after generating?",
    a: "Yes — go back to the form, update your details, and generate a new preview. Unpaid previews can be completed from your dashboard.",
  },
  {
    q: "What payment methods are accepted?",
    a: "UPI, debit/credit cards, and net banking via Razorpay.",
  },
];

export default function HelpPage() {
  return (
    <PageContainer size="sm" className="space-y-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Help", path: "/help" },
          ]),
          faqJsonLd(FAQ.map((item) => ({ question: item.q, answer: item.a }))),
        ]}
      />
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          Help centre
        </p>
        <h1 className="display-md mb-2">Help</h1>
        <p className="text-sm text-muted">
          Quick answers to common questions about Rizz My Resume.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ.map((item) => (
          <Card key={item.q} className="!p-4 sm:!p-5">
            <h2 className="mb-2 font-semibold text-ink">{item.q}</h2>
            <p className="text-sm leading-relaxed text-muted">{item.a}</p>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted">
        Still stuck? Visit{" "}
        <Link href="/support" className="font-medium text-ink underline">
          Support
        </Link>{" "}
        or read{" "}
        <Link href="/how-it-works" className="font-medium text-ink underline">
          How it works
        </Link>
        .
      </p>
    </PageContainer>
  );
}
