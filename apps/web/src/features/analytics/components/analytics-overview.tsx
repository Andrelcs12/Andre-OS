"use client";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListChecks,
  Repeat2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { areaLabels } from "@/features/tasks/types/task.types";
import { formatDuration } from "@/features/time-tracking/utils/time-tracking.utils";
import { getAnalytics } from "../services/analytics.service";
import type { AnalyticsOverview } from "../types/analytics.types";

const iso = (date: Date) => date.toISOString().slice(0, 10);
const week = (date: Date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: iso(start), to: iso(end) };
};
export function AnalyticsDashboard({
  initial,
}: {
  initial: AnalyticsOverview | null;
}) {
  const [anchor, setAnchor] = useState(new Date());
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = week(anchor);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAnalytics(current.from, current.to)
      .then((v) => active && setData(v))
      .catch(
        (e) =>
          active &&
          setError(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar os analytics.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [current.from, current.to]);
  const move = (value: number) =>
    setAnchor(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + value * 7),
    );
  const label =
    new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(
      new Date(`${current.from}T12:00:00`),
    ) +
    " – " +
    new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(
      new Date(`${current.to}T12:00:00`),
    );
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Analytics</h2>
          <p className="mt-2 text-muted-foreground">
            Veja como seu tempo e suas execuções estão evoluindo.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Semana anterior"
            onClick={() => move(-1)}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium">
            {label}
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Próxima semana"
            disabled={current.to >= iso(new Date())}
            onClick={() => move(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </section>
      {loading && !data ? (
        <div className="h-32 animate-pulse rounded-xl border bg-muted/30" />
      ) : null}
      {error ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}
      {data ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={ListChecks}
              label="Tarefas concluídas"
              value={String(data.summary.tasksCompleted)}
            />
            <Metric
              icon={Repeat2}
              label="Rotinas concluídas"
              value={`${data.summary.routineCompleted} / ${data.summary.routinePlanned}`}
            />
            <Metric
              icon={Repeat2}
              label="Consistência"
              value={
                data.summary.routineCompletionRate === null
                  ? "—"
                  : `${Math.round(data.summary.routineCompletionRate * 100)}%`
              }
            />
            <Metric
              icon={Clock3}
              label="Tempo registrado"
              value={formatDuration(data.summary.trackedMinutes)}
            />
          </section>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium">Atividade da semana</h3>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {data.daily.map((item) => {
                  const max = Math.max(
                    ...data.daily.map((d) => d.trackedMinutes),
                    1,
                  );
                  return (
                    <div key={item.date} className="min-w-0 text-center">
                      <div className="flex h-28 items-end">
                        <div
                          className="w-full rounded-t bg-primary/80"
                          style={{
                            height: `${Math.max(4, (item.trackedMinutes / max) * 100)}%`,
                          }}
                          title={formatDuration(item.trackedMinutes)}
                        />
                      </div>
                      <p className="mt-2 text-xs">
                        {new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
                          .format(new Date(`${item.date}T12:00:00`))
                          .slice(0, 3)}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {formatDuration(item.trackedMinutes)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium">Tempo por área</h3>
              {data.areas.length ? (
                <div className="mt-4 space-y-3">
                  {data.areas.map((item) => {
                    const max = Math.max(
                      ...data.areas.map((a) => a.trackedMinutes),
                      1,
                    );
                    return (
                      <div key={item.area}>
                        <div className="mb-1 flex justify-between gap-2 text-sm">
                          <span>{areaLabels[item.area]}</span>
                          <span className="font-mono text-muted-foreground">
                            {formatDuration(item.trackedMinutes)} ·{" "}
                            {item.tasksCompleted} tasks
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(item.trackedMinutes / max) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Ainda não há atividade registrada nesta semana.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className="size-4 text-primary" />
        <p className="mt-3 font-mono text-xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
