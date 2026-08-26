import { BasePage } from "@/components/app-shell/base-page";
export default function AnalyticsPage() {
  return (
    <BasePage
      title="Analytics"
      description="Visualize sinais da sua evolução diária, semanal e mensal."
      emptyMessage="Ainda não há dados para analisar."
    />
  );
}
