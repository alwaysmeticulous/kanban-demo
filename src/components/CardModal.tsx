"use client";

import { useEffect } from "react";

import { LABELS, MEMBERS } from "@/lib/fixtures";
import { useBoard, useUi } from "@/lib/store";
import type {
  Card as CardModel,
  ColumnId,
  LabelId,
  Priority,
} from "@/lib/types";
import { cx, formatDate, PRIORITIES } from "@/lib/utils";

export function CardModal() {
  const { board, dispatch } = useBoard();
  const { openCardId, openCard, addToast } = useUi();

  const card = openCardId ? board.cards[openCardId] : null;
  const currentColumn = board.columns.find((column) =>
    openCardId ? column.cardIds.includes(openCardId) : false,
  );

  useEffect(() => {
    if (!card) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") openCard(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, openCard]);

  if (!card) return null;

  const update = (patch: Partial<Omit<CardModel, "id">>) =>
    dispatch({ type: "updateCard", cardId: card.id, patch });

  const toggleLabel = (labelId: LabelId) => {
    const labels = card.labels.includes(labelId)
      ? card.labels.filter((id) => id !== labelId)
      : [...card.labels, labelId];
    update({ labels });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Card ${card.id}`}
      className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/40 p-6 pt-20 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) openCard(null);
      }}
    >
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {card.id} · created {formatDate(card.createdAt)}
            </p>
            <input
              aria-label="Card title"
              value={card.title}
              onChange={(event) => update({ title: event.target.value })}
              className="mt-1 w-full rounded border border-transparent bg-transparent text-lg font-semibold outline-none hover:border-slate-300 focus:border-slate-900 dark:hover:border-slate-700 dark:focus:border-slate-300"
            />
          </div>
          <button
            type="button"
            aria-label="Close card"
            onClick={() => openCard(null)}
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <Field label="Description">
            <textarea
              rows={4}
              aria-label="Card description"
              value={card.description}
              placeholder="Add a little more detail…"
              onChange={(event) => update({ description: event.target.value })}
              className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Column">
              <select
                aria-label="Column"
                value={currentColumn?.id ?? ""}
                onChange={(event) => {
                  const toColumnId = event.target.value as ColumnId;
                  dispatch({ type: "moveCard", cardId: card.id, toColumnId, toIndex: 0 });
                  const title = board.columns.find((c) => c.id === toColumnId)?.title;
                  addToast(`${card.id} moved to ${title}`);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {board.columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Assignee">
              <select
                aria-label="Assignee"
                value={card.assigneeId ?? ""}
                onChange={(event) =>
                  update({ assigneeId: event.target.value || null })
                }
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Unassigned</option>
                {MEMBERS.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select
                aria-label="Priority"
                value={card.priority}
                onChange={(event) =>
                  update({ priority: event.target.value as Priority })
                }
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Points">
              <input
                type="number"
                min={0}
                max={13}
                aria-label="Points"
                value={card.points}
                onChange={(event) =>
                  update({ points: Math.max(0, Number(event.target.value) || 0) })
                }
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </Field>
          </div>

          <Field label="Labels">
            <div className="flex flex-wrap gap-1.5">
              {LABELS.map((label) => {
                const active = card.labels.includes(label.id);
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
                        : "opacity-60 hover:opacity-100",
                    )}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "deleteCard", cardId: card.id });
              openCard(null);
              addToast(`${card.id} deleted`);
            }}
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Delete card
          </button>
          <button
            type="button"
            onClick={() => openCard(null)}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
