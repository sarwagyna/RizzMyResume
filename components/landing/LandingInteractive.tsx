"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useSignedIn } from "@/lib/hooks/useSignedIn";

const LOGIN_HREF = "/login?redirect=%2Fgenerate";

export function LandingNav() {
  const { signedIn, loading } = useSignedIn();

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-5">
        <Link href={signedIn ? "/dashboard" : "/"} className="shrink-0 text-ink">
          <Logo />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <a href="#how" className="transition hover:text-ink">
            How it works
          </a>
          <a href="#features" className="transition hover:text-ink">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-ink">
            Pricing
          </a>
          <a href="#faq" className="transition hover:text-ink">
            FAQ
          </a>
        </div>
        {!loading && !signedIn && (
          <Link
            href={LOGIN_HREF}
            className="flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-active"
          >
            Get started
          </Link>
        )}
        {!loading && signedIn && (
          <Link
            href="/generate"
            className="flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-active"
          >
            New resume
          </Link>
        )}
      </nav>
    </header>
  );
}

export function LandingHero() {
  const { signedIn, loading } = useSignedIn();

  return (
    <section className="mx-auto grid max-w-content items-center gap-12 px-5 py-20 lg:grid-cols-12 lg:py-24">
      <div className="lg:col-span-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-card px-3 py-1 text-[13px] font-medium text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Now live · Free preview before you pay
        </span>

        <h1 className="font-display mt-6 text-[44px] leading-[1.05] text-ink sm:text-[56px]">
          The better way to build a job-ready resume.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
          RizzMyResume turns your raw info into a professional, ATS-optimised
          resume PDF in under 2 minutes — tailored to any job description.
          Built for Indian college students. Just ₹50.
        </p>

        {!loading && !signedIn && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={LOGIN_HREF}
              className="flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-active"
            >
              Create resume — free preview
            </Link>
            <Link
              href={LOGIN_HREF}
              className="flex h-11 items-center justify-center rounded-md border border-hairline px-6 text-sm font-semibold text-ink transition hover:bg-surface-card"
            >
              Sign in
            </Link>
          </div>
        )}
        {!loading && signedIn && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/generate"
              className="flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-active"
            >
              Create resume
            </Link>
            <Link
              href="/dashboard"
              className="flex h-11 items-center justify-center rounded-md border border-hairline px-6 text-sm font-semibold text-ink transition hover:bg-surface-card"
            >
              My resumes
            </Link>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <span>✓ ATS-safe single-page PDF</span>
          <span>✓ Tailored to the job</span>
          <span>✓ Ready in under 2 minutes</span>
        </div>
      </div>

      <div className="lg:col-span-6">
        <ResumeMockup />
      </div>
    </section>
  );
}

function ResumeMockup() {
  return (
    <div className="rounded-xl border border-hairline bg-canvas p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="flex items-start justify-between border-b border-hairline pb-5">
        <div>
          <div className="font-display text-xl text-ink">Aarav Sharma</div>
          <div className="mt-1 text-sm text-muted">
            Aspiring Software Engineer · B.Tech CSE
          </div>
          <div className="mt-1 text-[13px] text-muted-soft">
            Pune, MH · aarav@college.edu · linkedin.com/in/aarav
          </div>
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          ATS 92
        </span>
      </div>
      <div className="mt-5 space-y-4">
        <MockLine label="EXPERIENCE" widths={["90%", "75%"]} />
        <MockLine label="PROJECTS" widths={["85%", "80%", "60%"]} />
        <MockLine label="SKILLS" widths={["95%"]} />
      </div>
    </div>
  );
}

function MockLine({ label, widths }: { label: string; widths: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-widest text-muted-soft">
        {label}
      </div>
      <div className="mt-2 space-y-1.5">
        {widths.map((w, i) => (
          <div
            key={i}
            className="h-2 rounded-full bg-surface-strong"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  );
}

export function LandingPricing() {
  const { signedIn, loading } = useSignedIn();

  return (
    <section id="pricing" className="mx-auto max-w-content scroll-mt-20 px-5 py-20 lg:py-24">
      <SectionHeading
        eyebrow="Pricing"
        title="Student-friendly, always"
        subtitle="Pay per resume. No subscription, ever."
      />
      <div className="mx-auto mt-12 max-w-md rounded-lg bg-surface-dark p-8 text-white">
        <div className="text-sm font-medium text-on-dark-soft">Pay per resume</div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-display text-2xl text-white/70">₹</span>
          <span className="font-display text-6xl">50</span>
          <span className="text-on-dark-soft">/ resume</span>
        </div>
        <ul className="mt-7 space-y-3 text-sm text-white/85">
          {[
            "ATS-optimised, single-page PDF",
            "Tailored to your target job description",
            "“What changed & why” explanation",
            "Re-download free within 24 hours",
            "UPI, cards & net banking",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 text-success">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {!loading && !signedIn && (
          <Link
            href={LOGIN_HREF}
            className="mt-8 flex h-11 items-center justify-center rounded-md bg-white text-sm font-semibold text-ink transition hover:bg-surface-strong"
          >
            Start free preview
          </Link>
        )}
        {!loading && signedIn && (
          <Link
            href="/generate"
            className="mt-8 flex h-11 items-center justify-center rounded-md bg-white text-sm font-semibold text-ink transition hover:bg-surface-strong"
          >
            Create resume
          </Link>
        )}
        <p className="mt-4 text-center text-[13px] text-on-dark-soft">
          Packs of 3 &amp; 10 and college bulk pricing coming soon.
        </p>
      </div>
    </section>
  );
}

export function LandingFinalCTA() {
  const { signedIn, loading } = useSignedIn();

  return (
    <section className="mx-auto max-w-content scroll-mt-20 px-5 py-20 lg:py-24">
      <div className="rounded-lg bg-surface-card px-6 py-14 text-center sm:px-12">
        <h2 className="font-display mx-auto max-w-2xl text-balance text-[28px] leading-tight text-ink sm:text-[36px]">
          Your next resume could be the one that lands the interview
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body">
          {signedIn
            ? "Jump back in — create a new resume or pick up where you left off."
            : "Sign in, preview your tailored resume for free, and pay ₹50 only when you're ready to download."}
        </p>
        {!loading && !signedIn && (
          <div className="mt-8">
            <Link
              href={LOGIN_HREF}
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-white transition hover:bg-primary-active"
            >
              Get started — it&apos;s live
            </Link>
          </div>
        )}
        {!loading && signedIn && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/generate"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-white transition hover:bg-primary-active"
            >
              Create resume
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md border border-hairline px-8 text-sm font-semibold text-ink transition hover:bg-canvas"
            >
              My resumes
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <span className="text-[13px] font-semibold uppercase tracking-widest text-muted-soft">
        {eyebrow}
      </span>
      <h2 className="font-display mt-3 text-balance text-[32px] leading-tight text-ink sm:text-[40px]">
        {title}
      </h2>
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-body">{subtitle}</p>}
    </div>
  );
}
