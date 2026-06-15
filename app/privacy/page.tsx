import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/LegalPage";
import { COMPANY } from "@/lib/company";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy policy",
  description: `How ${COMPANY.product} by ${COMPANY.name} collects, uses, and protects your data. Effective ${COMPANY.effectiveDate}.`,
  path: "/privacy",
  ogType: "article",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      description={`Effective date: ${COMPANY.effectiveDate} · ${COMPANY.product} by ${COMPANY.name}`}
    >
      <h2 className="text-base font-semibold text-ink">Who we are</h2>
      <p>
        {COMPANY.product} is a product of {COMPANY.name}, a company incorporated in
        Andhra Pradesh, India (CIN: {COMPANY.cin}).
      </p>

      <h2 className="text-base font-semibold text-ink">What data we collect</h2>
      <p>When you use {COMPANY.product} we collect:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Name, email address, phone number</li>
        <li>College name, year, city and state</li>
        <li>
          Resume input data — education, skills, projects, experience,
          certifications
        </li>
        <li>Target job description (if provided)</li>
        <li>
          Payment information processed securely by Razorpay (we never store card
          or UPI details)
        </li>
        <li>Generated resume content and LaTeX code</li>
        <li>Usage data — timestamps, generation status</li>
      </ul>

      <h2 className="text-base font-semibold text-ink">How we use your data</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>To generate your resume using our AI system</li>
        <li>To process your payment via Razorpay</li>
        <li>To send you your generated PDF and certificate</li>
        <li>To send transactional emails related to your order</li>
        <li>To improve our AI prompt and generation quality</li>
      </ul>
      <p>
        We do not sell your data to third parties. We do not use your data for
        advertising.
      </p>

      <h2 className="text-base font-semibold text-ink">Resume data retention</h2>
      <p>
        Your generated resume PDF and all associated content including raw input,
        LaTeX code, and generated text are permanently deleted from our systems
        within 24 hours of creation. After deletion, your resume cannot be
        recovered. Download your PDF before the 24-hour window expires.
      </p>

      <h2 className="text-base font-semibold text-ink">Payment data</h2>
      <p>
        All payment processing is handled by Razorpay. We do not store your card
        number, UPI ID, or any sensitive payment credentials. We only store the
        Razorpay Order ID and Payment ID for transaction records.
      </p>

      <h2 className="text-base font-semibold text-ink">Data storage</h2>
      <p>
        Your data is stored on Supabase infrastructure with encryption at rest.
        Resume PDFs are stored temporarily on Supabase Storage and deleted after
        24 hours.
      </p>

      <h2 className="text-base font-semibold text-ink">Your rights</h2>
      <p>
        Under the Digital Personal Data Protection Act 2023 (DPDPA) you have the
        right to:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Access your personal data we hold</li>
        <li>Correct inaccurate personal data</li>
        <li>Request deletion of your personal data</li>
        <li>Withdraw consent at any time</li>
      </ul>
      <p>
        To exercise any of these rights email us at{" "}
        <a href={`mailto:${COMPANY.email}`} className="text-ink underline">
          {COMPANY.email}
        </a>
      </p>

      <h2 className="text-base font-semibold text-ink">Third party services</h2>
      <p>We use the following third-party services:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Razorpay — payment processing</li>
        <li>Anthropic Claude API — AI resume generation</li>
        <li>LaTeXLite API — PDF compilation</li>
        <li>Supabase — database and storage</li>
        <li>Resend — transactional email</li>
      </ul>
      <p>
        Each third party has their own privacy policy governing their data
        handling.
      </p>

      <h2 className="text-base font-semibold text-ink">Cookies</h2>
      <p>
        We use only essential cookies required for authentication and session
        management. We do not use tracking or advertising cookies.
      </p>

      <h2 className="text-base font-semibold text-ink">Contact</h2>
      <p>{COMPANY.name}</p>
      <p>
        <a href={`mailto:${COMPANY.email}`} className="text-ink underline">
          {COMPANY.email}
        </a>
      </p>
      <p>
        <a
          href={COMPANY.website}
          className="text-ink underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          sarwagyna.com
        </a>
      </p>
    </LegalPage>
  );
}
