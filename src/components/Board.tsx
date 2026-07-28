"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { Column } from "@/components/Column";
import { useBoard, useUi } from "@/lib/store";
import type { ColumnId, DragState, DropTarget } from "@/lib/types";
import { matchesFilters, sortCards } from "@/lib/utils";

const DRAG_THRESHOLD_PX = 5;

export function Board() {
  const { board, dispatch } = useBoard();
  const { filters, sortMode, addToast } = useUi();

  const [drag, setDrag] = useState<DragState | null>(null);
  const targetRef = useRef<DropTarget | null>(null);
  const columnRefs = useRef(new Map<ColumnId, HTMLElement>());

  const registerColumn = useCallback((id: ColumnId, element: HTMLElement | null) => {
    if (element) columnRefs.current.set(id, element);
    else columnRefs.current.delete(id);
  }, []);

  const visibleColumns = useMemo(
    () =>
      board.columns.map((column) => {
        const cards = column.cardIds
          .map((cardId) => board.cards[cardId])
          .filter((card) => card && matchesFilters(card, filters));
        return { column, cards: sortCards(cards, sortMode) };
      }),
    [board, filters, sortMode],
  );

  const findDropTarget = useCallback((x: number, y: number): DropTarget | null => {
    for (const [columnId, element] of columnRefs.current) {
      const rect = element.getBoundingClientRect();
      // Only the horizontal band matters — dragging above or below a column
      // should still drop into it.
      if (x < rect.left || x > rect.right) continue;

      // Hovering the gap we already opened up keeps the current index, which
      // stops the placeholder from oscillating as the list reflows.
      const placeholder = element.querySelector<HTMLElement>("[data-drop-placeholder]");
      if (placeholder && targetRef.current?.columnId === columnId) {
        const placeholderRect = placeholder.getBoundingClientRect();
        if (y >= placeholderRect.top && y <= placeholderRect.bottom) {
          return targetRef.current;
        }
      }

      const cardElements = Array.from(
        element.querySelectorAll<HTMLElement>("[data-card-id]"),
      );
      let index = 0;
      for (const cardElement of cardElements) {
        const cardRect = cardElement.getBoundingClientRect();
        if (y > cardRect.top + cardRect.height / 2) index += 1;
      }
      return { columnId, index };
    }
    return null;
  }, []);

  const startDrag = useCallback(
    (event: React.PointerEvent, cardId: string, fromColumnId: ColumnId) => {
      if (event.button !== 0 || sortMode !== "manual") return;

      const origin = { x: event.clientX, y: event.clientY };
      let started = false;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!started) {
          const dx = moveEvent.clientX - origin.x;
          const dy = moveEvent.clientY - origin.y;
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
          started = true;
          document.body.dataset.dragging = "true";
        }

        const target = findDropTarget(moveEvent.clientX, moveEvent.clientY);
        targetRef.current = target;
        setDrag({
          cardId,
          fromColumnId,
          pointer: { x: moveEvent.clientX, y: moveEvent.clientY },
          target,
        });
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        delete document.body.dataset.dragging;

        if (started) {
          const target = findDropTarget(upEvent.clientX, upEvent.clientY);
          if (target) {
            dispatch({
              type: "moveCard",
              cardId,
              toColumnId: target.columnId,
              toIndex: target.index,
            });
            if (target.columnId !== fromColumnId) {
              const columnTitle = board.columns.find(
                (column) => column.id === target.columnId,
              )?.title;
              addToast(`${cardId} moved to ${columnTitle}`);
            }
          }
        }

        targetRef.current = null;
        setDrag(null);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [addToast, board.columns, dispatch, findDropTarget, sortMode],
  );

  const moveWithKeyboard = useCallback(
    (cardId: string, direction: "left" | "right" | "up" | "down") => {
      const fromIndex = board.columns.findIndex((column) =>
        column.cardIds.includes(cardId),
      );
      if (fromIndex === -1) return;

      const from = board.columns[fromIndex];
      const positionInColumn = from.cardIds.indexOf(cardId);

      if (direction === "up" || direction === "down") {
        const nextIndex = positionInColumn + (direction === "up" ? -1 : 1);
        if (nextIndex < 0 || nextIndex >= from.cardIds.length) return;
        dispatch({ type: "moveCard", cardId, toColumnId: from.id, toIndex: nextIndex });
        return;
      }

      const nextColumnIndex = fromIndex + (direction === "left" ? -1 : 1);
      const nextColumn = board.columns[nextColumnIndex];
      if (!nextColumn) return;

      dispatch({
        type: "moveCard",
        cardId,
        toColumnId: nextColumn.id,
        toIndex: Math.min(positionInColumn, nextColumn.cardIds.length),
      });
      addToast(`${cardId} moved to ${nextColumn.title}`);
    },
    [addToast, board.columns, dispatch],
  );

  const draggedCard = drag ? board.cards[drag.cardId] : null;

  return (
    <main className="flex min-h-0 flex-1 gap-4 overflow-x-auto px-6 py-5">
      {visibleColumns.map(({ column, cards }) => (
        <Column
          key={column.id}
          column={column}
          cards={cards}
          drag={drag}
          registerColumn={registerColumn}
          onCardPointerDown={startDrag}
          onCardKeyboardMove={moveWithKeyboard}
        />
      ))}

      {drag && draggedCard && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 w-72 rotate-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium shadow-xl dark:border-slate-600 dark:bg-slate-800"
          style={{ left: drag.pointer.x - 24, top: drag.pointer.y - 16 }}
        >
          {draggedCard.title}
        </div>
      )}
    </main>
  );
}
