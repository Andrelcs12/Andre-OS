import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CheckSquare,
  History,
  House,
  Link2,
  Repeat2,
} from "lucide-react";

export type NavigationItem = { href: string; label: string; icon: LucideIcon };

export const navigationItems: NavigationItem[] = [
  { href: "/today", label: "Hoje", icon: House },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/routines", label: "Rotinas", icon: Repeat2 },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];
