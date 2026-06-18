// ─── Mirror of backend types ──────────────────────────────────────────────────

export type DiffStatus = 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED';

export type CsvRow = Record<string, string>;

export interface DiffRecord {
  status: DiffStatus;
  rowIndex: number;
  targetRow?: CsvRow;
  baseRow?: CsvRow;
}

// ─── POST /api/diff ───────────────────────────────────────────────────────────

export interface DiffStats {
  added: number;
  deleted: number;
  modified: number;
  unchanged: number;
  total: number;
}

export interface DiffJobResponse {
  message: string;
  jobId: string;
  outputFile: string;
  stats: DiffStats;
  durationMs: number;
  /** Column names discovered in the base CSV file */
  headers: string[];
}

// ─── GET /api/diff/results ────────────────────────────────────────────────────

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  totalRows: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  statusFilter: DiffStatus | null;
}

export interface PaginatedDiffResponse {
  data: DiffRecord[];
  meta: PaginationMeta;
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export type AppView = 'upload' | 'loading' | 'results' | 'error';
