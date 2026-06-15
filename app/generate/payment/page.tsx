"use client";

import { PaymentStatus } from "@/components/payment/PaymentStatus";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function PaymentPage() {
  return (
    <ErrorBoundary>
      <PaymentStatus />
    </ErrorBoundary>
  );
}
