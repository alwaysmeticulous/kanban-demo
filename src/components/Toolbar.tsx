"use client";

import { LABELS, MEMBERS } from "@/lib/fixtures";
import { useBoard, useUi } from "@/lib/store";
import type { LabelId, SortMode } from "@/lib/types";
import { cx, hasActiveFilters } from "@/lib/utils";

const SORT_LABELS: Record<SortMode, string> = {
  manual: "Manual order",
  priority: "Priority",
  points: "Points",
  title: "Title",
};

export function Toolbar() {
  const { dispatch } = useBoard();
  const {
    filters,
    setFilters,
    clearFilters,
    sortMode,
    setSortMode,
    theme,
    toggleTheme,
    setPaletteOpen,
    addToast,
  } = useUi();

  const filtersActive = hasActiveFilters(filters);

  const toggleLabel = (labelId: LabelId) => {
    setFilters((current) => ({
      ...current,
      labelId: current.labelId === labelId ? null : labelId,
    }));
  };

  return (
    <header className="shrink-0 border-b border-slate-200 bg-sky-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Platform board</h1>
          <span className="text-sm text-slate-500 dark:text-slate-400">Q3 cycle</span>
        </div>

        <input
          type="search"
          aria-label="Search cards"
          placeholder="Search cards…"
          value={filters.query}
          onChange={(event) =>
            setFilters((current) => ({ ...current, query: event.target.value }))
          }
          className="h-9 w-56 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
        />

        <select
          aria-label="Filter by assignee"
          value={filters.assigneeId ?? ""}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              assigneeId: event.target.value || null,
            }))
          }
          className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">Everyone</option>
          {MEMBERS.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort cards"
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {SORT_LABELS[mode]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm text-slate-500 hover:bg-slate-100 sm:flex dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Commands
          <kbd className="rounded border border-slate-300 px-1 font-sans text-xs dark:border-slate-600">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-md border border-slate-300 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>

        <button
          type="button"
          onClick={() => {
            dispatch({ type: "reset" });
            clearFilters();
            addToast("Board reset to the seed fixture");
          }}
          className="h-9 rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">Labels</span>
        {LABELS.map((label) => {
          const active = filters.labelId === label.id;
          return (
            <button
              key={label.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleLabel(label.id)}
              className={cx(
                "rounded-full px-2.5 py-0.5 text-xs font-medium transition",
                label.className,
                active
                  ? "ring-2 ring-slate-900 dark:ring-slate-100"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              {label.name}
            </button>
          );
        })}

        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-1 text-xs font-medium text-slate-500 underline hover:text-slate-900 dark:hover:text-slate-100"
          >
            Clear filters
          </button>
        )}
      </div>
    </header>
  );
}
