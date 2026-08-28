import { apiFetch } from "@/lib/api/api-client";
import type {
  NorthItem,
  NorthOverview,
  NorthStatus,
  NorthTrack,
} from "../types/north.types";

async function read<T>(response: Promise<Response>) {
  const resolved = await response;
  if (resolved.ok) return resolved.json() as Promise<T>;
  const body = (await resolved.json().catch(() => null)) as {
    message?: string;
  } | null;
  throw new Error(body?.message ?? "Não foi possível concluir esta ação.");
}
export const getNorth = () => read<NorthOverview>(apiFetch("/north"));
export const createTrack = (data: object) =>
  read<NorthTrack>(
    apiFetch("/north/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
export const updateTrack = (id: string, data: object) =>
  read<NorthTrack>(
    apiFetch(`/north/tracks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
export const createItem = (trackId: string, data: object) =>
  read<NorthItem>(
    apiFetch(`/north/tracks/${trackId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
export const updateItem = (
  id: string,
  data: {
    title?: string;
    description?: string | null;
    plannedMinutes?: number | null;
    scheduledDate?: string | null;
    position?: number;
    status?: NorthStatus;
  },
) =>
  read<NorthItem>(
    apiFetch(`/north/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
export const deleteItem = (id: string) =>
  read<void>(apiFetch(`/north/items/${id}`, { method: "DELETE" }));
