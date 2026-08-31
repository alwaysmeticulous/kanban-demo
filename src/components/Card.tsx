"use client";

import { useState } from "react";

import { LABELS_BY_ID } from "@/lib/fixtures";
import { useBoard, useUi } from "@/lib/store";
import type { Card as CardModel, ColumnId } from "@/lib/types";
import {
  avatarClassName,
  cx,
  formatDate,
  memberById,
  PRIORITY_CLASSNAME,
} from "@/lib/utils";

interface CardProps {
  card: CardModel;
  columnId: ColumnId;
  onPointerDown: (
    event: React.PointerEvent,
    cardId: string,
    columnId: ColumnId,
  ) => void;
  onKeyboardMove: (
    cardId: string,
    direction: "left" | "right" | "up" | "down",
  ) => void;
}

const ARROW_DIRECTIONS: Record<string, "left" | "right" | "up" | "down"> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export function Card({ card, columnId, onPointerDown, onKeyboardMove }: CardProps) {
  const { dispatch } = useBoard();
  const { openCard, sortMode, addToast } = useUi();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);

  const assignee = memberById(card.assigneeId);

  const commitTitle = () => {
    const title = draft.trim();
    setEditing(false);
    if (!title || title === card.title) {
      setDraft(card.title);
      return;
    }
    dispatch({ type: "updateCard", cardId: card.id, patch: { title } });
    addToast(`${card.id} renamed`);
  };

  return (
    <article
      data-card-id={card.id}
      tabIndex={0}
      onPointerDown={(event) => {
        if (editing) return;
        onPointerDown(event, card.id, columnId);
      }}
      onDoubleClick={() => {
        setDraft(card.title);
        setEditing(true);
      }}
      onKeyDown={(event) => {
        if (editing) return;
        const direction = ARROW_DIRECTIONS[event.key];
        if (direction && event.altKey) {
          event.preventDefault();
          onKeyboardMove(card.id, direction);
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          openCard(card.id);
        }
      }}
      className={cx(
        "group rounded-lg border border-slate-200 bg-white p-3 shadow-sm outline-none",
        "focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100",
        "dark:border-slate-800 dark:bg-slate-900",
        sortMode === "manual" ? "cursor-grab" : "cursor-default",
      )}
    >
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((labelId) => (
            <span
              key={labelId}
              className={cx(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                LABELS_BY_ID[labelId].className,
              )}
            >
              {LABELS_BY_ID[labelId].name}
            </span>
          ))}
        </div>
      )}

      {editing ? (
        <input
          autoFocus
          aria-label={`Rename ${card.id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitTitle();
            } else if (event.key === "Escape") {
              event.preventDefault();
              setDraft(card.title);
              setEditing(false);
            }
          }}
          className="w-full rounded border border-slate-400 bg-white px-1.5 py-0.5 text-sm font-medium outline-none dark:border-slate-500 dark:bg-slate-950"
        />
      ) : (
        <h3 className="text-sm font-medium leading-snug">{card.title}</h3>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span
          className={cx(
            "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            PRIORITY_CLASSNAME[card.priority],
          )}
        >
          {card.priority}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-500/20 dark:text-slate-300">
          {card.points} pts
        </span>
        <span className="text-[11px] text-slate-400">{formatDate(card.createdAt)}</span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => openCard(card.id)}
            className="rounded px-1.5 py-0.5 text-[11px] text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 focus-visible:opacity-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Details
          </button>
          {assignee ? (
            <span
              title={assignee.name}
              className={cx(
                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white",
                avatarClassName(assignee.id),
              )}
            >
              {assignee.initials}
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] text-slate-400 dark:border-slate-600">
              ?
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
