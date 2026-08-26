import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/services/auth.service";

export default async function Home() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;
  redirect(user ? "/today" : "/login");
}
