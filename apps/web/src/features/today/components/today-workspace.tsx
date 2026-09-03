"use client";
import { Check, CirclePlay, Compass, Pause, Play, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateItem } from "@/features/north/services/north.service";
import type { NorthOverview } from "@/features/north/types/north.types";
import { setRoutineEntry } from "@/features/routines/services/routines.service";
import type { DailyRoutine } from "@/features/routines/types/routine.types";
import { updateTask } from "@/features/tasks/services/tasks.service";
import { areaLabels, type Task } from "@/features/tasks/types/task.types";
import {
  startTimeEntry,
  stopTimeEntry,
} from "@/features/time-tracking/services/time-tracking.service";
import type { TimeEntry } from "@/features/time-tracking/types/time-tracking.types";

const elapsed = (at: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(at).getTime()) / 1000));
const format = (s: number) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
const hello = () =>
  new Date().getHours() < 12
    ? "Bom dia"
    : new Date().getHours() < 18
      ? "Boa tarde"
      : "Boa noite";

export function TodayWorkspace({
  name,
  date,
  tasks: initialTasks,
  north,
  routines: initialRoutines,
  active: initialActive,
  errors,
}: {
  name: string;
  date: string;
  tasks: Task[];
  north: NorthOverview | null;
  routines: DailyRoutine[];
  active: TimeEntry | null;
  errors: Record<string, boolean>;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [routines, setRoutines] = useState(initialRoutines);
  const [active, setActive] = useState(initialActive);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const start = async (input: { taskId?: string; northItemId?: string }) => {
    setPending(true);
    setMessage(null);
    try {
      setActive(await startTimeEntry(input));
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Não foi possível iniciar a tarefa.",
      );
    } finally {
      setPending(false);
    }
  };
  const finish = async () => {
    if (!active) return;
    setPending(true);
    try {
      await stopTimeEntry(active.id);
      if (active.taskId) {
        await updateTask(active.taskId, { status: "COMPLETED" });
        setTasks((all) => all.filter((item) => item.id !== active.taskId));
      }
      if (active.northItemId)
        await updateItem(active.northItemId, { status: "COMPLETED" });
      setActive(null);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      setPending(false);
    }
  };
  const stop = async () => {
    if (!active) return;
    setPending(true);
    try {
      await stopTimeEntry(active.id);
      setActive(null);
      router.refresh();
    } catch {
      setMessage("Não foi possível parar a sessão.");
    } finally {
      setPending(false);
    }
  };
  const toggleRoutine = async (routine: DailyRoutine) => {
    const completed = !routine.completed;
    setRoutines((all) =>
      all.map((item) =>
        item.id === routine.id ? { ...item, completed } : item,
      ),
    );
    try {
      const entry = await setRoutineEntry(routine.id, date, completed);
      setRoutines((all) =>
        all.map((item) =>
          item.id === routine.id
            ? {
                ...item,
                completed: entry.completed,
                completedAt: entry.completedAt,
              }
            : item,
        ),
      );
    } catch {
      setRoutines((all) =>
        all.map((item) =>
          item.id === routine.id
            ? { ...item, completed: routine.completed }
            : item,
        ),
      );
      setMessage("Não foi possível atualizar a rotina.");
    }
  };
  const next = north?.currentItem;
  const completeNorth =
    north?.items.filter((item) => item.status === "COMPLETED").length ?? 0;
  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {hello()}, {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/tasks">
            <Plus /> Capturar
          </Link>
        </Button>
      </header>
      <Now
        active={active}
        error={errors.active}
        pending={pending}
        choose={() =>
          document
            .getElementById("today-list")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        finish={() => void finish()}
        stop={() => void stop()}
      />
      {message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {message}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <North
          north={north}
          error={errors.north}
          complete={completeNorth}
          next={next?.title}
          pending={pending}
          start={() => next && void start({ northItemId: next.id })}
        />
        <Tasks
          tasks={tasks}
          error={errors.tasks}
          pending={pending}
          start={(task) => void start({ taskId: task.id })}
          complete={async (task) => {
            setTasks((all) => all.filter((item) => item.id !== task.id));
            try {
              await updateTask(task.id, { status: "COMPLETED" });
              router.refresh();
            } catch {
              setTasks((all) => [...all, task]);
              setMessage("Não foi possível concluir a tarefa.");
            }
          }}
        />
      </div>
      <Routines
        routines={routines}
        error={errors.routines}
        toggle={toggleRoutine}
      />
    </div>
  );
}
function Now({
  active,
  error,
  pending,
  choose,
  finish,
  stop,
}: {
  active: TimeEntry | null;
  error: boolean;
  pending: boolean;
  choose: () => void;
  finish: () => void;
  stop: () => void;
}) {
  const [seconds, setSeconds] = useState(
    active ? elapsed(active.startedAt) : 0,
  );
  useEffect(() => {
    if (!active) return;
    setSeconds(elapsed(active.startedAt));
    const interval = window.setInterval(
      () => setSeconds(elapsed(active.startedAt)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [active]);
  return (
    <Card className="border-primary/30 bg-primary-subtle/30">
      <CardContent className="p-5">
        <p className="text-xs font-semibold tracking-[.16em] text-primary uppercase">
          Agora
        </p>
        {error ? (
          <ErrorBlock label="sessão atual" />
        ) : active ? (
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">
                {active.task?.title ??
                  active.northItem?.title ??
                  active.description ??
                  "Sessão em foco"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {active.northItem ? "Norte atual" : "Tarefa em execução"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-semibold tabular-nums">
                {format(seconds)}
              </span>
              <Button size="sm" disabled={pending} onClick={finish}>
                <Check /> Concluir
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={stop}
              >
                <Pause /> Parar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Nenhuma tarefa em execução.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha uma tarefa de Hoje ou do Norte.
              </p>
            </div>
            <Button size="sm" onClick={choose}>
              <CirclePlay /> Escolher tarefa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function North({
  north,
  error,
  complete,
  next,
  pending,
  start,
}: {
  north: NorthOverview | null;
  error: boolean;
  complete: number;
  next?: string;
  pending: boolean;
  start: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Compass className="size-4 text-primary" /> NORTE DA SEMANA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBlock label="Norte" />
        ) : north?.track ? (
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{north.track.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {north.track.description || "Sua prioridade principal atual."}
              </p>
            </div>
            <p className="text-sm">
              {complete} / {north.items.length} itens concluídos
            </p>
            {next ? (
              <p className="text-sm text-muted-foreground">
                Próximo: <span className="text-foreground">{next}</span>
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/north">Abrir Norte</Link>
              </Button>
              {next ? (
                <Button size="sm" disabled={pending} onClick={start}>
                  <Play /> Começar
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium">Nenhum Norte ativo.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Defina uma prioridade maior para este período.
            </p>
            <Button asChild className="mt-3" size="sm">
              <Link href="/north">Criar Norte</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function Tasks({
  tasks,
  error,
  pending,
  start,
  complete,
}: {
  tasks: Task[];
  error: boolean;
  pending: boolean;
  start: (task: Task) => void;
  complete: (task: Task) => void;
}) {
  return (
    <Card id="today-list">
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm">HOJE</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link href="/tasks">Planejar</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBlock label="tarefas de hoje" />
        ) : tasks.length ? (
          <div className="space-y-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded-lg px-1 py-2 hover:bg-muted/60"
              >
                <button
                  type="button"
                  aria-label={`Concluir ${task.title}`}
                  className="grid size-5 shrink-0 place-items-center rounded-full border hover:border-primary"
                  onClick={() => complete(task)}
                >
                  <Check className="size-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {areaLabels[task.area]}
                    {task.estimatedMinutes
                      ? ` · ${task.estimatedMinutes} min`
                      : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => start(task)}
                >
                  <Play /> Começar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="font-medium">
              Você ainda não planejou nada para hoje.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha poucas tarefas que representam um compromisso real.
            </p>
            <Button asChild className="mt-3" size="sm">
              <Link href="/tasks">Escolher tarefas</Link>
            </Button>
          </div>
        )}
        {tasks.length > 8 ? (
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
            Você colocou {tasks.length} tarefas para hoje. Talvez isso não seja
            um plano realista.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
function Routines({
  routines,
  error,
  toggle,
}: {
  routines: DailyRoutine[];
  error: boolean;
  toggle: (routine: DailyRoutine) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">ROTINAS</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorBlock label="rotinas" />
        ) : routines.length ? (
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {routines.map((routine) => (
              <label
                key={routine.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={routine.completed}
                  onChange={() => void toggle(routine)}
                />
                <span
                  className={
                    routine.completed
                      ? "text-muted-foreground line-through"
                      : ""
                  }
                >
                  {routine.title}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma rotina planejada para hoje.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
function ErrorBlock({ label }: { label: string }) {
  return (
    <div className="text-sm">
      <p className="font-medium">Não foi possível carregar {label}.</p>
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => window.location.reload()}
      >
        Tentar novamente
      </Button>
    </div>
  );
}
