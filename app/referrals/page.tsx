import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { ReferralProgram } from "@/components/referrals/ReferralProgram";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageContainer } from "@/components/shared/PageContainer";

export const metadata: Metadata = createPageMetadata({
  title: "Referrals",
  description:
    "Invite friends and earn credits toward free resume downloads.",
  path: "/referrals",
  noIndex: true,
});

export default function ReferralsPage() {
  return (
    <ErrorBoundary>
      <PageContainer size="sm">
        <div className="mb-6 sm:mb-8">
          <h1 className="display-md mb-2">Referral program</h1>
          <p className="text-sm text-muted sm:text-base">
            Earn 10 credits for every friend who signs up. Collect 50 credits
            for a free resume download.
          </p>
        </div>
        <ReferralProgram />
      </PageContainer>
    </ErrorBoundary>
  );
}
