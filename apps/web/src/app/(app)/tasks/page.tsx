import { TaskManager } from "@/components/tasks/task-manager";
import { getTasks } from "@/services/tasks.server";

export default async function TasksPage() {
  return <TaskManager initialTasks={await getTasks()} />;
}
