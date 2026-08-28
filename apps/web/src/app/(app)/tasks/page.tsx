import { TaskManager } from "@/features/tasks/components/task-manager";
import { getTasks } from "@/features/tasks/services/tasks.server";

export default async function TasksPage() {
  return <TaskManager initialTasks={await getTasks()} />;
}
