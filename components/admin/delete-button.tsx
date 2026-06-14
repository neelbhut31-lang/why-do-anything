"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({ action }: { action: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("Delete this page and all of its child pages? This cannot be undone.")) action();
      }}
      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
    >
      <Trash2 size={16} /> Delete
    </button>
  );
}
