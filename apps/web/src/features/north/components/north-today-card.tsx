"use client";
import { Compass, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startTimeEntry } from "@/features/time-tracking/services/time-tracking.service";
import { updateItem } from "../services/north.service";
import type { NorthOverview } from "../types/north.types";
export function NorthTodayCard({ initial }: { initial: NorthOverview | null }) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const item = data?.currentItem;
  const complete = async () => {
    if (!item) return;
    try {
      await updateItem(item.id, { status: "COMPLETED" });
      setData((value) => (value ? { ...value, currentItem: null } : value));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível concluir o item.",
      );
    }
  };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Norte</CardTitle>
        <Compass className="size-5 text-primary" />
      </CardHeader>
      <CardContent>
        {data?.track ? (
          <>
            <p className="text-sm text-muted-foreground">{data.track.title}</p>
            {item ? (
              <div className="mt-3">
                <p className="font-medium">
                  {item.status === "IN_PROGRESS" ? "Agora: " : "Próximo: "}
                  {item.title}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void complete()}>
                    {item.status === "IN_PROGRESS"
                      ? "Concluir"
                      : "Iniciar e concluir"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void startTimeEntry({ northItemId: item.id }).catch(
                        (e: unknown) =>
                          setError(
                            e instanceof Error
                              ? e.message
                              : "Não foi possível iniciar foco.",
                          ),
                      )
                    }
                  >
                    <Play />
                    Iniciar foco
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Todos os itens foram concluídos.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Defina sua trilha principal de evolução.
          </p>
        )}
        <Link
          className="mt-4 inline-block text-sm font-medium text-primary"
          href="/north"
        >
          Ver Norte
        </Link>
        {error ? (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
