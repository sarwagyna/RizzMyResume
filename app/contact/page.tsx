import { Card } from "@/components/shared/Card";
import { PageContainer } from "@/components/shared/PageContainer";
import { COMPANY } from "@/lib/company";
import Link from "next/link";

export default function ContactPage() {
  return (
    <PageContainer size="sm" className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          Contact
        </p>
        <h1 className="display-md mb-2">Contact us</h1>
        <p className="text-sm text-muted">
          Questions about payments, refunds, privacy, or your account.
        </p>
      </div>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted">Platform</p>
          <p className="text-ink">{COMPANY.product}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Company</p>
          <p className="text-ink">{COMPANY.name}</p>
          <p className="text-sm text-muted">{COMPANY.location}</p>
          <p className="text-sm text-muted">CIN: {COMPANY.cin}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Email</p>
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-lg font-semibold text-ink underline"
          >
            {COMPANY.email}
          </a>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Website</p>
          <a
            href={COMPANY.website}
            className="text-ink underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            sarwagyna.com
          </a>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Response time</p>
          <p className="text-sm text-body">
            We aim to reply within 1–2 business days. Include your sign-in email
            and payment or generation ID when reporting an issue.
          </p>
        </div>
      </Card>

      <p className="text-sm text-muted">
        See also{" "}
        <Link href="/refund-policy" className="font-medium text-ink underline">
          Refund policy
        </Link>
        ,{" "}
        <Link href="/privacy" className="font-medium text-ink underline">
          Privacy policy
        </Link>
        , and{" "}
        <Link href="/help" className="font-medium text-ink underline">
          Help
        </Link>
        .
      </p>
    </PageContainer>
  );
}
