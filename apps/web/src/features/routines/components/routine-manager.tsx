"use client";
import {
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
} from "../services/routines.service";
import {
  type Routine,
  type RoutineInput,
  type RoutineSchedule,
  routineAreaLabels,
  routineAreas,
} from "../types/routine.types";

const scheduleLabels: Record<RoutineSchedule, string> = {
  DAILY: "Todos os dias",
  WEEKDAYS: "Seg–Sex",
  CUSTOM: "Personalizado",
};
const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export function RoutineManager({
  initialRoutines,
}: {
  initialRoutines: Routine[];
}) {
  const [items, setItems] = useState(initialRoutines);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [open, setOpen] = useState(false);
  const save = async (input: RoutineInput) => {
    const saved = editing
      ? await updateRoutine(editing.id, input)
      : await createRoutine(input);
    setItems((old) =>
      editing
        ? old.map((i) => (i.id === saved.id ? saved : i))
        : [saved, ...old],
    );
    setOpen(false);
    setEditing(null);
  };
  const action = async (r: Routine, input: Partial<RoutineInput>) =>
    setItems((old) => old.map((i) => (i.id === r.id ? { ...i, ...input } : i)));
  const remove = async (r: Routine) => {
    if (!confirm(`Excluir permanentemente “${r.title}”?`)) return;
    await deleteRoutine(r.id);
    setItems((x) => x.filter((i) => i.id !== r.id));
  };
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Rotinas</h2>
          <p className="mt-2 text-muted-foreground">
            Crie ações recorrentes para não depender da memória.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus />
          Nova rotina
        </Button>
      </section>
      {items.length ? (
        <div className="space-y-2">
          {items.map((r) => (
            <Card
              key={r.id}
              id={`routine-${r.id}`}
              className={`${!r.isActive ? "opacity-60 " : ""}scroll-mt-20`}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scheduleLabels[r.schedule]}{" "}
                    {r.schedule === "CUSTOM"
                      ? r.daysOfWeek.map((d) => days[d]).join(", ")
                      : ""}
                    {r.area ? ` · ${routineAreaLabels[r.area]}` : ""} ·{" "}
                    {r.isActive ? "Ativa" : "Pausada"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Ações para ${r.title}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(r);
                        setOpen(true);
                      }}
                    >
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => void action(r, { isActive: !r.isActive })}
                    >
                      {r.isActive ? (
                        <>
                          <Pause />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => void remove(r)}
                    >
                      <Trash2 />
                      Excluir permanentemente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3">
            <p className="font-medium">Nenhuma rotina ainda.</p>
            <p className="text-sm text-muted-foreground">
              Crie uma ação recorrente para começar.
            </p>
            <Button onClick={() => setOpen(true)}>Criar rotina</Button>
          </CardContent>
        </Card>
      )}
      <RoutineForm
        open={open}
        routine={editing}
        close={() => setOpen(false)}
        save={save}
      />
    </div>
  );
}
function RoutineForm({
  open,
  routine,
  close,
  save,
}: {
  open: boolean;
  routine: Routine | null;
  close: () => void;
  save: (input: RoutineInput) => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{routine ? "Editar rotina" : "Nova rotina"}</SheetTitle>
        </SheetHeader>
        <form
          key={routine?.id ?? "new"}
          action={async (f) => {
            const schedule = f.get("schedule") as RoutineSchedule;
            await save({
              title: String(f.get("title")),
              description: String(f.get("description") || ""),
              area: (String(f.get("area")) ||
                undefined) as RoutineInput["area"],
              schedule,
              daysOfWeek:
                schedule === "CUSTOM"
                  ? [0, 1, 2, 3, 4, 5, 6].filter((d) => f.get(`d${d}`))
                  : [],
            });
          }}
          className="space-y-4 p-4"
        >
          <label className="grid gap-1 text-sm">
            Título *
            <input
              name="title"
              required
              defaultValue={routine?.title}
              className="h-9 rounded-lg border px-3"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Descrição
            <textarea
              name="description"
              defaultValue={routine?.description ?? ""}
              className="rounded-lg border p-3"
            />
          </label>
          <select
            name="area"
            defaultValue={routine?.area ?? ""}
            className="h-9 rounded-lg border px-3"
          >
            <option value="">Sem área</option>
            {routineAreas.map((a) => (
              <option key={a} value={a}>
                {routineAreaLabels[a]}
              </option>
            ))}
          </select>
          <select
            name="schedule"
            defaultValue={routine?.schedule ?? "DAILY"}
            className="h-9 rounded-lg border px-3"
          >
            <option value="DAILY">Todos os dias</option>
            <option value="WEEKDAYS">Dias úteis</option>
            <option value="CUSTOM">Personalizado</option>
          </select>
          <fieldset className="flex gap-2">
            {days.map((d, i) => (
              <label key={d} className="text-xs">
                <input
                  name={`d${i}`}
                  type="checkbox"
                  defaultChecked={routine?.daysOfWeek.includes(i)}
                />
                {d}
              </label>
            ))}
          </fieldset>
          <Button className="w-full">Salvar rotina</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
