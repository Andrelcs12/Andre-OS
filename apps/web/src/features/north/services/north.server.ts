import { serverApiFetch } from "@/lib/api/server-api";
import type { NorthOverview } from "../types/north.types";
export async function getNorthOverview() {
  try {
    const response = await serverApiFetch("/north");
    return response.ok ? ((await response.json()) as NorthOverview) : null;
  } catch {
    return null;
  }
}
