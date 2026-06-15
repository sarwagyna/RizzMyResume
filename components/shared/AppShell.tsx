"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/shared/TopNav";
import { Footer } from "@/components/shared/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
