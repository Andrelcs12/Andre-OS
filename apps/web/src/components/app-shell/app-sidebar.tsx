"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiFetch } from "@/lib/api/api-client";
import { navigationItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import type { AuthenticatedProfile } from "@/types/auth";

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1" aria-label="Navegação principal">
      {navigationItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary-subtle text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-5" strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ profile }: { profile: AuthenticatedProfile }) {
  const router = useRouter();
  return (
    <div className="mt-auto border-t p-3">
      <div className="flex items-center gap-3 px-1">
        <Avatar className="size-8">
          <AvatarImage
            src={profile.avatarUrl ?? undefined}
            alt={profile.displayName}
          />
          <AvatarFallback className="bg-primary-subtle text-xs font-semibold text-primary">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{profile.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">Conta Google</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Sair"
              onClick={async () => {
                await apiFetch("/auth/logout", { method: "POST" });
                router.replace("/login");
                router.refresh();
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sair</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function SidebarContent({
  onNavigate,
  profile,
}: {
  onNavigate?: () => void;
  profile: AuthenticatedProfile;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <BrandLogo />
      </div>
      <Separator />
      <div className="flex-1 p-3">
        <Navigation onNavigate={onNavigate} />
      </div>
      <UserMenu profile={profile} />
    </div>
  );
}

export function AppSidebar({ profile }: { profile: AuthenticatedProfile }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-card lg:block">
        <SidebarContent profile={profile} />
      </aside>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Abrir navegação"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navegação</SheetTitle>
          </SheetHeader>
          <SidebarContent profile={profile} />
        </SheetContent>
      </Sheet>
    </>
  );
}
