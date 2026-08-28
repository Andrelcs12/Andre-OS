"use client";

import {
  Archive,
  Check,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../services/tasks.service";
import {
  areaLabels,
  priorityLabels,
  statusLabels,
  type Task,
  type TaskArea,
  type TaskFilters,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
  taskAreas,
  taskPriorities,
  type UpdateTaskInput,
} from "../types/task.types";

const statusTabs: Array<{ label: string; status?: TaskStatus }> = [
  { label: "Todas" },
  { label: "Pendentes", status: "PENDING" },
  { label: "Em andamento", status: "IN_PROGRESS" },
  { label: "Concluídas", status: "COMPLETED" },
];
const emptyInput: TaskInput = {
  title: "",
  area: "ENGINEERING",
  priority: "MEDIUM",
};
const dateValue = (value: string | null) => (value ? value.slice(0, 10) : "");

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filters, setFilters] = useState<Partial<TaskFilters>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const reload = async (nextFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      setTasks(await listTasks(nextFilters));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível carregar as tarefas.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const changeFilters = (next: Partial<TaskFilters>) => {
    setFilters(next);
    void reload(next);
  };
  const save = async (input: TaskInput | UpdateTaskInput) => {
    const saved = editingTask
      ? await updateTask(editingTask.id, input)
      : await createTask(input as TaskInput);
    setTasks((current) =>
      editingTask
        ? current.map((task) => (task.id === saved.id ? saved : task))
        : [saved, ...current],
    );
    setFormOpen(false);
    setEditingTask(null);
  };
  const setStatus = async (task: Task, status: TaskStatus) => {
    try {
      const updated = await updateTask(task.id, { status });
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível atualizar a tarefa.",
      );
    }
  };
  const remove = async (task: Task) => {
    if (
      !window.confirm(
        `Excluir permanentemente “${task.title}”? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível excluir a tarefa.",
      );
    }
  };
  const visibleTasks = useMemo(() => tasks, [tasks]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Tarefas</h2>
          <p className="mt-2 text-muted-foreground">
            Organize o que precisa ser executado.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          Nova tarefa
        </Button>
      </section>
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.label}
              size="sm"
              variant={filters.status === tab.status ? "default" : "outline"}
              onClick={() => changeFilters({ ...filters, status: tab.status })}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="flex h-8 items-center gap-2 rounded-lg border border-input bg-background px-2 text-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              aria-label="Buscar tarefas"
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder="Buscar"
              value={filters.search ?? ""}
              onChange={(event) =>
                changeFilters({ ...filters, search: event.target.value })
              }
            />
          </label>
          <select
            aria-label="Filtrar por área"
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            value={filters.area ?? ""}
            onChange={(event) =>
              changeFilters({
                ...filters,
                area: (event.target.value as TaskArea) || undefined,
              })
            }
          >
            <option value="">Todas as áreas</option>
            {taskAreas.map((area) => (
              <option key={area} value={area}>
                {areaLabels[area]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por prioridade"
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            value={filters.priority ?? ""}
            onChange={(event) =>
              changeFilters({
                ...filters,
                priority: (event.target.value as TaskPriority) || undefined,
              })
            }
          >
            <option value="">Todas as prioridades</option>
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>
      </section>
      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
          <Button size="sm" variant="outline" onClick={() => void reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : null}
      {isLoading ? (
        <TaskListSkeleton />
      ) : visibleTasks.length ? (
        <div className="space-y-2">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={() => {
                setEditingTask(task);
                setFormOpen(true);
              }}
              onStatus={setStatus}
              onDelete={remove}
            />
          ))}
        </div>
      ) : (
        <Card className="border">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <p className="font-medium">Nenhuma tarefa ainda.</p>
            <p className="text-sm text-muted-foreground">
              Crie a primeira tarefa para começar a organizar seu dia.
            </p>
            <Button
              onClick={() => {
                setEditingTask(null);
                setFormOpen(true);
              }}
            >
              Criar tarefa
            </Button>
          </CardContent>
        </Card>
      )}
      <TaskForm
        open={formOpen}
        task={editingTask}
        onOpenChange={setFormOpen}
        onSave={save}
      />
    </div>
  );
}

function TaskItem({
  task,
  onEdit,
  onStatus,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onStatus: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}) {
  const statusVariant =
    task.status === "IN_PROGRESS"
      ? "default"
      : task.status === "COMPLETED"
        ? "secondary"
        : "outline";
  return (
    <Card className="border">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{task.title}</p>
            <Badge variant={statusVariant}>{statusLabels[task.status]}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{areaLabels[task.area]}</span>
            <span>Prioridade {priorityLabels[task.priority]}</span>
            {task.dueDate ? (
              <span>
                Prazo:{" "}
                {new Intl.DateTimeFormat("pt-BR").format(
                  new Date(task.dueDate),
                )}
              </span>
            ) : null}
            {task.estimatedMinutes ? (
              <span>{task.estimatedMinutes} min</span>
            ) : null}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Ações para ${task.title}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {task.status === "PENDING" ? (
              <DropdownMenuItem
                onClick={() => void onStatus(task, "IN_PROGRESS")}
              >
                <Play />
                Iniciar
              </DropdownMenuItem>
            ) : null}
            {task.status !== "COMPLETED" && task.status !== "ARCHIVED" ? (
              <DropdownMenuItem
                onClick={() => void onStatus(task, "COMPLETED")}
              >
                <Check />
                Concluir
              </DropdownMenuItem>
            ) : null}
            {task.status === "IN_PROGRESS" ? (
              <DropdownMenuItem onClick={() => void onStatus(task, "PENDING")}>
                <RotateCcw />
                Voltar para pendente
              </DropdownMenuItem>
            ) : null}
            {task.status === "COMPLETED" ? (
              <DropdownMenuItem onClick={() => void onStatus(task, "PENDING")}>
                <RotateCcw />
                Reabrir
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            {task.status !== "ARCHIVED" ? (
              <DropdownMenuItem onClick={() => void onStatus(task, "ARCHIVED")}>
                <Archive />
                Arquivar
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void onDelete(task)}
            >
              <Trash2 />
              Excluir permanentemente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

function TaskForm({
  open,
  task,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: TaskInput | UpdateTaskInput) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (form: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const input: TaskInput | UpdateTaskInput = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        area: String(form.get("area")) as TaskArea,
        priority: String(form.get("priority")) as TaskPriority,
        ...(form.get("estimatedMinutes")
          ? { estimatedMinutes: Number(form.get("estimatedMinutes")) }
          : task
            ? { estimatedMinutes: null }
            : {}),
        ...(form.get("dueDate")
          ? { dueDate: String(form.get("dueDate")) }
          : task
            ? { dueDate: null }
            : {}),
      };
      await onSave(input);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar a tarefa.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{task ? "Editar tarefa" : "Nova tarefa"}</SheetTitle>
          <SheetDescription>
            Os campos marcados com * são obrigatórios.
          </SheetDescription>
        </SheetHeader>
        <form
          key={task?.id ?? "new"}
          action={submit}
          className="space-y-4 p-4 pt-0"
        >
          <Field label="Título *">
            <input
              required
              name="title"
              maxLength={120}
              defaultValue={task?.title ?? emptyInput.title}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            />
          </Field>
          <Field label="Descrição">
            <textarea
              name="description"
              maxLength={2000}
              defaultValue={task?.description ?? ""}
              className="min-h-24 w-full rounded-lg border border-input bg-background p-3"
            />
          </Field>
          <Field label="Área *">
            <select
              name="area"
              defaultValue={task?.area ?? emptyInput.area}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            >
              {taskAreas.map((area) => (
                <option key={area} value={area}>
                  {areaLabels[area]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select
              name="priority"
              defaultValue={task?.priority ?? emptyInput.priority}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            >
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estimativa (minutos)">
            <input
              name="estimatedMinutes"
              type="number"
              min="1"
              max="10080"
              defaultValue={task?.estimatedMinutes ?? ""}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            />
          </Field>
          <Field label="Prazo">
            <input
              name="dueDate"
              type="date"
              defaultValue={dateValue(task?.dueDate ?? null)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar tarefa"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </div>
  );
}
function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-lg border bg-muted/30"
        />
      ))}
    </div>
  );
}
