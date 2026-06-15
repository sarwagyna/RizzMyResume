import Link from "next/link";
import { Logo } from "./Logo";
import { COMPANY } from "@/lib/company";

const footerLinks = [
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/feedback", label: "Feedback" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline bg-surface-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link href="/how-it-works" className="inline-block">
              <Logo className="h-8" />
            </Link>
            <p className="max-w-sm text-sm text-muted">
              ATS-ready resumes for students and freshers. Preview free — pay
              once to download. Resume files are removed from our servers after
              24 hours.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-1">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-6 text-center text-xs text-muted-soft">
          {COMPANY.aiDisclaimer}
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-muted-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} {COMPANY.product} · {COMPANY.name}</p>
            <p>{COMPANY.license}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/help" className="hover:text-ink">
              Help
            </Link>
            <Link href="/support" className="hover:text-ink">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { SUPPORT_EMAIL } from "@/lib/company";
