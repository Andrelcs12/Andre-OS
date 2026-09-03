import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EmailPasswordSignUpForm } from "@/components/auth/email-password-sign-up-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile } from "@/services/profile.service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Criar conta" };

export default async function SignUpPage() {
  if (await getCurrentProfile()) redirect("/today");
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="absolute top-5 left-5">
        <BrandLogo />
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm border">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>
            Crie seu acesso pessoal ao ANDRÉ OS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailPasswordSignUpForm />
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            ou
          </div>
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </main>
  );
}
