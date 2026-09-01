"use client";

import { Fragment, useState } from "react";

import { Badge } from "@/components/Badge";
import { Card as CardView } from "@/components/Card";
import { useBoard, useUi } from "@/lib/store";
import type {
  Card,
  Column as ColumnModel,
  ColumnId,
  DragState,
} from "@/lib/types";
import { cx, hasActiveFilters } from "@/lib/utils";

interface ColumnProps {
  column: ColumnModel;
  cards: Card[];
  drag: DragState | null;
  registerColumn: (id: ColumnId, element: HTMLElement | null) => void;
  onCardPointerDown: (
    event: React.PointerEvent,
    cardId: string,
    columnId: ColumnId,
  ) => void;
  onCardKeyboardMove: (
    cardId: string,
    direction: "left" | "right" | "up" | "down",
  ) => void;
}

export function Column({
  column,
  cards,
  drag,
  registerColumn,
  onCardPointerDown,
  onCardKeyboardMove,
}: ColumnProps) {
  const { dispatch } = useBoard();
  const { filters, addToast } = useUi();
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  // The dragged card leaves the list so the placeholder can take its slot.
  const listCards = drag ? cards.filter((card) => card.id !== drag.cardId) : cards;
  const placeholderIndex =
    drag?.target?.columnId === column.id ? drag.target.index : null;

  const points = cards.reduce((total, card) => total + card.points, 0);
  const isDropTarget = placeholderIndex !== null;

  const submitDraft = () => {
    const title = draftTitle.trim();
    if (!title) {
      setComposerOpen(false);
      return;
    }
    dispatch({ type: "addCard", columnId: column.id, title });
    addToast(`Card added to ${column.title}`);
    setDraftTitle("");
  };

  return (
    <section
      ref={(element) => registerColumn(column.id, element)}
      aria-label={column.title}
      className={cx(
        "flex w-80 shrink-0 flex-col rounded-xl border bg-slate-100/70 transition-colors dark:bg-slate-900/60",
        isDropTarget
          ? "border-slate-400 dark:border-slate-500"
          : "border-slate-200 dark:border-slate-800",
      )}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <h2 className="text-sm font-semibold">{column.title}</h2>
        <Badge className="bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {cards.length}
        </Badge>
        <span className="ml-auto text-xs text-slate-400">{points} pts</span>
      </div>

      <div
        data-card-list
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-2"
      >
        {listCards.map((card, index) => (
          <Fragment key={card.id}>
            {placeholderIndex === index && <DropPlaceholder />}
            <CardView
              card={card}
              columnId={column.id}
              onPointerDown={onCardPointerDown}
              onKeyboardMove={onCardKeyboardMove}
            />
          </Fragment>
        ))}

        {placeholderIndex !== null && placeholderIndex >= listCards.length && (
          <DropPlaceholder />
        )}

        {cards.length === 0 && !isDropTarget && (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-700">
            {hasActiveFilters(filters)
              ? "No cards match the current filters"
              : "Nothing here yet"}
          </p>
        )}
      </div>

      <div className="px-3 pb-3">
        {composerOpen ? (
          <div className="rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
            <textarea
              autoFocus
              rows={2}
              aria-label={`New card in ${column.title}`}
              value={draftTitle}
              placeholder="Card title…"
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitDraft();
                } else if (event.key === "Escape") {
                  setDraftTitle("");
                  setComposerOpen(false);
                }
              }}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={submitDraft}
                disabled={!draftTitle.trim()}
                className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftTitle("");
                  setComposerOpen(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            + Add card
          </button>
        )}
      </div>
    </section>
  );
}

function DropPlaceholder() {
  return (
    <div
      data-drop-placeholder
      className="h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-400 bg-slate-200/50 dark:border-slate-500 dark:bg-slate-800/50"
    />
  );
}
