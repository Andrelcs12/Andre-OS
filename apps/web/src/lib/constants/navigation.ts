import type { LucideIcon } from "lucide-react";
import { CheckSquare, Compass, House, MoreHorizontal } from "lucide-react";

export type NavigationItem = { href: string; label: string; icon: LucideIcon };

export const navigationItems: NavigationItem[] = [
  { href: "/today", label: "Hoje", icon: House },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/north", label: "Norte", icon: Compass },
  { href: "/review", label: "Revisão", icon: MoreHorizontal },
];
