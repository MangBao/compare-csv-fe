import type { DiffStatus } from '../../types/diff.types';

/** Fixed row height in pixels. Must match the CSS applied to each row. */
export const ROW_HEIGHT = 42;

/** Status column fixed width */
export const STATUS_COL_WIDTH = 114;

/** Minimum width per CSV data column */
export const MIN_COL_WIDTH = 150;

/** How many rows before the end of the loaded list we trigger the next fetch */
export const PREFETCH_THRESHOLD = 50;

export const STATUS_LABEL: Record<DiffStatus, string> = {
  ADDED: 'Added',
  DELETED: 'Deleted',
  MODIFIED: 'Modified',
  UNCHANGED: 'Unchanged',
};

/**
  * Tailwind background classes per status.
  * These must be in full string form so Tailwind's static scanner can detect them.
  */
export const STATUS_ROW_BG: Record<DiffStatus, string> = {
  ADDED: 'bg-emerald-50/20 dark:bg-emerald-900/10',
  DELETED: 'bg-rose-50/20 dark:bg-rose-900/10',
  MODIFIED: 'bg-amber-50/20 dark:bg-amber-900/10',
  UNCHANGED: 'bg-white dark:bg-zinc-950',
};

export const STATUS_BADGE: Record<DiffStatus, string> = {
  ADDED: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  DELETED: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800',
  MODIFIED: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  UNCHANGED: 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
};

export const STATUS_CELL_MODIFIED = 'bg-amber-100/50 text-zinc-950 font-medium border-x border-amber-200/30 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700/50';
