import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Create resume",
  description: "Build or upload your profile and generate an ATS-optimised resume preview.",
  path: "/generate",
  noIndex: true,
});

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
