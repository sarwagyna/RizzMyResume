"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { fetchReferralStats } from "@/lib/referralStats";
import {
  CREDITS_PER_FREE_RESUME,
  REFERRAL_CREDITS_PER_SIGNUP,
} from "@/lib/referrals";
import type { ReferralStats } from "@/lib/types";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function transactionLabel(type: string): string {
  switch (type) {
    case "referral_reward":
      return "Referral reward";
    case "referral_signup_bonus":
      return "Signup bonus";
    case "redemption":
      return "Resume redemption";
    default:
      return "Credit update";
  }
}

export function ReferralProgram() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReferralStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const copyLink = async () => {
    if (!stats?.referral_link) return;
    try {
      await navigator.clipboard.writeText(stats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link. Copy it manually.");
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-12" label="Loading referral program..." />;
  }

  if (error || !stats) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-error">{error || "Referral data unavailable"}</p>
        <Button variant="secondary" onClick={() => void loadStats()}>
          Try again
        </Button>
      </Card>
    );
  }

  const resumesUnlocked = Math.floor(stats.credits / CREDITS_PER_FREE_RESUME);
  const progressToNext =
    ((stats.credits % CREDITS_PER_FREE_RESUME) / CREDITS_PER_FREE_RESUME) * 100;

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              Your balance
            </p>
            <p className="font-display text-5xl text-ink">{stats.credits}</p>
            <p className="mt-1 text-sm text-muted">credits available</p>
          </div>
          <div className="rounded-lg bg-surface-soft px-4 py-3 text-sm">
            <p className="font-semibold text-ink">
              {resumesUnlocked} free resume{resumesUnlocked === 1 ? "" : "s"}{" "}
              available
            </p>
            <p className="mt-1 text-muted">
              {CREDITS_PER_FREE_RESUME} credits = 1 free resume
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs text-muted">
            <span>Progress to next free resume</span>
            <span>
              {stats.credits % CREDITS_PER_FREE_RESUME}/{CREDITS_PER_FREE_RESUME}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Invite friends</h2>
          <p className="mt-1 text-sm text-muted">
            Share your link. When a friend signs up, you both earn{" "}
            {REFERRAL_CREDITS_PER_SIGNUP} credits.
          </p>
        </div>

        <div className="rounded-lg border border-hairline bg-surface-soft px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Your referral code
          </p>
          <p className="mt-1 font-display text-2xl tracking-wider text-ink">
            {stats.referral_code}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={stats.referral_link}
            className="h-11 flex-1 rounded-md border border-hairline bg-canvas px-3 text-sm text-ink"
          />
          <Button onClick={() => void copyLink()} className="shrink-0">
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        <p className="text-sm text-muted">
          {stats.referral_count} friend{stats.referral_count === 1 ? "" : "s"}{" "}
          joined via your link.
        </p>
      </Card>

      {stats.recent_referrals.length > 0 && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Recent referrals</h2>
          <ul className="divide-y divide-hairline">
            {stats.recent_referrals.map((referral) => (
              <li
                key={referral.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="text-ink">
                  {referral.full_name || referral.email || "New user"}
                </span>
                <span className="text-muted">{formatDate(referral.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {stats.transactions.length > 0 && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Credit history</h2>
          <ul className="divide-y divide-hairline">
            {stats.transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">
                    {transactionLabel(tx.type)}
                  </p>
                  <p className="text-xs text-muted">{formatDate(tx.created_at)}</p>
                </div>
                <span
                  className={
                    tx.amount >= 0
                      ? "font-semibold text-success"
                      : "font-semibold text-ink"
                  }
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="text-center">
        <Link href="/generate" className="text-sm font-semibold text-ink underline">
          Create a resume
        </Link>
      </div>
    </div>
  );
}
