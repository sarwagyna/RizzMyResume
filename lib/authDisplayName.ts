import type { User } from "@supabase/supabase-js";

export function getAuthDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    "";

  if (fromMeta) return fromMeta;

  const email = user.email?.trim();
  if (email) {
    const local = email.split("@")[0] ?? "";
    if (local) {
      return local
        .replace(/[._+-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }

  return "Account";
}

export function getAuthInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase();
}
