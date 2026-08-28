import { serverApiFetch } from "@/lib/api/server-api";
import type { Link } from "../types/link.types";
export async function getLinks() {
  try {
    const response = await serverApiFetch("/links");
    return response.ok ? ((await response.json()) as Link[]) : [];
  } catch {
    return [];
  }
}
