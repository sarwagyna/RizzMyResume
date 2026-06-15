"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthDisplayName, getAuthInitials } from "@/lib/authDisplayName";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

export function AuthMenu() {
  const router = useRouter();
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!active) return;
      setUser(currentUser);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setSigningOut(false);
  };

  if (loading) {
    return (
      <div
        aria-hidden
        className="h-9 w-24 animate-pulse rounded-md bg-surface-soft"
      />
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="secondary" size="sm">
          Sign in
        </Button>
      </Link>
    );
  }

  const displayName = getAuthDisplayName(user);
  const initials = getAuthInitials(displayName);
  const email = user.email ?? "";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className={cn(
          "flex h-9 max-w-[148px] items-center gap-1.5 rounded-md border border-hairline bg-canvas px-2 text-sm transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:max-w-[220px] sm:gap-2 sm:px-2.5",
          menuOpen && "bg-surface-soft"
        )}
      >
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary"
        >
          {initials}
        </span>
        <span className="truncate font-medium text-ink max-sm:text-xs">
          {displayName}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            menuOpen && "rotate-180"
          )}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-card"
        >
          <div className="border-b border-hairline px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">
              {displayName}
            </p>
            {email && (
              <p className="truncate text-xs text-muted">{email}</p>
            )}
          </div>
          <div className="p-1">
            <Link
              href="/help"
              role="menuitem"
              className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-soft"
              onClick={() => setMenuOpen(false)}
            >
              Help
            </Link>
            <Link
              href="/support"
              role="menuitem"
              className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-soft"
              onClick={() => setMenuOpen(false)}
            >
              Support
            </Link>
            <Link
              href="/how-it-works"
              role="menuitem"
              className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-soft"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/dashboard"
              role="menuitem"
              className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-soft"
              onClick={() => setMenuOpen(false)}
            >
              My resumes
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={handleSignOut}
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-error hover:bg-surface-soft disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
