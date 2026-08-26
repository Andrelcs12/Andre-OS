import { getCurrentUser } from "@/services/auth.service";
import type { AuthenticatedProfile } from "@/types/auth";

function getFallbackName(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
) {
  const metadata = user.user_metadata;
  return (
    metadata.full_name ?? metadata.name ?? user.email?.split("@")[0] ?? "André"
  );
}

export async function getCurrentProfile(): Promise<AuthenticatedProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    displayName: data?.display_name ?? getFallbackName(user),
    avatarUrl: data?.avatar_url ?? user.user_metadata.avatar_url ?? null,
  };
}
