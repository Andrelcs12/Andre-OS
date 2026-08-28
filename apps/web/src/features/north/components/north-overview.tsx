"use client";
import { Compass, Pencil, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
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
  updateTrack,
} from "../services/north.service";
import type {
  NorthItem,
  NorthOverview,
  NorthTrack,
} from "../types/north.types";

type Action = () => Promise<unknown>;
export function NorthOverviewPanel({
  initial,
}: {
  initial: NorthOverview | null;
}) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [trackEdit, setTrackEdit] = useState(false);
  const [itemEdit, setItemEdit] = useState<NorthItem | null>(null);
  const [itemCreate, setItemCreate] = useState(false);
  const action = async (fn: Action) => {
    setPending(true);
    setError(null);
    try {
      await fn();
      setData(await getNorth());
      setTrackEdit(false);
      setItemEdit(null);
      setItemCreate(false);
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
        onSubmit={(value) => action(() => createTrack(value))}
      />
    );
  const track = data.track;
  const completed = data.items.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Compass className="size-5 text-primary" />
            {track.title}
          </CardTitle>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Editar Norte"
            onClick={() => setTrackEdit(true)}
          >
            <Pencil />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {track.description || "Sua trilha principal de evolução."}
          </p>
          <p className="mt-3 font-mono text-sm">
            {completed} / {data.items.length} concluídos
          </p>
          {trackEdit ? (
            <TrackForm
              initial={track}
              pending={pending}
              error={error}
              onCancel={() => setTrackEdit(false)}
              onSubmit={(value) => action(() => updateTrack(track.id, value))}
            />
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Sequência</CardTitle>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => setItemCreate(true)}
          >
            <Plus />
            Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {itemCreate ? (
            <ItemForm
              pending={pending}
              error={error}
              onCancel={() => setItemCreate(false)}
              onSubmit={(value) => action(() => createItem(track.id, value))}
            />
          ) : null}
          {data.items.length ? (
            data.items.map((item) =>
              itemEdit?.id === item.id ? (
                <ItemForm
                  key={item.id}
                  initial={item}
                  pending={pending}
                  error={error}
                  onCancel={() => setItemEdit(null)}
                  onSubmit={(value) => action(() => updateItem(item.id, value))}
                />
              ) : (
                <Item
                  key={item.id}
                  item={item}
                  pending={pending}
                  onEdit={() => setItemEdit(item)}
                  onAction={action}
                />
              ),
            )
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
  initial,
  pending,
  error,
  onCancel,
  onSubmit,
}: {
  initial?: NorthTrack;
  pending: boolean;
  error: string | null;
  onCancel?: () => void;
  onSubmit: (value: object) => void;
}) {
  return (
    <form
      className="mt-4 grid max-w-xl gap-3 rounded-lg border p-3"
      action={(form) =>
        onSubmit({
          title: String(form.get("title")),
          description: String(form.get("description")) || undefined,
          targetDate: String(form.get("targetDate")) || undefined,
        })
      }
    >
      <input
        required
        name="title"
        defaultValue={initial?.title}
        maxLength={120}
        placeholder="Título do Norte"
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <textarea
        name="description"
        defaultValue={initial?.description ?? ""}
        maxLength={2000}
        placeholder="Descrição opcional"
        className="min-h-20 rounded-md border bg-background p-3 text-sm"
      />
      <input
        name="targetDate"
        type="date"
        defaultValue={initial?.targetDate?.slice(0, 10)}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <div className="flex gap-2">
        <Button disabled={pending}>
          {pending ? "Salvando..." : initial ? "Salvar" : "Criar Norte"}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
function ItemForm({
  initial,
  pending,
  error,
  onCancel,
  onSubmit,
}: {
  initial?: NorthItem;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (value: object) => void;
}) {
  return (
    <form
      className="grid gap-2 rounded-lg border bg-muted/20 p-3"
      action={(form) =>
        onSubmit({
          title: String(form.get("title")),
          description: String(form.get("description")) || undefined,
          plannedMinutes: form.get("plannedMinutes")
            ? Number(form.get("plannedMinutes"))
            : undefined,
          scheduledDate: String(form.get("scheduledDate")) || undefined,
        })
      }
    >
      <input
        required
        name="title"
        defaultValue={initial?.title}
        maxLength={160}
        placeholder="Título do item"
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <textarea
        name="description"
        defaultValue={initial?.description ?? ""}
        maxLength={2000}
        placeholder="Descrição opcional"
        className="min-h-16 rounded-md border bg-background p-3 text-sm"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="plannedMinutes"
          type="number"
          min="1"
          defaultValue={initial?.plannedMinutes ?? ""}
          placeholder="Tempo planejado (min)"
          className="h-9 rounded-md border bg-background px-3 text-sm"
        />
        <input
          name="scheduledDate"
          type="date"
          defaultValue={initial?.scheduledDate?.slice(0, 10)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={pending}>
          {pending ? "Salvando..." : initial ? "Salvar" : "Adicionar"}
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
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
function Item({
  item,
  pending,
  onEdit,
  onAction,
}: {
  item: NorthItem;
  pending: boolean;
  onEdit: () => void;
  onAction: (fn: Action) => void;
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
          aria-label={`Editar ${item.title}`}
          disabled={pending}
          onClick={onEdit}
        >
          <Pencil />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Excluir ${item.title}`}
          disabled={pending}
          onClick={() => {
            if (window.confirm(`Excluir “${item.title}”?`))
              void onAction(() => deleteItem(item.id));
          }}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
