import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { getCurrentProfile } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return (
    <div className="min-h-screen lg:pl-60">
      <AppHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
