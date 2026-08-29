import { cache } from "react";
import { serverApiFetch } from "@/lib/api/server-api";
import type { AuthenticatedProfile } from "@/types/auth";

export const getCurrentProfile = cache(
  async (): Promise<AuthenticatedProfile | null> => {
    try {
      const response = await serverApiFetch("/auth/me");
      if (!response.ok) return null;
      return (await response.json()) as AuthenticatedProfile;
    } catch {
      return null;
    }
  },
);
