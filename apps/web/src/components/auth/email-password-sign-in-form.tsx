"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function EmailPasswordSignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn(formData: FormData) {
    setError(null);
    setPending(true);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const { error: signInError } =
      await createSupabaseBrowserClient().auth.signInWithPassword({
        email,
        password,
      });
    setPending(false);
    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.replace("/today");
    router.refresh();
  }

  return (
    <form action={signIn} className="grid gap-3">
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="email">
        E-mail
        <input
          required
          autoComplete="email"
          id="email"
          name="email"
          type="email"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="password">
        Senha
        <input
          required
          autoComplete="current-password"
          id="password"
          name="password"
          type="password"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Entrando..." : "Entrar com e-mail"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem acesso?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
