export function formatDuration(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const remainder = safe % 60;
  return hours
    ? `${hours}h ${String(remainder).padStart(2, "0")}min`
    : `${remainder}min`;
}
export function elapsedMinutes(startedAt: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 60_000),
  );
}
