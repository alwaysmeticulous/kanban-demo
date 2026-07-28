export type ColumnId = "backlog" | "todo" | "in_progress" | "review" | "done";

export type Priority = "low" | "medium" | "high" | "urgent";

export type LabelId =
  | "design"
  | "bug"
  | "infra"
  | "growth"
  | "docs"
  | "a11y";

export interface Member {
  id: string;
  name: string;
  initials: string;
}

export interface Label {
  id: LabelId;
  name: string;
  /** Tailwind classes for the label chip, light + dark. */
  className: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: LabelId[];
  assigneeId: string | null;
  priority: Priority;
  points: number;
  /** Fixed ISO date — never `new Date()`, so screenshots stay deterministic. */
  createdAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  cardIds: string[];
}

export interface BoardState {
  columns: Column[];
  cards: Record<string, Card>;
  /** Bumped on every mutation, so new card ids stay deterministic per session. */
  nextCardNumber: number;
}

export type SortMode = "manual" | "priority" | "points" | "title";

export interface Filters {
  query: string;
  assigneeId: string | null;
  labelId: LabelId | null;
}

export interface Toast {
  id: number;
  message: string;
}

export interface DropTarget {
  columnId: ColumnId;
  index: number;
}

export interface DragState {
  cardId: string;
  fromColumnId: ColumnId;
  pointer: { x: number; y: number };
  target: DropTarget | null;
}
