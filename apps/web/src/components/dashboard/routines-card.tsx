import { Check, Circle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Routine = { label: string; completed: boolean };
export function RoutinesCard({ routines }: { routines: Routine[] }) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle>Rotinas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {routines.map((routine) => (
          <div key={routine.label} className="flex items-center gap-3 text-sm">
            {routine.completed ? (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            ) : (
              <Circle className="size-5 text-muted-foreground" />
            )}
            <span
              className={
                routine.completed ? "text-foreground" : "text-muted-foreground"
              }
            >
              {routine.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
