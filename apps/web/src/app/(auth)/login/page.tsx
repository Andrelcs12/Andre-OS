import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { startLocalDevSession } from "@/lib/auth/actions";
import { getLocalDevSession } from "@/lib/auth/local-session";

export default async function LoginPage() {
  if (await getLocalDevSession()) redirect("/today");

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
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            DEV AUTH / LOCAL SESSION
          </p>
          <CardTitle className="text-xl">Bem-vindo ao ANDRÉ OS</CardTitle>
          <CardDescription>
            Uma sessão local temporária para validar a área protegida nesta
            fase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={startLocalDevSession}>
            <Button className="w-full" size="lg">
              Entrar como André
            </Button>
          </form>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Não é autenticação de produção. Supabase Auth substituirá este fluxo
            na Fase 2.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
