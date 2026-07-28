import { MEMBERS } from "./fixtures";
import type { Card, Filters, Member, Priority, SortMode } from "./types";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];

export const PRIORITY_CLASSNAME: Record<Priority, string> = {
  urgent: "bg-red-600 text-white dark:bg-red-500",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
};

const AVATAR_CLASSNAMES = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-500",
];

export function memberById(id: string | null): Member | null {
  if (!id) return null;
  return MEMBERS.find((member) => member.id === id) ?? null;
}

export function avatarClassName(memberId: string): string {
  const index = MEMBERS.findIndex((member) => member.id === memberId);
  return AVATAR_CLASSNAMES[index === -1 ? 0 : index % AVATAR_CLASSNAMES.length];
}

export function matchesFilters(card: Card, filters: Filters): boolean {
  if (filters.assigneeId && card.assigneeId !== filters.assigneeId) return false;
  if (filters.labelId && !card.labels.includes(filters.labelId)) return false;

  const query = filters.query.trim().toLowerCase();
  if (!query) return true;

  return (
    card.title.toLowerCase().includes(query) ||
    card.description.toLowerCase().includes(query) ||
    card.id.toLowerCase().includes(query)
  );
}

export function sortCards(cards: Card[], mode: SortMode): Card[] {
  if (mode === "manual") return cards;

  const sorted = [...cards];
  if (mode === "priority") {
    sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  } else if (mode === "points") {
    sorted.sort((a, b) => b.points - a.points);
  } else {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
  return sorted;
}

export function formatDate(iso: string): string {
  const [, month, day] = iso.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = Number(month) - 1;
  return `${monthNames[monthIndex] ?? month} ${Number(day)}`;
}

export function hasActiveFilters(filters: Filters): boolean {
  return Boolean(filters.query.trim() || filters.assigneeId || filters.labelId);
}
