import type { BoardState, Card, Label, LabelId, Member } from "./types";

export const MEMBERS: Member[] = [
  { id: "ada", name: "Ada Okafor", initials: "AO" },
  { id: "bo", name: "Bo Lindqvist", initials: "BL" },
  { id: "chen", name: "Chen Wei", initials: "CW" },
  { id: "dee", name: "Dee Ramirez", initials: "DR" },
  { id: "emil", name: "Emil Haas", initials: "EH" },
];

export const LABELS: Label[] = [
  {
    id: "design",
    name: "design",
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    id: "bug",
    name: "bug",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    id: "infra",
    name: "infra",
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  },
  {
    id: "growth",
    name: "growth",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    id: "docs",
    name: "docs",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    id: "a11y",
    name: "a11y",
    className: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  },
];

export const LABELS_BY_ID: Record<LabelId, Label> = Object.fromEntries(
  LABELS.map((label) => [label.id, label]),
) as Record<LabelId, Label>;

const CARDS: Card[] = [
  {
    id: "CARD-1",
    title: "Redesign the onboarding checklist",
    description:
      "The current checklist has 9 steps and a 22% completion rate. Cut it to 4 and move the rest into contextual nudges.",
    labels: ["design", "growth"],
    assigneeId: "ada",
    priority: "high",
    points: 5,
    createdAt: "2026-06-02",
  },
  {
    id: "CARD-2",
    title: "Keyboard navigation for the board",
    description:
      "Cards should be reachable with Tab and movable with Alt + arrow keys, without a pointer.",
    labels: ["a11y"],
    assigneeId: "chen",
    priority: "medium",
    points: 3,
    createdAt: "2026-06-04",
  },
  {
    id: "CARD-3",
    title: "Spike: incremental static regeneration for docs",
    description: "Measure build times on the 400-page docs tree before committing.",
    labels: ["infra", "docs"],
    assigneeId: null,
    priority: "low",
    points: 2,
    createdAt: "2026-06-05",
  },
  {
    id: "CARD-4",
    title: "Empty state for filtered columns",
    description:
      "Right now a filtered-to-nothing column looks identical to a genuinely empty one.",
    labels: ["design"],
    assigneeId: "dee",
    priority: "medium",
    points: 2,
    createdAt: "2026-06-08",
  },
  {
    id: "CARD-5",
    title: "Command palette: fuzzy match on card titles",
    description:
      "Exact substring matching misses obvious results. Score on subsequence match instead.",
    labels: ["growth"],
    assigneeId: "bo",
    priority: "high",
    points: 3,
    createdAt: "2026-06-09",
  },
  {
    id: "CARD-6",
    title: "Drag preview jumps on first move",
    description:
      "The clone is positioned from the pointer origin instead of the grab offset, so it snaps.",
    labels: ["bug"],
    assigneeId: "chen",
    priority: "urgent",
    points: 1,
    createdAt: "2026-06-11",
  },
  {
    id: "CARD-7",
    title: "Persist board state across reloads",
    description: "localStorage, versioned key, seeded from the fixture on first visit.",
    labels: ["infra"],
    assigneeId: "emil",
    priority: "high",
    points: 3,
    createdAt: "2026-06-12",
  },
  {
    id: "CARD-8",
    title: "Toast stack overlaps the modal footer",
    description: "Give the toast container a lower z-index than the card detail dialog.",
    labels: ["bug", "design"],
    assigneeId: "dee",
    priority: "medium",
    points: 1,
    createdAt: "2026-06-14",
  },
  {
    id: "CARD-9",
    title: "Dark mode audit of every chip and badge",
    description: "Six label colours and four priority badges, checked for AA contrast.",
    labels: ["design", "a11y"],
    assigneeId: "ada",
    priority: "low",
    points: 2,
    createdAt: "2026-06-15",
  },
  {
    id: "CARD-10",
    title: "Sort by priority disables reordering",
    description:
      "Manual drag order is meaningless under a sort, so drag should be inert and say why.",
    labels: ["design"],
    assigneeId: "bo",
    priority: "medium",
    points: 2,
    createdAt: "2026-06-17",
  },
  {
    id: "CARD-11",
    title: "Write the contributor guide",
    description: "Local setup, the fixture module, and how to add a column.",
    labels: ["docs"],
    assigneeId: "emil",
    priority: "low",
    points: 1,
    createdAt: "2026-06-18",
  },
  {
    id: "CARD-12",
    title: "Ship preview deploys on every pull request",
    description: "Preview URL posted back to the PR as a check.",
    labels: ["infra"],
    assigneeId: "chen",
    priority: "high",
    points: 3,
    createdAt: "2026-06-20",
  },
  {
    id: "CARD-13",
    title: "Column header shows total points",
    description: "Sum of visible cards, so filters change the number.",
    labels: ["design"],
    assigneeId: "dee",
    priority: "low",
    points: 1,
    createdAt: "2026-06-21",
  },
  {
    id: "CARD-14",
    title: "Inline title editing on cards",
    description: "Double-click a title, Enter commits, Escape reverts.",
    labels: ["design"],
    assigneeId: "ada",
    priority: "medium",
    points: 2,
    createdAt: "2026-06-23",
  },
];

/** A fresh copy of the seed board — never mutate the module-level fixture. */
export function createInitialBoard(): BoardState {
  return {
    columns: [
      { id: "backlog", title: "Backlog", cardIds: ["CARD-1", "CARD-2", "CARD-3"] },
      { id: "todo", title: "To do", cardIds: ["CARD-4", "CARD-5", "CARD-11"] },
      {
        id: "in_progress",
        title: "In progress",
        cardIds: ["CARD-6", "CARD-7", "CARD-14"],
      },
      { id: "review", title: "In review", cardIds: ["CARD-8", "CARD-10"] },
      { id: "done", title: "Done", cardIds: ["CARD-9", "CARD-12", "CARD-13"] },
    ],
    cards: Object.fromEntries(CARDS.map((card) => [card.id, { ...card }])),
    nextCardNumber: CARDS.length + 1,
  };
}
