import { HistoryList } from "@/features/history/components/history-list";
import { getHistory } from "@/features/history/services/history.server";
export default async function HistoryPage() {
  return <HistoryList initialEvents={await getHistory()} />;
}
