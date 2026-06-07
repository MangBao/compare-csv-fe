import type { DiffStatus } from '../../types/diff.types';

/** Fixed row height in pixels. Must match the CSS applied to each row. */
export const ROW_HEIGHT = 40;

/** Status column fixed width */
export const STATUS_COL_WIDTH = 108;

/** Minimum width per CSV data column */
export const MIN_COL_WIDTH = 140;

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
  ADDED: 'bg-green-50',
  DELETED: 'bg-red-50',
  MODIFIED: 'bg-yellow-50',
  UNCHANGED: 'bg-white',
};

export const STATUS_BADGE: Record<DiffStatus, string> = {
  ADDED: 'bg-green-100 text-green-700',
  DELETED: 'bg-red-100 text-red-700',
  MODIFIED: 'bg-yellow-100 text-yellow-700',
  UNCHANGED: 'bg-gray-100 text-gray-500',
};

export const STATUS_CELL_MODIFIED = 'bg-yellow-100 font-medium';
