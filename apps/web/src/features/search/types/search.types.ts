export type SearchResultType =
  | "TASK"
  | "ROUTINE"
  | "LINK"
  | "NORTH_TRACK"
  | "NORTH_ITEM";

export type SearchResult = {
  id: string;
  title: string;
  description: string | null;
  type: SearchResultType;
};
