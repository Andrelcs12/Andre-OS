import { NorthOverviewPanel } from "@/features/north/components/north-overview";
import { getNorthOverview } from "@/features/north/services/north.server";
export default async function NorthPage() {
  return <NorthOverviewPanel initial={await getNorthOverview()} />;
}
