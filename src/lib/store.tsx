"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";

import { createInitialBoard } from "./fixtures";
import type {
  BoardState,
  Card,
  ColumnId,
  Filters,
  SortMode,
  Toast,
} from "./types";

const BOARD_STORAGE_KEY = "kanban-demo:board:v1";
const THEME_STORAGE_KEY = "kanban-demo:theme:v1";

export type BoardAction =
  | { type: "hydrate"; state: BoardState }
  | { type: "addCard"; columnId: ColumnId; title: string }
  | { type: "updateCard"; cardId: string; patch: Partial<Omit<Card, "id">> }
  | { type: "deleteCard"; cardId: string }
  | { type: "moveCard"; cardId: string; toColumnId: ColumnId; toIndex: number }
  | { type: "reset" };

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "addCard": {
      const id = `CARD-${state.nextCardNumber}`;
      const card: Card = {
        id,
        title: action.title,
        description: "",
        labels: [],
        assigneeId: null,
        priority: "medium",
        points: 1,
        createdAt: "2026-06-24",
      };
      return {
        ...state,
        nextCardNumber: state.nextCardNumber + 1,
        cards: { ...state.cards, [id]: card },
        columns: state.columns.map((column) =>
          column.id === action.columnId
            ? { ...column, cardIds: [id, ...column.cardIds] }
            : column,
        ),
      };
    }

    case "updateCard": {
      const existing = state.cards[action.cardId];
      if (!existing) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: { ...existing, ...action.patch },
        },
      };
    }

    case "deleteCard": {
      const cards = { ...state.cards };
      delete cards[action.cardId];
      return {
        ...state,
        cards,
        columns: state.columns.map((column) => ({
          ...column,
          cardIds: column.cardIds.filter((id) => id !== action.cardId),
        })),
      };
    }

    case "moveCard": {
      const from = state.columns.find((column) =>
        column.cardIds.includes(action.cardId),
      );
      if (!from) return state;

      const sameColumn = from.id === action.toColumnId;
      const withoutCard = from.cardIds.filter((id) => id !== action.cardId);
      const target = sameColumn
        ? withoutCard
        : [...(state.columns.find((c) => c.id === action.toColumnId)?.cardIds ?? [])];

      const index = Math.max(0, Math.min(action.toIndex, target.length));
      target.splice(index, 0, action.cardId);

      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id === action.toColumnId) return { ...column, cardIds: target };
          if (column.id === from.id) return { ...column, cardIds: withoutCard };
          return column;
        }),
      };
    }

    case "reset":
      return createInitialBoard();
  }
}

interface BoardContextValue {
  board: BoardState;
  dispatch: Dispatch<BoardAction>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoard(): BoardContextValue {
  const value = useContext(BoardContext);
  if (!value) throw new Error("useBoard must be used inside <AppProvider>");
  return value;
}

interface UiContextValue {
  filters: Filters;
  setFilters: Dispatch<React.SetStateAction<Filters>>;
  clearFilters: () => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  openCardId: string | null;
  openCard: (cardId: string | null) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (message: string) => void;
  dismissToast: (id: number) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function useUi(): UiContextValue {
  const value = useContext(UiContext);
  if (!value) throw new Error("useUi must be used inside <AppProvider>");
  return value;
}

const EMPTY_FILTERS: Filters = { query: "", assigneeId: null, labelId: null };

export function AppProvider({ children }: { children: ReactNode }) {
  const [board, dispatch] = useReducer(boardReducer, null, createInitialBoard);
  const hydrated = useRef(false);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);

  // Restore persisted board + theme once, on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(BOARD_STORAGE_KEY);
      if (stored) dispatch({ type: "hydrate", state: JSON.parse(stored) as BoardState });
    } catch {
      // Corrupt or unavailable storage — keep the fixture board.
    }
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
    } catch {
      // Storage full or blocked — the in-memory board still works.
    }
  }, [board]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Non-fatal: the class is already applied for this session.
      }
      return next;
    });
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string) => {
      toastCounter.current += 1;
      const id = toastCounter.current;
      setToasts((current) => [...current.slice(-2), { id, message }]);
      window.setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast],
  );

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const boardValue = useMemo(() => ({ board, dispatch }), [board]);

  const uiValue = useMemo<UiContextValue>(
    () => ({
      filters,
      setFilters,
      clearFilters,
      sortMode,
      setSortMode,
      theme,
      toggleTheme,
      openCardId,
      openCard: setOpenCardId,
      paletteOpen,
      setPaletteOpen,
      toasts,
      addToast,
      dismissToast,
    }),
    [
      filters,
      clearFilters,
      sortMode,
      theme,
      toggleTheme,
      openCardId,
      paletteOpen,
      toasts,
      addToast,
      dismissToast,
    ],
  );

  return (
    <BoardContext.Provider value={boardValue}>
      <UiContext.Provider value={uiValue}>{children}</UiContext.Provider>
    </BoardContext.Provider>
  );
}

/** Inline script that applies the stored theme before first paint. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`;
