import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import {
  LandingFinalCTA,
  LandingHero,
  LandingNav,
  LandingPricing,
} from "@/components/landing/LandingInteractive";
import { getAppUrl, siteConfig } from "@/lib/site";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Dump your info",
    body: "Type your details, skills and projects — no formatting, no design skills needed. Or paste the job description you're targeting.",
  },
  {
    n: "02",
    title: "AI tailors & rewrites",
    body: "Our V5.3 engine rewrites your content with the right keywords for ATS, then shows you exactly what it changed and why.",
  },
  {
    n: "03",
    title: "Download your PDF",
    body: "Get a clean, single-page, ATS-safe PDF in under 2 minutes — ready to submit to any portal. All for ₹50.",
  },
];

const FEATURES = [
  {
    icon: "◎",
    title: "ATS-optimised",
    body: "Single-column, recruiter-friendly layout that sails past the first automated filter — where most resumes die.",
  },
  {
    icon: "⌘",
    title: "JD-matched keywords",
    body: "Paste any job description and we align your resume's language to it so your application actually gets seen.",
  },
  {
    icon: "⚡",
    title: "Under 2 minutes",
    body: "From raw notes to a downloadable PDF in minutes. No templates to fiddle with, no Word formatting nightmares.",
  },
  {
    icon: "❖",
    title: "What changed & why",
    body: "Every rewrite comes with an explanation, so you can confidently defend every line in your interview.",
  },
  {
    icon: "▥",
    title: "ATS score",
    body: "See how your resume scores out of 100 with concrete tips to push it higher before you apply.",
  },
  {
    icon: "₹",
    title: "Just ₹50",
    body: "No subscriptions, no career-coach fees. Pay ₹50 over UPI per resume. Built for student budgets.",
  },
];

const FAQS = [
  {
    q: "Who is RizzMyResume for?",
    a: "Indian college students — 2nd to final year B.Tech, BCA, BSc, BBA, MCA and recent grads applying for internships and first jobs. If you're switching jobs early in your career, it works for you too.",
  },
  {
    q: "How much does it cost?",
    a: "₹50 per resume, paid over UPI, cards or net banking. No subscription. Packs and college bulk pricing are coming soon.",
  },
  {
    q: "Will it pass ATS systems?",
    a: "Yes. Every resume is generated as a single-column, single-page, ATS-safe PDF and tuned to the job description you provide so the right keywords are present.",
  },
  {
    q: "Does it make things up about me?",
    a: "Never. If your input is too thin, RizzMyResume flags what's missing instead of fabricating experience you don't have.",
  },
  {
    q: "How do I get started?",
    a: "Sign in with your email — no password needed. You'll get a magic link, then fill in your details or upload a PDF, preview your resume for free, and pay ₹50 only when you're ready to download.",
  },
];

function PageJsonLd() {
  const url = getAppUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/#app`,
        name: siteConfig.name,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Resume Builder",
        operatingSystem: "Web",
        description: siteConfig.shortDescription,
        url,
        inLanguage: "en-IN",
        publisher: { "@id": `${url}/#organization` },
        offers: {
          "@type": "Offer",
          price: siteConfig.price,
          priceCurrency: siteConfig.currency,
          category: "Pay per resume",
          availability: "https://schema.org/InStock",
        },
        featureList: [
          "ATS-optimised single-page PDF",
          "Tailored to a target job description",
          "Resume generated in under 2 minutes",
          "What-changed-and-why explanation",
          "ATS score out of 100",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: FAQS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-body">
      <PageJsonLd />
      <LandingNav />
      <main>
        <LandingHero />
        <Problem />
        <HowItWorks />
        <Features />
        <LandingPricing />
        <FAQ />
        <LandingFinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function Problem() {
  return (
    <section className="border-t border-hairline-soft bg-surface-soft">
      <div className="mx-auto max-w-content px-5 py-20 text-center lg:py-24">
        <h2 className="font-display mx-auto max-w-3xl text-balance text-[32px] leading-tight text-ink sm:text-[40px]">
          Skilled students keep losing to a broken resume.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-body">
          Most students at Tier 2 and Tier 3 colleges don&apos;t have access to
          an affordable, technically sound way to build a job-ready resume.
          Existing tools are expensive, too generic, or demand design skills you
          shouldn&apos;t need. So great candidates get filtered out before a
          human ever reads their name.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { stat: "70%+", label: "of resumes are rejected by ATS before a human sees them" },
            { stat: "₹2,000+", label: "is what premium resume services typically charge" },
            { stat: "Millions", label: "of students affected every placement cycle in India" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-hairline bg-canvas p-8 text-left"
            >
              <div className="font-display text-4xl text-ink">{item.stat}</div>
              <p className="mt-3 text-sm text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-content scroll-mt-20 px-5 py-20 lg:py-24">
      <SectionHeading
        eyebrow="How it works"
        title="From raw notes to a hire-worthy resume"
        subtitle="Three steps. No design skills. No formatting struggle."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="rounded-lg bg-surface-card p-8">
            <div className="font-display text-2xl text-muted-soft">{step.n}</div>
            <h3 className="font-display mt-3 text-lg text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-t border-hairline-soft bg-surface-soft">
      <div className="mx-auto max-w-content scroll-mt-20 px-5 py-20 lg:py-24">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to get past the filter"
          subtitle="Purpose-built for the Indian placement season."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-hairline bg-canvas p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-card text-lg text-ink">
                {f.icon}
              </div>
              <h3 className="font-display mt-4 text-base text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="border-t border-hairline-soft bg-surface-soft">
      <div className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20 lg:py-24">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 divide-y divide-hairline border-y border-hairline">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base text-ink">
                {item.q}
                <span className="ml-4 text-xl text-muted transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface-dark text-on-dark-soft">
      <div className="mx-auto max-w-content px-5 py-16 sm:py-12">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" className="inline-block">
              <Logo variant="light" />
            </Link>
            <p className="max-w-xs text-center text-sm sm:text-left">
              ATS-ready resumes for Indian students. Preview free — pay once to
              download.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 sm:items-end">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#pricing" className="transition hover:text-white">
                Pricing
              </a>
              <a href="#faq" className="transition hover:text-white">
                FAQ
              </a>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <p className="mt-10 text-center text-sm">
          © {new Date().getFullYear()} Sarwagyna Private Limited · Made in India
          🇮🇳
        </p>
      </div>
    </footer>
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
