import { BasePage } from "@/components/app-shell/base-page";
export default function TasksPage() {
  return (
    <BasePage
      title="Tarefas"
      description="Organize o que precisa ser executado."
      actionLabel="+ Nova tarefa"
      emptyMessage="Nenhuma tarefa cadastrada."
    />
  );
}
