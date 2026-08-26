import { Compass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NorthCardProps = { title: string; duration: string; status: string };

export function NorthCard({ title, duration, status }: NorthCardProps) {
  return (
    <Card className="border">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Norte</CardTitle>
        <Compass className="size-5 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{title}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-muted-foreground">
            {duration}
          </span>
          <Badge variant="secondary">{status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
