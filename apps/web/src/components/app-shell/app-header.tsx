"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navigationItems } from "@/lib/constants/navigation";
import type { AuthenticatedProfile } from "@/types/auth";

function formatDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function AppHeader({ profile }: { profile: AuthenticatedProfile }) {
  const pathname = usePathname();
  const [date, setDate] = useState("");
  const title =
    navigationItems.find((item) => item.href === pathname)?.label ?? "ANDRÉ OS";
  useEffect(() => setDate(formatDate()), []);
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <AppSidebar profile={profile} />
        <div>
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          <p className="hidden text-xs capitalize text-muted-foreground sm:block">
            {date}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar className="size-8">
          <AvatarImage
            src={profile.avatarUrl ?? undefined}
            alt={profile.displayName}
          />
          <AvatarFallback className="bg-secondary text-xs font-semibold">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
