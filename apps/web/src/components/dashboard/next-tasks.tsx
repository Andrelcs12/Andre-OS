import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NextTasks({
  tasks,
}: {
  tasks: Array<{ id: string; title: string }>;
}) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle>Próximas tarefas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between border-b py-3 text-sm last:border-b-0"
          >
            <span>{task.title}</span>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
