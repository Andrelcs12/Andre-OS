import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type DailyProgressProps = { completed: number; total: number };

export function DailyProgress({ completed, total }: DailyProgressProps) {
  const value = (completed / total) * 100;
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle>Seu dia</CardTitle>
        <CardDescription>Progresso das tarefas planejadas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold tracking-tight">
            {completed}{" "}
            <span className="text-base font-normal text-muted-foreground">
              de {total} concluídas
            </span>
          </p>
          <CheckCircle2 className="size-5 text-primary" />
        </div>
        <Progress
          value={value}
          aria-label={`${completed} de ${total} tarefas concluídas`}
        />
      </CardContent>
    </Card>
  );
}
