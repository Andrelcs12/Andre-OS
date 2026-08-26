import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

export async function signOutCurrentUser() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}
