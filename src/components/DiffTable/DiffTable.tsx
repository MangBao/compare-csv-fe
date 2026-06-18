import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  ArrowLeft, 
  Funnel, 
  CircleNotch,
  Plus,
  Minus,
  PencilSimple,
  Check,
  Warning,
  Table,
} from '@phosphor-icons/react';
import { ThemeToggle } from '../ThemeToggle';
import type { DiffRecord, DiffStats, DiffStatus } from '../../types/diff.types';
import { useDiffResults } from '../../hooks/useDiffResults';
import { DiffRow } from './DiffRow';
import { DiffDetail } from './DiffDetail';
import {
  ROW_HEIGHT,
  MIN_COL_WIDTH,
  PREFETCH_THRESHOLD,
  STATUS_LABEL,
  STATUS_BADGE,
} from './constants';

interface DiffTableProps {
  jobId: string;
  stats: DiffStats;
  baseFileName: string;
  targetFileName: string;
  onReset: () => void;
}

const FILTER_OPTIONS: Array<{ value: DiffStatus | ''; label: string }> = [
  { value: '', label: 'All rows' },
  { value: 'ADDED', label: 'Added' },
  { value: 'DELETED', label: 'Deleted' },
  { value: 'MODIFIED', label: 'Modified' },
  { value: 'UNCHANGED', label: 'Unchanged' },
];

export function DiffTable({ jobId, stats, baseFileName, targetFileName, onReset }: DiffTableProps) {
  const [statusFilter, setStatusFilter] = React.useState<DiffStatus | null>(null);
  const [state, actions] = useDiffResults(jobId, statusFilter);
  const { records, columns, isLoading, isFetchingMore, isFetched, hasNextPage, totalRows, error } =
    state;

  const [selectedRecord, setSelectedRecord] = useState<DiffRecord | null>(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    actions.fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, statusFilter]);

  // ── Virtualizer ─────────────────────────────────────────────────────────────
  const itemCount = records.length + (hasNextPage ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => leftScrollRef.current, // Use left pane to drive virtualizer
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
    getItemKey: (index) =>
      index < records.length
        ? `${records[index]!.status}-${records[index]!.rowIndex}-${index}`
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
  const paneMinWidth = columns.length * MIN_COL_WIDTH;
  const leftMinWidth = paneMinWidth;
  const rightMinWidth = paneMinWidth;

  // ── Synced Scrolling Refs ──────────────────────────────────────────────────
  const leftHeaderRef = useRef<HTMLDivElement>(null);
  const rightHeaderRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingLeftScroll = useRef(false);
  const isSyncingRightScroll = useRef(false);

  useEffect(() => {
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;

    if (!left || !right) return;

    const onLeftScroll = () => {
      if (!isSyncingLeftScroll.current) {
        isSyncingRightScroll.current = true;
        right.scrollTop = left.scrollTop;
      } else {
        isSyncingLeftScroll.current = false;
      }
      if (leftHeaderRef.current) {
        leftHeaderRef.current.scrollLeft = left.scrollLeft;
      }
    };

    const onRightScroll = () => {
      if (!isSyncingRightScroll.current) {
        isSyncingLeftScroll.current = true;
        left.scrollTop = right.scrollTop;
      } else {
        isSyncingRightScroll.current = false;
      }
      if (rightHeaderRef.current) {
        rightHeaderRef.current.scrollLeft = right.scrollLeft;
      }
    };

    left.addEventListener('scroll', onLeftScroll, { passive: true });
    right.addEventListener('scroll', onRightScroll, { passive: true });

    return () => {
      left.removeEventListener('scroll', onLeftScroll);
      right.removeEventListener('scroll', onRightScroll);
    };
  }, [columns.length]);
  const handleFilterChange = (value: DiffStatus | '') => {
    actions.reset();
    setStatusFilter(value === '' ? null : value);
  };

  const getBadgeIcon = (status: DiffStatus) => {
    switch (status) {
      case 'ADDED': return <Plus className="w-3 h-3" weight="bold" />;
      case 'DELETED': return <Minus className="w-3 h-3" weight="bold" />;
      case 'MODIFIED': return <PencilSimple className="w-3 h-3" weight="bold" />;
      case 'UNCHANGED': return <Check className="w-3 h-3" weight="bold" />;
    }
  };

  // ── Empty state (fetched but no rows returned) ──────────────────────────────
  const hasNoData = isFetched && !isLoading && !error && records.length === 0;

  if (hasNoData) {
    return (
      <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 select-none">
        <div className="bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl flex overflow-hidden w-full h-[calc(100vh-140px)] isolate">
          {columns.length === 0 && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
              <Table className="w-12 h-12 mb-3 opacity-20" weight="duotone" />
              <p>No valid data to display</p>
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center mx-auto">
              <Warning className="w-8 h-8 text-amber-500" weight="duotone" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No rows to display
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                The comparison completed but found no matching rows. Both files may be empty.
              </p>
            </div>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && records.length === 0) {
    return (
      <div className="flex-1 h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 select-none">
        <div className="text-center space-y-4">
          <CircleNotch className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-100 mx-auto" />
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Loading diff results…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-8 select-none">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <p className="text-rose-600 dark:text-rose-400 font-semibold text-sm">{error}</p>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 select-none">
      
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-md">
            <span className="font-mono font-bold text-xs">CSV</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              CSV Diff Viewer
            </h2>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5">
              {totalRows.toLocaleString()} rows
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {(['ADDED', 'DELETED', 'MODIFIED', 'UNCHANGED'] as DiffStatus[]).map((s) => {
              const val = stats[s.toLowerCase() as keyof DiffStats];
              return (
                <span key={s} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 bg-white dark:bg-zinc-800 ${STATUS_BADGE[s]}`}>
                  <span className="flex-shrink-0">{getBadgeIcon(s)}</span>
                  <span>{STATUS_LABEL[s]}</span>
                  <span className="font-mono text-[10px] opacity-80 bg-black/5 dark:bg-black/20 px-1 py-0.2 rounded-sm">{val.toLocaleString()}</span>
                </span>
              );
            })}
        </div>

        <div className="flex items-center gap-3.5">
          <ThemeToggle />
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-white/10 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-all duration-150">
            <Funnel className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <select
              value={statusFilter ?? ''}
              onChange={(e) =>
                handleFilterChange(e.target.value as DiffStatus | '')
              }
              className="text-xs font-semibold bg-transparent border-0 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-0 cursor-pointer pr-1 outline-none"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onReset}
            className="text-xs text-zinc-600 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl px-4 py-2.5 active:scale-95 transition-all flex items-center gap-1.5 shadow-3xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            New Diff
          </button>
        </div>
      </div>

      {/* ── Split Layout Container ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── Left Pane (Base) ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-200 dark:border-zinc-800">
          
          {columns.length > 0 && (
            <div className="flex-shrink-0 flex flex-col bg-zinc-50 dark:bg-zinc-950/50 shadow-2xs z-10 relative">
              <div className="flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-900/30 px-4 py-2 border-r dark:border-r-zinc-800">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono truncate max-w-full" title={baseFileName}>
                  {baseFileName}
                </span>
              </div>
              <div className="overflow-hidden border-b border-zinc-200 dark:border-zinc-800" ref={leftHeaderRef}>
                <div className="flex bg-zinc-50 dark:bg-zinc-950/50" style={{ width: leftMinWidth }}>
                  {columns.map((col) => (
                    <div
                      key={`base-col-${col}`}
                      style={{ width: MIN_COL_WIDTH, height: 36 }}
                      className="flex-shrink-0 flex items-center px-4 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 uppercase tracking-wider truncate bg-zinc-50 dark:bg-zinc-900 font-mono"
                      title={col}
                    >
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={leftScrollRef} className="flex-1 overflow-auto" style={{ contain: 'strict' }}>
            <div style={{ height: virtualizer.getTotalSize(), width: leftMinWidth, position: 'relative' }}>
              {virtualItems.map((virtualItem) => {
                const isLoaderRow = virtualItem.index >= records.length;
                const record = records[virtualItem.index];

                return (
                  <div key={virtualItem.key} style={{ position: 'absolute', top: virtualItem.start, left: 0, width: '100%', height: ROW_HEIGHT }}>
                    {isLoaderRow ? <LoaderRow colSpan={columns.length} /> : record ? (
                      <DiffRow record={record} columns={columns} side="base" style={{ height: ROW_HEIGHT, width: '100%' }} onClick={() => setSelectedRecord(record)} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Pane (Target) ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900">
          
          {columns.length > 0 && (
            <div className="flex-shrink-0 flex flex-col bg-zinc-50 dark:bg-zinc-950/50 shadow-2xs z-10 relative">
              <div className="flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-900/30 px-4 py-2">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono truncate max-w-full" title={targetFileName}>
                  {targetFileName}
                </span>
              </div>
              <div className="overflow-hidden border-b border-zinc-200 dark:border-zinc-800" ref={rightHeaderRef}>
                <div className="flex bg-zinc-50 dark:bg-zinc-950/50" style={{ width: rightMinWidth }}>
                  {columns.map((col) => (
                    <div
                      key={`target-col-${col}`}
                      style={{ width: MIN_COL_WIDTH, height: 36 }}
                      className="flex-shrink-0 flex items-center px-4 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 uppercase tracking-wider truncate bg-zinc-50 dark:bg-zinc-900 font-mono"
                      title={col}
                    >
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right Body */}
          <div
            ref={rightScrollRef}
            className="flex-1 overflow-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: rightMinWidth,
                position: 'relative',
              }}
            >
              {virtualItems.map((virtualItem) => {
                const isLoaderRow = virtualItem.index >= records.length;
                const record = records[virtualItem.index];

                return (
                  <div
                    key={`right-${virtualItem.key}`}
                    style={{
                      position: 'absolute',
                      top: virtualItem.start,
                      left: 0,
                      width: '100%',
                      height: ROW_HEIGHT,
                    }}
                  >
                    {isLoaderRow ? (
                      <LoaderRow colSpan={columns.length} />
                    ) : record ? (
                      <DiffRow
                        record={record}
                        columns={columns}
                        side="target"
                        style={{ height: ROW_HEIGHT, width: '100%' }}
                        onClick={() => setSelectedRecord(record)}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      {!hasNextPage && records.length > 0 && (
        <div className="flex-shrink-0 text-center text-xs text-zinc-400 py-3.5 border-t border-zinc-200 bg-white font-medium">
          All {totalRows.toLocaleString()} rows loaded
        </div>
      )}

      {/* Details Slide Drawer panel */}
      {selectedRecord && (
        <DiffDetail 
          record={selectedRecord} 
          columns={columns} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
}

// ─── Loader row (spinner at the bottom of the virtual list) ──────────────────

function LoaderRow({ colSpan }: { colSpan: number }) {
  const totalCols = colSpan * 2 + 1;
  return (
    <div
      className="flex items-center justify-center gap-2 text-xs text-zinc-400 bg-zinc-50/20 border-b border-zinc-100"
      style={{ height: ROW_HEIGHT, gridColumn: `span ${totalCols}` }}
    >
      <CircleNotch className="animate-spin h-3.5 w-3.5 text-zinc-500" />
      Loading more rows…
    </div>
  );
}
