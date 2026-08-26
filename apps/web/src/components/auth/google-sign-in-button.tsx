"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-1.99 3.02v2.53h3.23c1.89-1.74 2.98-4.3 2.98-7.39Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.38l-3.23-2.53c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.61A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.93a6 6 0 0 1 0-3.86V7.46H3.07a10 10 0 0 0 0 9.08l3.34-2.61Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.95 2.95 14.7 2 12 2a10 10 0 0 0-8.93 5.46l3.34 2.61C7.2 7.71 9.4 5.95 12 5.95Z"
      />
    </svg>
  );
}

export function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  async function handleSignIn() {
    setError(null);
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError)
        setError(
          "Não foi possível iniciar o login com Google. Tente novamente.",
        );
    } catch {
      setError("Supabase ainda não está configurado neste ambiente.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="w-full"
        size="lg"
        onClick={handleSignIn}
        disabled={isLoading}
      >
        <GoogleMark />
        {isLoading ? "Redirecionando…" : "Continuar com Google"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
