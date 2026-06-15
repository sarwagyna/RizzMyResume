/** Minimal Deno globals for Supabase Edge Functions (IDE typecheck). */
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }

  function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};
