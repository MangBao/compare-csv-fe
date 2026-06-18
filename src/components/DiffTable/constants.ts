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
  ADDED: 'bg-emerald-50/20',
  DELETED: 'bg-rose-50/20',
  MODIFIED: 'bg-amber-50/20',
  UNCHANGED: 'bg-white',
};

export const STATUS_BADGE: Record<DiffStatus, string> = {
  ADDED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  DELETED: 'bg-rose-50 text-rose-700 border-rose-100',
  MODIFIED: 'bg-amber-50 text-amber-700 border-amber-100',
  UNCHANGED: 'bg-zinc-50 text-zinc-500 border-zinc-200',
};

export const STATUS_CELL_MODIFIED = 'bg-amber-100/50 text-zinc-950 font-medium border-x border-amber-200/30';
