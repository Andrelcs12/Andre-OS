"use client";
import { CircleCheck, Clock3, Repeat2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { areaLabels } from "@/features/tasks/types/task.types";
import { formatDuration } from "@/features/time-tracking/utils/time-tracking.utils";
import { listHistory } from "../services/history.service";
import type { HistoryEvent, HistoryEventType } from "../types/history.types";

const filters: Array<{ label: string; type?: HistoryEventType }> = [
  { label: "Todos" },
  { label: "Tarefas", type: "TASK_COMPLETED" },
  { label: "Rotinas", type: "ROUTINE_COMPLETED" },
  { label: "Tempo", type: "TIME_ENTRY" },
];
export function HistoryList({
  initialEvents,
}: {
  initialEvents: HistoryEvent[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [active, setActive] = useState<HistoryEventType | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const grouped = useMemo(() => groupEvents(events), [events]);
  const change = async (type?: HistoryEventType) => {
    setActive(type);
    setLoading(true);
    setError(null);
    try {
      setEvents(await listHistory(type));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível carregar o histórico.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-3xl font-semibold tracking-tight">Histórico</h2>
        <p className="mt-2 text-muted-foreground">
          Veja o que você executou ao longo do tempo.
        </p>
      </section>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.label}
            size="sm"
            variant={active === filter.type ? "default" : "outline"}
            disabled={loading}
            onClick={() => void change(filter.type)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <div className="h-28 animate-pulse rounded-xl border bg-muted/30" />
      ) : null}
      {!loading && events.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">Seu histórico ainda está vazio.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Quando você concluir tarefas, rotinas ou sessões de tempo, elas
              aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section key={group.label}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.events.map((event) => (
                  <HistoryItem key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
function HistoryItem({ event }: { event: HistoryEvent }) {
  const Icon =
    event.type === "TASK_COMPLETED"
      ? CircleCheck
      : event.type === "ROUTINE_COMPLETED"
        ? Repeat2
        : Clock3;
  const verb =
    event.type === "TASK_COMPLETED"
      ? "Concluiu"
      : event.type === "ROUTINE_COMPLETED"
        ? "Concluiu rotina"
        : "Registrou tempo em";
  return (
    <Card className="border">
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {verb} “{event.title}”
          </p>
          {event.description && event.type === "TIME_ENTRY" ? (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {event.description}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {event.area ? <span>{areaLabels[event.area]}</span> : null}
            {event.metadata.durationMinutes !== undefined ? (
              <span className="font-mono">
                {formatDuration(event.metadata.durationMinutes)}
              </span>
            ) : null}
            <span>
              {new Intl.DateTimeFormat("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(event.occurredAt))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function groupEvents(events: HistoryEvent[]) {
  const today = new Date();
  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const startYesterday = startToday - 86_400_000;
  const groups = new Map<string, HistoryEvent[]>();
  for (const event of events) {
    const value = new Date(event.occurredAt);
    const day = new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
    ).getTime();
    const label =
      day === startToday
        ? "Hoje"
        : day === startYesterday
          ? "Ontem"
          : new Intl.DateTimeFormat("pt-BR", {
              day: "numeric",
              month: "long",
            }).format(value);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }
  return [...groups].map(([label, groupedEvents]) => ({
    label,
    events: groupedEvents,
  }));
}
