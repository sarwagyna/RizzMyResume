"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { TextInput } from "@/components/shared/TextInput";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Logo } from "@/components/shared/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/generate";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(urlError);
  const [sent, setSent] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (urlError) setError(urlError);
  }, [urlError]);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      if (user) {
        router.replace(redirect);
        return;
      }
      setCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, [router, redirect, supabase]);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthCallbackUrl(redirect),
      },
    });

    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <LoadingSpinner label="Checking session..." />
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
        <Card className="w-full text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-xl">
            ✉
          </div>
          <h1 className="display-sm mb-2">Check your email</h1>
          <p className="mb-2 text-body">
            We sent a sign-in link to{" "}
            <span className="font-semibold text-ink">{email}</span>.
          </p>
          <p className="mb-6 text-sm text-muted">
            Click the link to continue. It may take up to a minute — check spam
            if you don&apos;t see it.
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
          >
            Use a different email
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
      <Card className="w-full shadow-card">
        <div className="mb-6 flex justify-center">
          <Logo className="h-10" />
        </div>
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
            Account
          </p>
          <h1 className="display-sm mb-2">Sign in to Rizzme</h1>
          <p className="text-sm text-muted">
            Enter your email and we&apos;ll send a magic link. No password
            needed.
          </p>
        </div>

        <form onSubmit={sendMagicLink} className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
          />
          {error && (
            <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          <Button type="submit" loading={submitting} className="w-full">
            Send magic link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <span className="text-ink">
            Use the same flow — we&apos;ll create your account automatically.
          </span>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
          <LoadingSpinner label="Loading..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
