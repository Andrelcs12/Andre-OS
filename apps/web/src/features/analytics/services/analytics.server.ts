import { serverApiFetch } from "@/lib/api/server-api";
import type { AnalyticsOverview } from "../types/analytics.types";

export async function getAnalyticsOverview(from: string, to: string) {
  try {
    const response = await serverApiFetch(
      `/analytics/overview?from=${from}&to=${to}`,
    );
    return response.ok ? ((await response.json()) as AnalyticsOverview) : null;
  } catch {
    return null;
  }
}
