"use client";
import { Check } from "lucide-react";
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
  const toggle = async (r: DailyRoutine) => {
    const n = await setRoutineEntry(r.id, date, !r.completed);
    setItems((old) =>
      old.map((x) =>
        x.id === r.id
          ? { ...x, completed: n.completed, completedAt: n.completedAt }
          : x,
      ),
    );
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
      </CardContent>
    </Card>
  );
}
