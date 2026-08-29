"use client";

import {
  CheckSquare,
  Compass,
  Link2,
  LoaderCircle,
  Plus,
  Repeat2,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createLink } from "@/features/links/services/links.service";
import { createItem, getNorth } from "@/features/north/services/north.service";
import { createTask } from "@/features/tasks/services/tasks.service";
import {
  areaLabels,
  type TaskArea,
  taskAreas,
} from "@/features/tasks/types/task.types";
import { search } from "../services/search.service";
import type { SearchResult, SearchResultType } from "../types/search.types";

type QuickAddType = "TASK" | "LINK" | "NORTH_ITEM";

const labels: Record<SearchResultType, string> = {
  TASK: "Tarefa",
  ROUTINE: "Rotina",
  LINK: "Link",
  NORTH_TRACK: "Norte",
  NORTH_ITEM: "Item do Norte",
};
const icons = {
  TASK: CheckSquare,
  ROUTINE: Repeat2,
  LINK: Link2,
  NORTH_TRACK: Compass,
  NORTH_ITEM: Compass,
};

function resultHref(result: SearchResult) {
  switch (result.type) {
    case "TASK":
      return `/tasks#task-${result.id}`;
    case "ROUTINE":
      return `/routines#routine-${result.id}`;
    case "LINK":
      return `/links#link-${result.id}`;
    case "NORTH_TRACK":
      return `/north#north-track-${result.id}`;
    case "NORTH_ITEM":
      return `/north#north-item-${result.id}`;
  }
}

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "quick-add">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        setMode("search");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || mode !== "search") return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [mode, open]);

  useEffect(() => {
    const value = query.trim();
    setSelected(0);
    if (!value) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      void search(value)
        .then((items) => active && setResults(items))
        .catch((cause: unknown) => {
          if (active)
            setError(
              cause instanceof Error
                ? cause.message
                : "Não foi possível realizar a busca.",
            );
        })
        .finally(() => active && setLoading(false));
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setError(null);
  };
  const selectResult = (result: SearchResult) => {
    close();
    router.push(resultHref(result));
  };
  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setSelected((value) => (value + 1) % results.length);
    }
    if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setSelected((value) => (value - 1 + results.length) % results.length);
    }
    if (event.key === "Enter" && results[selected]) {
      event.preventDefault();
      selectResult(results[selected]);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hidden gap-2 sm:inline-flex"
        onClick={() => {
          setOpen(true);
          setMode("search");
        }}
      >
        <Search className="size-4" />
        Buscar
        <kbd className="hidden rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground lg:inline">
          Ctrl K
        </kbd>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="sm:hidden"
        aria-label="Abrir busca global"
        onClick={() => {
          setOpen(true);
          setMode("search");
        }}
      >
        <Search className="size-4" />
      </Button>
      <Sheet open={open} onOpenChange={(value) => !value && close()}>
        <SheetContent
          side="top"
          className="!inset-x-4 !top-6 mx-auto max-h-[calc(100vh-3rem)] w-auto max-w-2xl rounded-xl border sm:!left-1/2 sm:!right-auto sm:!w-full sm:!-translate-x-1/2"
        >
          <SheetHeader>
            <SheetTitle>
              {mode === "search" ? "Busca global" : "Quick Add"}
            </SheetTitle>
            <SheetDescription>
              {mode === "search"
                ? "Busque tarefas, rotinas, links e Norte."
                : "Crie um item sem sair do seu fluxo."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "search" ? "default" : "outline"}
                onClick={() => setMode("search")}
              >
                <Search /> Buscar
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "quick-add" ? "default" : "outline"}
                onClick={() => setMode("quick-add")}
              >
                <Plus /> Quick Add
              </Button>
            </div>
            {mode === "search" ? (
              <>
                <label className="flex h-11 items-center gap-2 rounded-lg border border-input bg-background px-3">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Buscar em todo o ANDRÉ OS"
                    aria-label="Busca global"
                    aria-controls="global-search-results"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                  {loading ? (
                    <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
                  ) : null}
                </label>
                <SearchResults
                  query={query}
                  results={results}
                  selected={selected}
                  error={error}
                  loading={loading}
                  onSelect={selectResult}
                />
              </>
            ) : (
              <QuickAdd onCreated={close} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function SearchResults({
  query,
  results,
  selected,
  error,
  loading,
  onSelect,
}: {
  query: string;
  results: SearchResult[];
  selected: number;
  error: string | null;
  loading: boolean;
  onSelect: (result: SearchResult) => void;
}) {
  if (error)
    return (
      <p className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
        {error}
      </p>
    );
  if (!query.trim())
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Digite para buscar.
      </p>
    );
  if (loading)
    return (
      <output className="flex h-24 animate-pulse items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">
        Buscando...
      </output>
    );
  if (!results.length)
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum resultado encontrado.
      </p>
    );
  return (
    <div
      id="global-search-results"
      role="listbox"
      className="max-h-80 space-y-1 overflow-y-auto"
    >
      {results.map((result, index) => {
        const Icon = icons[result.type];
        return (
          <button
            key={`${result.type}-${result.id}`}
            type="button"
            role="option"
            aria-selected={selected === index}
            className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
              selected === index ? "bg-muted" : "hover:bg-muted/70"
            }`}
            onClick={() => onSelect(result)}
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {result.title}
              </span>
              {result.description ? (
                <span className="block truncate text-xs text-muted-foreground">
                  {result.description}
                </span>
              ) : null}
            </span>
            <span className="text-xs text-muted-foreground">
              {labels[result.type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function QuickAdd({ onCreated }: { onCreated: () => void }) {
  const [type, setType] = useState<QuickAddType>("TASK");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (form: FormData) => {
    setPending(true);
    setError(null);
    try {
      if (type === "TASK") {
        await createTask({
          title: String(form.get("title")),
          area: String(form.get("area")) as TaskArea,
        });
      }
      if (type === "LINK") {
        await createLink({
          title: String(form.get("title")),
          url: String(form.get("url")),
        });
      }
      if (type === "NORTH_ITEM") {
        const north = await getNorth();
        if (!north.track)
          throw new Error("Crie um Norte ativo antes de adicionar itens.");
        await createItem(north.track.id, { title: String(form.get("title")) });
      }
      onCreated();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível criar o item.",
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <form action={submit} className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        {(
          [
            ["TASK", "Tarefa"],
            ["LINK", "Link"],
            ["NORTH_ITEM", "Item do Norte"],
          ] as Array<[QuickAddType, string]>
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={type === value ? "default" : "outline"}
            onClick={() => setType(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Título *
        <input
          name="title"
          required
          maxLength={type === "TASK" ? 120 : 160}
          className="h-10 rounded-lg border border-input bg-background px-3"
        />
      </label>
      {type === "TASK" ? (
        <label className="grid gap-1 text-sm font-medium">
          Área *
          <select
            name="area"
            defaultValue="ENGINEERING"
            className="h-10 rounded-lg border border-input bg-background px-3"
          >
            {taskAreas.map((area) => (
              <option key={area} value={area}>
                {areaLabels[area]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {type === "LINK" ? (
        <label className="grid gap-1 text-sm font-medium">
          URL *
          <input
            name="url"
            type="url"
            required
            placeholder="https://"
            maxLength={2000}
            className="h-10 rounded-lg border border-input bg-background px-3"
          />
        </label>
      ) : null}
      {type === "NORTH_ITEM" ? (
        <p className="text-xs text-muted-foreground">
          O item será incluído no Norte ativo.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}{" "}
        {pending ? "Criando..." : "Criar"}
      </Button>
    </form>
  );
}
