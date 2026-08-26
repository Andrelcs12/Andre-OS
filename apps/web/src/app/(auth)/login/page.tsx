import { redirect } from "next/navigation";

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
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/services/auth.service";

type LoginPageProps = { searchParams: Promise<{ error?: string }> };
const errors: Record<string, string> = {
  oauth_callback: "Não foi possível concluir o login. Tente novamente.",
  oauth_cancelled: "Login cancelado. Você pode tentar novamente quando quiser.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  if (isSupabaseConfigured() && (await getCurrentUser())) redirect("/today");
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
          <CardTitle className="text-xl">Bem-vindo ao ANDRÉ OS</CardTitle>
          <CardDescription>
            Entre para acompanhar sua execução, aprendizado e evolução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton />
          {error ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {errors[error] ?? "Não foi possível concluir a autenticação."}
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            A conta é autenticada pelo Google via Supabase Auth.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
