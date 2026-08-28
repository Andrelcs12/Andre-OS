import type { TaskArea } from "@/features/tasks/types/task.types";
export type Link = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  area: TaskArea | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};
export type LinkInput = {
  title: string;
  url: string;
  description?: string;
  area?: TaskArea;
  isFavorite?: boolean;
};
export type LinkFilters = {
  search?: string;
  area?: TaskArea;
  favorite?: boolean;
};
