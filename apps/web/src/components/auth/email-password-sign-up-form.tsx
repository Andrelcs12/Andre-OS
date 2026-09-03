"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function EmailPasswordSignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signUp(formData: FormData) {
    setError(null);
    setMessage(null);
    const displayName = String(formData.get("displayName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    if (password.length < 12) {
      setError("Use uma senha com pelo menos 12 caracteres.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setPending(true);
    const { data, error: signUpError } =
      await createSupabaseBrowserClient().auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || undefined },
          emailRedirectTo: new URL(
            "/auth/callback?next=/today",
            window.location.origin,
          ).toString(),
        },
      });
    setPending(false);

    if (signUpError) {
      setError(
        "Não foi possível criar a conta. Revise os dados e tente novamente.",
      );
      return;
    }
    if (data.session) {
      router.replace("/today");
      router.refresh();
      return;
    }
    setMessage("Conta criada. Confirme o e-mail para entrar.");
  }

  return (
    <form action={signUp} className="grid gap-3">
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="displayName">
        Nome
        <input
          autoComplete="name"
          id="displayName"
          name="displayName"
          type="text"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
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
          minLength={12}
          autoComplete="new-password"
          id="password"
          name="password"
          type="password"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label
        className="grid gap-1.5 text-sm font-medium"
        htmlFor="passwordConfirmation"
      >
        Confirmar senha
        <input
          required
          minLength={12}
          autoComplete="new-password"
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <output className="text-sm text-muted-foreground">{message}</output>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
