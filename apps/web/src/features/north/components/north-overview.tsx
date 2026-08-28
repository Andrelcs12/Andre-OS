"use client";
import { Compass, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startTimeEntry } from "@/features/time-tracking/services/time-tracking.service";
import { formatDuration } from "@/features/time-tracking/utils/time-tracking.utils";
import {
  createItem,
  createTrack,
  deleteItem,
  getNorth,
  updateItem,
} from "../services/north.service";
import type { NorthItem, NorthOverview } from "../types/north.types";

export function NorthOverviewPanel({
  initial,
}: {
  initial: NorthOverview | null;
}) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const refresh = async () => setData(await getNorth());
  const action = async (fn: () => Promise<unknown>) => {
    setPending(true);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível atualizar o Norte.",
      );
    } finally {
      setPending(false);
    }
  };
  if (!data)
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Carregando Norte...
        </CardContent>
      </Card>
    );
  if (!data.track)
    return (
      <TrackForm
        pending={pending}
        error={error}
        onCreate={(title) => action(() => createTrack({ title }))}
      />
    );
  const completed = data.items.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const track = data.track;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="size-5 text-primary" />
            {data.track.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.track.description || "Sua trilha principal de evolução."}
          </p>
          <p className="mt-3 font-mono text-sm">
            {completed} / {data.items.length} concluídos
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Sequência</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              const title = window.prompt("Título do item");
              if (title) void action(() => createItem(track.id, { title }));
            }}
            disabled={pending}
          >
            <Plus />
            Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.items.length ? (
            data.items.map((item) => (
              <Item
                key={item.id}
                item={item}
                pending={pending}
                onAction={action}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Adicione o primeiro item da sua sequência.
            </p>
          )}
        </CardContent>
      </Card>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
function TrackForm({
  pending,
  error,
  onCreate,
}: {
  pending: boolean;
  error: string | null;
  onCreate: (title: string) => void;
}) {
  return (
    <Card>
      <CardContent className="py-8">
        <Compass className="mb-3 size-6 text-primary" />
        <h2 className="text-lg font-semibold">Nenhum Norte definido.</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina a trilha principal que você quer executar agora.
        </p>
        <form
          className="mt-4 flex max-w-md gap-2"
          action={(form) => onCreate(String(form.get("title")))}
        >
          <input
            required
            name="title"
            maxLength={120}
            placeholder="Ex.: Arquitetura de sistemas"
            className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
          />
          <Button disabled={pending}>
            <Plus />
            Criar Norte
          </Button>
        </form>
        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
function Item({
  item,
  pending,
  onAction,
}: {
  item: NorthItem;
  pending: boolean;
  onAction: (fn: () => Promise<unknown>) => void;
}) {
  const next =
    item.status === "TODO"
      ? "IN_PROGRESS"
      : item.status === "IN_PROGRESS"
        ? "COMPLETED"
        : "TODO";
  const label =
    item.status === "TODO"
      ? "Iniciar"
      : item.status === "IN_PROGRESS"
        ? "Concluir"
        : "Reabrir";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div>
        <p className="font-medium">
          {item.position}. {item.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.plannedMinutes
            ? `${item.plannedMinutes} min planejados · `
            : ""}
          {formatDuration(item.trackedMinutes)} registrados · {item.status}
        </p>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            void onAction(() => updateItem(item.id, { status: next }))
          }
        >
          {next === "TODO" ? <RotateCcw /> : <Play />}
          {label}
        </Button>
        {item.status !== "COMPLETED" ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            aria-label={`Iniciar foco em ${item.title}`}
            onClick={() =>
              void onAction(() => startTimeEntry({ northItemId: item.id }))
            }
          >
            Foco
          </Button>
        ) : null}
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Excluir ${item.title}`}
          disabled={pending}
          onClick={() => void onAction(() => deleteItem(item.id))}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
