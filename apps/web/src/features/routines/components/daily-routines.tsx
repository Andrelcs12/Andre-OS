"use client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setRoutineEntry } from "../services/routines.service";
import type { DailyRoutine } from "../types/routine.types";
export function DailyRoutines({
  initialRoutines,
  date,
}: {
  initialRoutines: DailyRoutine[];
  date: string;
}) {
  const [items, setItems] = useState(initialRoutines);
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toggle = async (r: DailyRoutine) => {
    setPendingId(r.id);
    setError(null);
    try {
      const entry = await setRoutineEntry(r.id, date, !r.completed);
      setItems((old) =>
        old.map((item) =>
          item.id === r.id
            ? {
                ...item,
                completed: entry.completed,
                completedAt: entry.completedAt,
              }
            : item,
        ),
      );
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível atualizar a rotina.",
      );
    } finally {
      setPendingId(null);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rotinas de hoje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length ? (
          items.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between border-b py-2 last:border-0"
            >
              <span
                className={
                  r.completed ? "text-muted-foreground line-through" : ""
                }
              >
                {r.title}
              </span>
              <Button
                size="icon-sm"
                variant={r.completed ? "secondary" : "outline"}
                aria-label={`Marcar ${r.title}`}
                disabled={pendingId === r.id}
                onClick={() => void toggle(r)}
              >
                <Check />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma rotina planejada para hoje.
          </p>
        )}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
