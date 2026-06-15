"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white p-6 font-sans text-neutral-900">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p className="text-sm text-neutral-600">
            A critical error occurred. Please refresh and try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
