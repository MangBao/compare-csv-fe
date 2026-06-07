import { useState, useCallback, useRef } from 'react';
import type {
  DiffRecord,
  DiffStats,
  DiffStatus,
  PaginatedDiffResponse,
} from '../types/diff.types';

const API_PAGE_SIZE = 200; // records fetched per request

export interface UseDiffResultsState {
  records: DiffRecord[];
  stats: DiffStats | null;
  columns: string[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasNextPage: boolean;
  totalRows: number;
  error: string | null;
}

export interface UseDiffResultsActions {
  fetchNextPage: () => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE: UseDiffResultsState = {
  records: [],
  stats: null,
  columns: [],
  isLoading: false,
  isFetchingMore: false,
  hasNextPage: false,
  totalRows: 0,
  error: null,
};

/**
 * Manages paginated, infinite-load fetching of diff results from
 * GET /api/diff/results.
 *
 * Design notes:
 * - All loaded records are accumulated in state. Only the DOM nodes for the
 *   visible window are ever rendered (handled by the virtualizer).
 * - Column names are extracted from the first record that arrives.
 * - A ref guards against concurrent overlapping fetches.
 */
export function useDiffResults(
  jobId: string | null,
  statusFilter: DiffStatus | null = null,
): [UseDiffResultsState, UseDiffResultsActions] {
  const [state, setState] = useState<UseDiffResultsState>(INITIAL_STATE);

  // Tracks which page to load next; stored in a ref so callbacks never close
  // over stale state.
  const nextPageRef = useRef(1);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(
    async (page: number, isFirstPage: boolean) => {
      if (!jobId) return;
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      setState((prev) => ({
        ...prev,
        isLoading: isFirstPage,
        isFetchingMore: !isFirstPage,
        error: null,
      }));

      try {
        const params = new URLSearchParams({
          jobId,
          page: String(page),
          limit: String(API_PAGE_SIZE),
        });
        if (statusFilter) params.set('status', statusFilter);

        const res = await fetch(`/api/diff/results?${params.toString()}`);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            body.error ?? `Server returned ${res.status} ${res.statusText}`,
          );
        }

        const json = (await res.json()) as PaginatedDiffResponse;
        const newRecords = json.data;

        setState((prev) => {
          // Extract column names from the first record with data
          let columns = prev.columns;
          if (columns.length === 0 && newRecords.length > 0) {
            const sample = newRecords.find(
              (r) => r.targetRow ?? r.baseRow,
            );
            const sampleRow = sample?.targetRow ?? sample?.baseRow ?? {};
            columns = Object.keys(sampleRow);
          }

          return {
            ...prev,
            records: isFirstPage
              ? newRecords
              : [...prev.records, ...newRecords],
            columns,
            isLoading: false,
            isFetchingMore: false,
            hasNextPage: json.meta.hasNextPage,
            totalRows: json.meta.totalRows,
          };
        });

        nextPageRef.current = page + 1;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unknown error occurred.';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isFetchingMore: false,
          error: message,
        }));
      } finally {
        isFetchingRef.current = false;
      }
    },
    [jobId, statusFilter],
  );

  const fetchNextPage = useCallback(async () => {
    await fetchPage(nextPageRef.current, nextPageRef.current === 1);
  }, [fetchPage]);

  const reset = useCallback(() => {
    nextPageRef.current = 1;
    isFetchingRef.current = false;
    setState(INITIAL_STATE);
  }, []);

  return [state, { fetchNextPage, reset }];
}
