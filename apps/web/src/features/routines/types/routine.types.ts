export type RoutineSchedule = "DAILY" | "WEEKDAYS" | "CUSTOM";
export type RoutineArea =
  | "ENGINEERING"
  | "UNIVERSITY"
  | "CAREER"
  | "PRODUCT"
  | "DISTRIBUTION"
  | "PERSONAL";
export type Routine = {
  id: string;
  title: string;
  description: string | null;
  area: RoutineArea | null;
  schedule: RoutineSchedule;
  daysOfWeek: number[];
  targetMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type DailyRoutine = Routine & {
  completed: boolean;
  completedAt: string | null;
};
export type RoutineInput = {
  title: string;
  description?: string;
  area?: RoutineArea;
  schedule: RoutineSchedule;
  daysOfWeek?: number[];
  isActive?: boolean;
  targetMinutes?: number | null;
};
export const routineAreas: RoutineArea[] = [
  "ENGINEERING",
  "UNIVERSITY",
  "CAREER",
  "PRODUCT",
  "DISTRIBUTION",
  "PERSONAL",
];
export const routineAreaLabels: Record<RoutineArea, string> = {
  ENGINEERING: "Engenharia",
  UNIVERSITY: "Universidade",
  CAREER: "Carreira",
  PRODUCT: "Produto",
  DISTRIBUTION: "Distribuição",
  PERSONAL: "Pessoal",
};
