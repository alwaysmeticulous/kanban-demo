"use client";

import { useUi } from "@/lib/store";

export function Toasts() {
  const { toasts, dismissToast } = useUi();

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="pointer-events-auto rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 shadow-lg dark:border-slate-600 dark:bg-slate-800"
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
