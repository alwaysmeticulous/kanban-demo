"use client";

import { useEffect, useMemo, useState } from "react";

import { useBoard, useUi } from "@/lib/store";
import { cx } from "@/lib/utils";

interface Command {
  id: string;
  title: string;
  hint: string;
  run: () => void;
}

export function CommandPalette() {
  const { board, dispatch } = useBoard();
  const {
    paletteOpen,
    setPaletteOpen,
    openCard,
    clearFilters,
    toggleTheme,
    setSortMode,
    addToast,
  } = useUi();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      } else if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPaletteOpen]);

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [paletteOpen]);

  const commands = useMemo<Command[]>(() => {
    const actions: Command[] = [
      {
        id: "action:theme",
        title: "Toggle dark mode",
        hint: "Appearance",
        run: toggleTheme,
      },
      {
        id: "action:clear",
        title: "Clear all filters",
        hint: "View",
        run: clearFilters,
      },
      {
        id: "action:sort-priority",
        title: "Sort by priority",
        hint: "View",
        run: () => setSortMode("priority"),
      },
      {
        id: "action:sort-manual",
        title: "Back to manual order",
        hint: "View",
        run: () => setSortMode("manual"),
      },
      {
        id: "action:reset",
        title: "Reset board to seed data",
        hint: "Danger",
        run: () => {
          dispatch({ type: "reset" });
          addToast("Board reset to the seed fixture");
        },
      },
    ];

    const cards: Command[] = board.columns.flatMap((column) =>
      column.cardIds
        .map((cardId) => board.cards[cardId])
        .filter(Boolean)
        .map((card) => ({
          id: `card:${card.id}`,
          title: card.title,
          hint: column.title,
          run: () => openCard(card.id),
        })),
    );

    return [...actions, ...cards];
  }, [
    addToast,
    board,
    clearFilters,
    dispatch,
    openCard,
    setSortMode,
    toggleTheme,
  ]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle
      ? commands.filter(
          (command) =>
            command.title.toLowerCase().includes(needle) ||
            command.hint.toLowerCase().includes(needle),
        )
      : commands;
    return matching.slice(0, 8);
  }, [commands, query]);

  if (!paletteOpen) return null;

  const run = (command: Command | undefined) => {
    if (!command) return;
    command.run();
    setPaletteOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-6 pt-28 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) setPaletteOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <input
          autoFocus
          aria-label="Command"
          value={query}
          placeholder="Jump to a card or run a command…"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              run(results[activeIndex]);
            }
          }}
          className="w-full border-b border-slate-200 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400 dark:border-slate-800"
        />

        {results.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No matches</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((command, index) => (
              <li key={command.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => run(command)}
                  className={cx(
                    "flex w-full items-center gap-3 px-4 py-2 text-left text-sm",
                    index === activeIndex
                      ? "bg-slate-100 dark:bg-slate-800"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{command.title}</span>
                  <span className="text-xs text-slate-400">{command.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
