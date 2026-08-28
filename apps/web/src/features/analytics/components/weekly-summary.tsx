import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/features/time-tracking/utils/time-tracking.utils";
import type { AnalyticsOverview } from "../types/analytics.types";
export function WeeklySummary({ data }: { data: AnalyticsOverview | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Esta semana</CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <p>
              Tarefas
              <br />
              <b>{data.summary.tasksCompleted} concluídas</b>
            </p>
            <p>
              Rotinas
              <br />
              <b>
                {data.summary.routineCompleted} / {data.summary.routinePlanned}
              </b>
            </p>
            <p>
              Tempo
              <br />
              <b>{formatDuration(data.summary.trackedMinutes)}</b>
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Resumo indisponível.</p>
        )}
        <Link
          href="/analytics"
          className="mt-4 inline-block text-sm font-medium text-primary"
        >
          Ver analytics
        </Link>
      </CardContent>
    </Card>
  );
}
