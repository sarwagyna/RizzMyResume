import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Feedback",
  description:
    "Share feedback, feature ideas, or report bugs for Rizz My Resume. We read every message.",
  path: "/feedback",
});

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
