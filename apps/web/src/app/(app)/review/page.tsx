import { AnalyticsDashboard } from "@/features/analytics/components/analytics-overview";
import { HistoryList } from "@/features/history/components/history-list";
import { getHistory } from "@/features/history/services/history.server";

export default async function ReviewPage() {
  const events = await getHistory();
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Revisão</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evidências do que aconteceu — sem score de produtividade.
        </p>
      </section>
      <AnalyticsDashboard initial={null} />
      <section>
        <h2 className="text-lg font-semibold">Histórico</h2>
        <div className="mt-3">
          <HistoryList initialEvents={events} />
        </div>
      </section>
    </div>
  );
}
