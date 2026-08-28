export const taskAreas = [
  "ENGINEERING",
  "UNIVERSITY",
  "CAREER",
  "PRODUCT",
  "DISTRIBUTION",
  "PERSONAL",
] as const;
export const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
export const taskStatuses = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
] as const;

export type TaskArea = (typeof taskAreas)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskStatus = (typeof taskStatuses)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  area: TaskArea;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  area: TaskArea;
  priority?: TaskPriority;
  estimatedMinutes?: number;
  dueDate?: string;
};

export type UpdateTaskInput = Partial<TaskInput> & { status?: TaskStatus };
export type TaskFilters = Partial<
  Pick<Task, "status" | "area" | "priority"> & { search: string }
>;

export const areaLabels: Record<TaskArea, string> = {
  ENGINEERING: "Engenharia",
  UNIVERSITY: "Universidade",
  CAREER: "Carreira",
  PRODUCT: "Produto",
  DISTRIBUTION: "Distribuição",
  PERSONAL: "Pessoal",
};
export const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
};
export const statusLabels: Record<TaskStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  ARCHIVED: "Arquivada",
};
