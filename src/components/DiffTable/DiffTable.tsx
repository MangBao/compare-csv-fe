import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  ArrowLeft, 
  Funnel, 
  CircleNotch, 
  FileCsv, 
  Plus, 
  Minus, 
  PencilSimple, 
  Check,
  Warning,
} from '@phosphor-icons/react';
import type { DiffRecord, DiffStats, DiffStatus } from '../../types/diff.types';
import { useDiffResults } from '../../hooks/useDiffResults';
import { DiffRow } from './DiffRow';
import { DiffDetail } from './DiffDetail';
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
      <div className="flex flex-col h-screen bg-zinc-50 select-none">
        {/* Toolbar */}
        <header className="flex-shrink-0 bg-white border-b border-zinc-200/80 px-6 py-4 flex items-center gap-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <FileCsv className="w-5 h-5" weight="duotone" />
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">CSV Diff Viewer</span>
          </div>
          <div className="ml-auto">
            <button
              onClick={onReset}
              className="text-xs text-zinc-600 font-semibold border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl px-4 py-2.5 active:scale-95 transition-all flex items-center gap-1.5 shadow-3xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              New Diff
            </button>
          </div>
        </header>
        {/* Empty state body */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
              <Warning className="w-8 h-8 text-amber-500" weight="duotone" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-900">
                No rows to display
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                The comparison completed but found no matching rows. Both files may be empty.
              </p>
            </div>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-zinc-900 text-white px-5 py-2.5 rounded-xl hover:bg-zinc-800 active:scale-95 transition-all shadow-md"
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
      <div className="flex-1 h-screen bg-zinc-50 flex items-center justify-center text-zinc-400 select-none">
        <div className="text-center space-y-4">
          <CircleNotch className="h-8 w-8 animate-spin text-zinc-900 mx-auto" />
          <p className="text-xs font-medium text-zinc-500">Loading diff results…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-screen bg-zinc-50 flex items-center justify-center p-8 select-none">
        <div className="text-center space-y-4 max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-xl">
          <p className="text-rose-600 font-semibold text-sm">{error}</p>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 font-semibold border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-lg active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 select-none">
      
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-white border-b border-zinc-200/80 px-6 py-4 flex items-center gap-5 flex-wrap shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <FileCsv className="w-5 h-5" weight="duotone" />
          </div>
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-zinc-900 tracking-tight block">
              CSV Diff Viewer
            </span>
            <span className="text-[10px] text-zinc-400 font-mono bg-zinc-100 rounded px-1.5 py-0.5">
              {totalRows.toLocaleString()} rows
            </span>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['ADDED', 'DELETED', 'MODIFIED', 'UNCHANGED'] as DiffStatus[]).map(
            (s) => {
              const val = stats[s.toLowerCase() as keyof DiffStats];
              return (
                <span
                  key={s}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all duration-150 bg-white shadow-3xs ${STATUS_BADGE[s]}`}
                >
                  <span className="flex-shrink-0">{getBadgeIcon(s)}</span>
                  <span>{STATUS_LABEL[s]}</span>
                  <span className="font-mono text-[10px] opacity-80 bg-black/5 px-1 py-0.2 rounded-sm">{val.toLocaleString()}</span>
                </span>
              );
            }
          )}
        </div>

        {/* Filter & Reset controls */}
        <div className="ml-auto flex items-center gap-3.5">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-400 transition-all duration-150">
            <Funnel className="w-4 h-4 text-zinc-400" />
            <select
              value={statusFilter ?? ''}
              onChange={(e) =>
                handleFilterChange(e.target.value as DiffStatus | '')
              }
              className="text-xs font-semibold bg-transparent border-0 text-zinc-700 focus:outline-none focus:ring-0 cursor-pointer pr-1"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-zinc-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onReset}
            className="text-xs text-zinc-600 font-semibold border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl px-4 py-2.5 active:scale-95 transition-all flex items-center gap-1.5 shadow-3xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            New Diff
          </button>
        </div>
      </header>

      {/* ── Split Layout Container ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── Left Pane (Base) ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-200">
          
          {/* Left Header */}
          {columns.length > 0 && (
            <div className="flex-shrink-0 flex flex-col bg-zinc-50 shadow-2xs z-10 relative">
              {/* Fixed File Name */}
              <div className="flex items-center justify-center border-b border-zinc-200 bg-zinc-100/30 px-4 py-2 border-r">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono truncate max-w-full" title={baseFileName}>
                  {baseFileName}
                </span>
              </div>
              {/* Scrollable Columns */}
              <div
                className="overflow-hidden border-b border-zinc-200"
                ref={leftHeaderRef}
              >
                <div className="flex bg-zinc-50" style={{ width: leftMinWidth }}>
                  {/* Base Columns */}
                  {columns.map((col) => (
                    <div
                      key={`base-col-${col}`}
                      style={{ width: MIN_COL_WIDTH, height: 36 }}
                      className="flex-shrink-0 flex items-center px-4 text-xs font-bold text-zinc-600 border-r border-zinc-100 truncate bg-zinc-50/50 font-mono"
                      title={col}
                    >
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Left Body */}
          <div
            ref={leftScrollRef}
            className="flex-1 overflow-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: leftMinWidth,
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
                      height: ROW_HEIGHT,
                    }}
                  >
                    {isLoaderRow ? (
                      <LoaderRow colSpan={columns.length} />
                    ) : record ? (
                      <DiffRow
                        record={record}
                        columns={columns}
                        side="base"
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

        {/* ── Right Pane (Target) ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Right Header */}
          {columns.length > 0 && (
            <div className="flex-shrink-0 flex flex-col bg-zinc-50 shadow-2xs z-10 relative">
              {/* Fixed File Name */}
              <div className="flex items-center justify-center border-b border-zinc-200 bg-zinc-100/30 px-4 py-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono truncate max-w-full" title={targetFileName}>
                  {targetFileName}
                </span>
              </div>
              {/* Scrollable Columns */}
              <div
                className="overflow-hidden border-b border-zinc-200"
                ref={rightHeaderRef}
              >
                <div className="flex bg-zinc-50" style={{ width: rightMinWidth }}>
                  {/* Target Columns */}
                  {columns.map((col) => (
                    <div
                      key={`target-col-${col}`}
                      style={{ width: MIN_COL_WIDTH, height: 36 }}
                      className="flex-shrink-0 flex items-center px-4 text-xs font-bold text-zinc-600 border-r border-zinc-100 truncate bg-zinc-50/50 font-mono"
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
