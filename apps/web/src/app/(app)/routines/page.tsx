import { RoutineManager } from "@/features/routines/components/routine-manager";
import { getRoutines } from "@/features/routines/services/routines.server";
export default async function RoutinesPage() {
  return <RoutineManager initialRoutines={await getRoutines()} />;
}
