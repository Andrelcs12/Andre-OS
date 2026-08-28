"use client";
import { Clock3, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  areaLabels,
  type Task,
  type TaskArea,
  taskAreas,
} from "@/features/tasks/types/task.types";
import {
  getActiveTimeEntry,
  listTimeEntries,
  startTimeEntry,
  stopTimeEntry,
} from "../services/time-tracking.service";
import type {
  StartTimeEntryInput,
  TimeEntry,
} from "../types/time-tracking.types";
import { elapsedMinutes, formatDuration } from "../utils/time-tracking.utils";
export function TimeTrackingPanel({
  initialActive,
  initialEntries,
  tasks,
}: {
  initialActive: TimeEntry | null;
  initialEntries: TimeEntry[];
  tasks: Task[];
}) {
  const [active, setActive] = useState(initialActive);
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    const [nextActive, nextEntries] = await Promise.all([
      getActiveTimeEntry(),
      listTimeEntries(),
    ]);
    setActive(nextActive);
    setEntries(nextEntries);
  };
  const start = async (input: StartTimeEntryInput) => {
    setPending(true);
    setError(null);
    try {
      setActive(await startTimeEntry(input));
      setForm(false);
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível iniciar a sessão.",
      );
    } finally {
      setPending(false);
    }
  };
  const stop = async () => {
    if (!active) return;
    setPending(true);
    setError(null);
    try {
      await stopTimeEntry(active.id);
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível encerrar a sessão.",
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="size-4 text-primary" />
          Tempo agora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {active ? (
          <ActiveEntry
            entry={active}
            pending={pending}
            onStop={() => void stop()}
          />
        ) : form ? (
          <StartForm
            tasks={tasks}
            pending={pending}
            onCancel={() => setForm(false)}
            onStart={start}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Nenhuma sessão ativa.
            </p>
            <Button size="sm" onClick={() => setForm(true)}>
              <Play />
              Iniciar sessão
            </Button>
          </div>
        )}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <RecentEntries
          entries={entries.filter((entry) => entry.endedAt).slice(0, 5)}
        />
      </CardContent>
    </Card>
  );
}
function ActiveEntry({
  entry,
  pending,
  onStop,
}: {
  entry: TimeEntry;
  pending: boolean;
  onStop: () => void;
}) {
  const [minutes, setMinutes] = useState(() => elapsedMinutes(entry.startedAt));
  useEffect(() => {
    setMinutes(elapsedMinutes(entry.startedAt));
    const interval = window.setInterval(
      () => setMinutes(elapsedMinutes(entry.startedAt)),
      1_000,
    );
    return () => window.clearInterval(interval);
  }, [entry.startedAt]);
  const title = entry.task?.title || entry.description || "Sessão livre";
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{title}</p>
          {entry.area ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {areaLabels[entry.area]}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            Iniciado às{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(entry.startedAt))}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-semibold tabular-nums">
            {formatDuration(minutes)}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={pending}
            onClick={onStop}
          >
            <Square />
            {pending ? "Encerrando..." : "Encerrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
function StartForm({
  tasks,
  pending,
  onCancel,
  onStart,
}: {
  tasks: Task[];
  pending: boolean;
  onCancel: () => void;
  onStart: (input: StartTimeEntryInput) => Promise<void>;
}) {
  const submit = async (form: FormData) =>
    onStart({
      taskId: String(form.get("taskId")) || undefined,
      description: String(form.get("description")) || undefined,
      area: (String(form.get("area")) as TaskArea) || undefined,
    });
  return (
    <form action={submit} className="space-y-3 rounded-lg border p-3">
      <select
        name="taskId"
        aria-label="Task opcional"
        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="">Sem task</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </select>
      <input
        name="description"
        maxLength={500}
        placeholder="Descrição opcional"
        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
      />
      <select
        name="area"
        aria-label="Área opcional"
        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="">Sem área</option>
        {taskAreas.map((area) => (
          <option key={area} value={area}>
            {areaLabels[area]}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          <Play />
          {pending ? "Iniciando..." : "Iniciar"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
function RecentEntries({ entries }: { entries: TimeEntry[] }) {
  if (!entries.length) return null;
  return (
    <div className="border-t pt-4">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Sessões recentes
      </p>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate">
                {entry.task?.title || entry.description || "Sessão livre"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(entry.startedAt))}
              </p>
            </div>
            <span className="font-mono text-xs">
              {formatDuration(entry.durationMinutes ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
