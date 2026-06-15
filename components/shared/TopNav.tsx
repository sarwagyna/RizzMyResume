"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import { AuthMenu } from "./AuthMenu";
import { Logo } from "./Logo";

export function TopNav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setSignedIn(Boolean(user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Link
          href={signedIn ? "/generate" : "/how-it-works"}
          className="shrink-0 text-ink"
        >
          <Logo />
        </Link>

        <nav className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link
            href="/how-it-works"
            className="hidden text-sm font-medium text-muted hover:text-ink sm:inline"
          >
            How it works
          </Link>
          {signedIn && (
            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-muted hover:text-ink md:inline"
            >
              My resumes
            </Link>
          )}
          <AuthMenu />
          {signedIn && (
            <Link href="/generate" className="hidden shrink-0 md:inline-flex">
              <Button size="sm">New resume</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
