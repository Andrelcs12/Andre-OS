"use client";
import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  areaLabels,
  type TaskArea,
  taskAreas,
} from "@/features/tasks/types/task.types";
import {
  createLink,
  deleteLink,
  listLinks,
  updateLink,
} from "../services/links.service";
import type { Link, LinkFilters, LinkInput } from "../types/link.types";
export function LinkManager({ initialLinks }: { initialLinks: Link[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [filters, setFilters] = useState<LinkFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Link | null>(null);
  const [open, setOpen] = useState(false);
  const reload = async (next = filters) => {
    setLoading(true);
    setError(null);
    try {
      setLinks(await listLinks(next));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível carregar os links.",
      );
    } finally {
      setLoading(false);
    }
  };
  const change = (next: LinkFilters) => {
    setFilters(next);
    void reload(next);
  };
  const save = async (input: LinkInput) => {
    const saved = editing
      ? await updateLink(editing.id, input)
      : await createLink(input);
    setLinks((current) =>
      editing
        ? current.map((link) => (link.id === saved.id ? saved : link))
        : [saved, ...current],
    );
    setOpen(false);
    setEditing(null);
  };
  const remove = async (link: Link) => {
    if (
      !window.confirm(
        `Excluir “${link.title}”? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await deleteLink(link.id);
      setLinks((current) => current.filter((item) => item.id !== link.id));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível excluir o link.",
      );
    }
  };
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Links</h2>
          <p className="mt-2 text-muted-foreground">
            Salve referências e recursos para encontrar depois.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus />
          Novo link
        </Button>
      </section>
      <section className="grid gap-2 sm:grid-cols-3">
        <label className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            aria-label="Buscar links"
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder="Busca"
            value={filters.search ?? ""}
            onChange={(e) => change({ ...filters, search: e.target.value })}
          />
        </label>
        <select
          aria-label="Filtrar links por área"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          value={filters.area ?? ""}
          onChange={(e) =>
            change({
              ...filters,
              area: (e.target.value as TaskArea) || undefined,
            })
          }
        >
          <option value="">Todas as áreas</option>
          {taskAreas.map((area) => (
            <option key={area} value={area}>
              {areaLabels[area]}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar favoritos"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          value={filters.favorite === undefined ? "" : String(filters.favorite)}
          onChange={(e) =>
            change({
              ...filters,
              favorite:
                e.target.value === "" ? undefined : e.target.value === "true",
            })
          }
        >
          <option value="">Todos os links</option>
          <option value="true">Favoritos</option>
          <option value="false">Não favoritos</option>
        </select>
      </section>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <div className="h-24 animate-pulse rounded-xl border bg-muted/30" />
      ) : null}
      {!loading && links.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">Nenhum link salvo.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Guarde aqui referências importantes para o seu trabalho.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              onEdit={() => {
                setEditing(link);
                setOpen(true);
              }}
              onDelete={() => void remove(link)}
              onFavorite={() => void saveFavorite(link, setLinks, setError)}
            />
          ))}
        </div>
      )}
      <LinkForm
        open={open}
        link={editing}
        onOpenChange={setOpen}
        onSave={save}
      />
    </div>
  );
}
async function saveFavorite(
  link: Link,
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
) {
  try {
    const saved = await updateLink(link.id, { isFavorite: !link.isFavorite });
    setLinks((current) =>
      current.map((item) => (item.id === saved.id ? saved : item)),
    );
  } catch (e) {
    setError(
      e instanceof Error ? e.message : "Não foi possível atualizar o favorito.",
    );
  }
}
function LinkItem({
  link,
  onEdit,
  onDelete,
  onFavorite,
}: {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}) {
  let hostname = link.url;
  try {
    hostname = new URL(link.url).hostname;
  } catch {}
  return (
    <Card className="border">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              className="truncate font-medium hover:text-primary hover:underline"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.title}
            </a>
            {link.isFavorite ? (
              <Star
                className="size-4 fill-primary text-primary"
                aria-label="Favorito"
              />
            ) : null}
          </div>
          <a
            className="mt-1 flex w-fit max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {hostname}
            <ExternalLink className="size-3" />
          </a>
          {link.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {link.description}
            </p>
          ) : null}
          {link.area ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {areaLabels[link.area]}
            </p>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Ações para ${link.title}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onFavorite}>
              <Star />
              {link.isFavorite ? "Remover favorito" : "Favoritar"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
function LinkForm({
  open,
  link,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  link: Link | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: LinkInput) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (form: FormData) => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: String(form.get("title")),
        url: String(form.get("url")),
        description: String(form.get("description")),
        area: (String(form.get("area")) as TaskArea) || undefined,
        isFavorite: form.get("favorite") === "on",
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível salvar o link.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{link ? "Editar link" : "Novo link"}</SheetTitle>
          <SheetDescription>
            Os campos marcados com * são obrigatórios.
          </SheetDescription>
        </SheetHeader>
        <form
          key={link?.id ?? "new"}
          action={submit}
          className="space-y-4 p-4 pt-0"
        >
          <Field label="Título *">
            <input
              required
              name="title"
              maxLength={160}
              defaultValue={link?.title ?? ""}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            />
          </Field>
          <Field label="URL *">
            <input
              required
              type="url"
              name="url"
              placeholder="https://"
              maxLength={2000}
              defaultValue={link?.url ?? ""}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            />
          </Field>
          <Field label="Descrição">
            <textarea
              name="description"
              maxLength={2000}
              defaultValue={link?.description ?? ""}
              className="min-h-24 w-full rounded-lg border border-input bg-background p-3"
            />
          </Field>
          <Field label="Área">
            <select
              name="area"
              defaultValue={link?.area ?? ""}
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
            >
              <option value="">Sem área</option>
              {taskAreas.map((area) => (
                <option key={area} value={area}>
                  {areaLabels[area]}
                </option>
              ))}
            </select>
          </Field>
          <label
            htmlFor="link-favorite"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Checkbox
              id="link-favorite"
              name="favorite"
              defaultChecked={link?.isFavorite ?? false}
            />
            Favorito
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar link"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </div>
  );
}
