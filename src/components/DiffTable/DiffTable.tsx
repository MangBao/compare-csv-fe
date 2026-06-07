import React, { useEffect, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { DiffStats, DiffStatus } from '../../types/diff.types';
import { useDiffResults } from '../../hooks/useDiffResults';
import { DiffRow } from './DiffRow';
import {
  ROW_HEIGHT,
  STATUS_COL_WIDTH,
  MIN_COL_WIDTH,
  PREFETCH_THRESHOLD,
  STATUS_LABEL,
  STATUS_BADGE,
} from './constants';

interface DiffTableProps {
  jobId: string;
  stats: DiffStats;
  onReset: () => void;
}

const FILTER_OPTIONS: Array<{ value: DiffStatus | ''; label: string }> = [
  { value: '', label: 'All rows' },
  { value: 'ADDED', label: 'Added' },
  { value: 'DELETED', label: 'Deleted' },
  { value: 'MODIFIED', label: 'Modified' },
  { value: 'UNCHANGED', label: 'Unchanged' },
];

export function DiffTable({ jobId, stats, onReset }: DiffTableProps) {
  const [statusFilter, setStatusFilter] = React.useState<DiffStatus | null>(null);
  const [state, actions] = useDiffResults(jobId, statusFilter);
  const { records, columns, isLoading, isFetchingMore, hasNextPage, totalRows, error } =
    state;

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    actions.fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, statusFilter]);

  // ── Virtualizer ─────────────────────────────────────────────────────────────
  // Add a sentinel item at the end when more pages are available so the
  // observer can detect when the user reaches the bottom.
  const itemCount = records.length + (hasNextPage ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
    // Stable key per record so React reuses DOM nodes efficiently
    getItemKey: (index) =>
      index < records.length
        ? `${records[index]!.status}-${records[index]!.primaryKeyValue}-${index}`
        : `__loading__`,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // ── Infinite scroll trigger ──────────────────────────────────────────────────
  const loadMoreIfNeeded = useCallback(() => {
    if (!hasNextPage || isFetchingMore) return;
    const lastVirtualItem = virtualItems[virtualItems.length - 1];
    if (!lastVirtualItem) return;

    if (lastVirtualItem.index >= records.length - PREFETCH_THRESHOLD) {
      actions.fetchNextPage();
    }
  }, [hasNextPage, isFetchingMore, virtualItems, records.length, actions]);

  useEffect(() => {
    loadMoreIfNeeded();
  }, [loadMoreIfNeeded]);

  // ── Column width calculation ─────────────────────────────────────────────────
  // Each pane gets flex-1 split across all columns; we set a min-width per cell.
  const paneMinWidth = columns.length * MIN_COL_WIDTH;

  // Total scrollable width: status + base pane + 1px divider + target pane
  const totalMinWidth = STATUS_COL_WIDTH + paneMinWidth + 1 + paneMinWidth;

  // ── Filter change ────────────────────────────────────────────────────────────
  const handleFilterChange = (value: DiffStatus | '') => {
    actions.reset();
    setStatusFilter(value === '' ? null : value);
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full mx-auto" />
          <p className="text-sm">Loading diff results…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={onReset}
            className="text-sm text-indigo-600 underline hover:text-indigo-800"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            CSV Diff
          </span>
          <span className="text-xs text-gray-400 font-mono bg-gray-100 rounded px-2 py-0.5">
            {totalRows.toLocaleString()} rows
          </span>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['ADDED', 'DELETED', 'MODIFIED', 'UNCHANGED'] as DiffStatus[]).map(
            (s) => (
              <span
                key={s}
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[s]}`}
              >
                {STATUS_LABEL[s]}: {stats[s.toLowerCase() as keyof DiffStats].toLocaleString()}
              </span>
            ),
          )}
        </div>

        {/* Filter */}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Filter:</label>
          <select
            value={statusFilter ?? ''}
            onChange={(e) =>
              handleFilterChange(e.target.value as DiffStatus | '')
            }
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
          >
            ← New Diff
          </button>
        </div>
      </header>

      {/* ── Column header ────────────────────────────────────────────────────── */}
      {columns.length > 0 && (
        <div
          className="flex-shrink-0 bg-gray-100 border-b border-gray-300 overflow-hidden"
          style={{ minWidth: totalMinWidth }}
        >
          {/* Pane labels row */}
          <div className="flex" style={{ minWidth: totalMinWidth }}>
            <div style={{ width: STATUS_COL_WIDTH }} className="flex-shrink-0 border-r border-gray-300" />
            <div
              className="flex-1 text-xs font-bold text-blue-700 uppercase tracking-wider px-3 py-1.5 border-r border-gray-400 bg-blue-50/60"
              style={{ minWidth: paneMinWidth }}
            >
              Base File
            </div>
            <div
              className="flex-1 text-xs font-bold text-violet-700 uppercase tracking-wider px-3 py-1.5 bg-violet-50/60"
              style={{ minWidth: paneMinWidth }}
            >
              Target File
            </div>
          </div>
          {/* Column names row */}
          <div className="flex border-t border-gray-200" style={{ minWidth: totalMinWidth }}>
            <div
              className="flex-shrink-0 border-r border-gray-300 text-xs font-medium text-gray-500 flex items-center justify-center"
              style={{ width: STATUS_COL_WIDTH, height: 32 }}
            >
              Status
            </div>
            {/* Base columns */}
            {columns.map((col) => (
              <div
                key={`base-${col}`}
                style={{ minWidth: MIN_COL_WIDTH, height: 32 }}
                className="flex-1 flex items-center px-3 text-xs font-semibold text-gray-600 border-r border-gray-200 truncate bg-blue-50/40"
                title={col}
              >
                {col}
              </div>
            ))}
            <div className="flex-shrink-0 w-px bg-gray-300 self-stretch" />
            {/* Target columns */}
            {columns.map((col) => (
              <div
                key={`target-${col}`}
                style={{ minWidth: MIN_COL_WIDTH, height: 32 }}
                className="flex-1 flex items-center px-3 text-xs font-semibold text-gray-600 border-r border-gray-200 truncate bg-violet-50/40"
                title={col}
              >
                {col}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Virtual scroll body ──────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ contain: 'strict' }}
      >
        {/* Total height spacer — makes the scrollbar reflect the real size */}
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            minWidth: totalMinWidth,
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLoaderRow = virtualItem.index >= records.length;
            const record = records[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: virtualItem.start,
                  left: 0,
                  width: '100%',
                  minWidth: totalMinWidth,
                  height: ROW_HEIGHT,
                }}
              >
                {isLoaderRow ? (
                  <LoaderRow colSpan={columns.length} />
                ) : record ? (
                  <DiffRow
                    record={record}
                    columns={columns}
                    style={{ height: ROW_HEIGHT, width: '100%', minWidth: totalMinWidth }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      {!hasNextPage && records.length > 0 && (
        <div className="flex-shrink-0 text-center text-xs text-gray-400 py-2 border-t border-gray-200 bg-white">
          All {totalRows.toLocaleString()} rows loaded
        </div>
      )}
    </div>
  );
}

// ─── Loader row (spinner at the bottom of the virtual list) ──────────────────

function LoaderRow({ colSpan }: { colSpan: number }) {
  const totalCols = colSpan * 2 + 1; // base + status + target
  return (
    <div
      className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-white border-b border-gray-100"
      style={{ height: ROW_HEIGHT, gridColumn: `span ${totalCols}` }}
    >
      <div className="animate-spin h-3.5 w-3.5 border-2 border-gray-200 border-t-indigo-500 rounded-full" />
      Loading more rows…
    </div>
  );
}
