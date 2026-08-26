import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { getLocalDevSession } from "@/lib/auth/local-session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!(await getLocalDevSession())) redirect("/login");
  return (
    <div className="min-h-screen lg:pl-60">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
