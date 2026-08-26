import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BasePageProps = {
  title: string;
  description: string;
  emptyMessage: string;
  actionLabel?: string;
};
export function BasePage({
  title,
  description,
  emptyMessage,
  actionLabel,
}: BasePageProps) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        {actionLabel ? <Button disabled>{actionLabel}</Button> : null}
      </section>
      <Card className="border">
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
          <div className="grid size-10 place-items-center rounded-[10px] bg-muted">
            <Inbox className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <p className="text-xs text-muted-foreground">
            Estrutura preparada para a próxima fase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
