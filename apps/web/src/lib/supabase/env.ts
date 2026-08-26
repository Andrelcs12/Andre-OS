const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

type SupabaseEnvKey = (typeof requiredKeys)[number];

function getEnvValue(key: SupabaseEnvKey) {
  const value = process.env[key];
  return value?.trim() || undefined;
}

export function isSupabaseConfigured() {
  return requiredKeys.every((key) => Boolean(getEnvValue(key)));
}

export function getSupabaseEnv() {
  const url = getEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = getEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}
