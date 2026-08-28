import { apiFetch } from "@/lib/api/api-client";
import type { AnalyticsOverview } from "../types/analytics.types";
export async function getAnalytics(from: string, to: string) {
  const response = await apiFetch(`/analytics/overview?from=${from}&to=${to}`);
  if (response.ok) return response.json() as Promise<AnalyticsOverview>;
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  throw new Error(
    payload?.message || "Não foi possível carregar os analytics.",
  );
}
