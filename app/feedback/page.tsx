"use client";

import { useState } from "react";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { PageContainer } from "@/components/shared/PageContainer";
import { SUPPORT_EMAIL } from "@/components/shared/Footer";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Rizz My Resume feedback${name ? ` from ${name}` : ""}`;
    const body = `Name: ${name || "—"}\nEmail: ${email || "—"}\n\n${message}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <PageContainer size="sm" className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          Feedback
        </p>
        <h1 className="display-md mb-2">Share feedback</h1>
        <p className="text-sm text-muted">
          Tell us what worked, what didn&apos;t, or what we should build next.
        </p>
      </div>

      <Card>
        {sent ? (
          <div className="space-y-3 text-center">
            <p className="font-medium text-ink">Opening your email app…</p>
            <p className="text-sm text-muted">
              If nothing opened, email us directly at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ink underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
            <Button variant="secondary" onClick={() => setSent(false)}>
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextInput
              label="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="What can we improve?"
              />
            </div>
            <Button type="submit" className="w-full">
              Send feedback
            </Button>
          </form>
        )}
      </Card>
    </PageContainer>
  );
}
