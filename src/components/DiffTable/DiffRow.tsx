import React from 'react';

import type { DiffRecord, CsvRow } from '../../types/diff.types';
import {
  STATUS_ROW_BG,
  STATUS_CELL_MODIFIED,
  MIN_COL_WIDTH,
} from './constants';

interface DiffRowProps {
  record: DiffRecord;
  columns: string[];
  style: React.CSSProperties;
  onClick?: () => void;
  side?: 'base' | 'target' | 'both';
}

export const DiffRow = React.memo(function DiffRow({
  record,
  columns,
  style,
  onClick,
  side = 'both',
}: DiffRowProps) {
  const { status, baseRow, targetRow } = record;
  const rowBg = STATUS_ROW_BG[status];

  return (
    <div
      role="row"
      onClick={onClick}
      style={style}
      className={`flex items-stretch border-b border-zinc-100 dark:border-zinc-800 ${rowBg} hover:bg-zinc-800/[0.02] dark:hover:bg-white/[0.02] active:bg-zinc-800/[0.04] dark:active:bg-white/[0.04] cursor-pointer transition-colors duration-150`}
    >
      {/* ── Base pane ───────────────────────────────────────────────────────── */}
      {(side === 'both' || side === 'base') && (
        <Pane
          row={baseRow}
          compareRow={targetRow}
          columns={columns}
          side="base"
          status={status}
        />
      )}

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      {side === 'both' && <div className="flex-shrink-0 w-px bg-zinc-200 dark:bg-zinc-800 self-stretch" />}

      {/* ── Target pane ─────────────────────────────────────────────────────── */}
      {(side === 'both' || side === 'target') && (
        <Pane
          row={targetRow}
          compareRow={baseRow}
          columns={columns}
          side="target"
          status={status}
        />
      )}
    </div>
  );
});

// ─── Single pane (base OR target) ─────────────────────────────────────────────

interface PaneProps {
  row: CsvRow | undefined;
  compareRow: CsvRow | undefined;
  columns: string[];
  side: 'base' | 'target';
  status: DiffRecord['status'];
}

function Pane({ row, compareRow, columns, side, status }: PaneProps) {
  const isEmpty =
    (side === 'base' && status === 'ADDED') ||
    (side === 'target' && status === 'DELETED');

  return (
    <div className={`flex flex-shrink-0 ${isEmpty ? 'bg-zinc-100/50 dark:bg-zinc-900/50' : ''}`} style={{ minWidth: columns.length * MIN_COL_WIDTH }}>
      {columns.map((col) => {
        const value = row?.[col] ?? '';
        const compareValue = compareRow?.[col] ?? '';
        
        // Highlight cell ONLY if it's the target side, row is MODIFIED, and value differs
        const isCellModified =
          side === 'target' && status === 'MODIFIED' && value !== compareValue;

        const isRowModified = status === 'MODIFIED';

        let bgColor = '';
        let textColor = 'text-zinc-600 dark:text-zinc-400';

        if (isCellModified) {
          bgColor = STATUS_CELL_MODIFIED;
          textColor = 'text-zinc-900 dark:text-zinc-100';
        } else if (isRowModified) {
          textColor = 'text-zinc-700 dark:text-zinc-300';
        }

        return (
          <div
            key={col}
            role="cell"
            title={value || undefined}
            className={`flex-shrink-0 flex items-center px-4 py-3 text-sm border-r border-zinc-100 dark:border-zinc-800/50 ${bgColor} ${textColor} ${isEmpty ? 'opacity-0' : ''}`}
            style={{ width: MIN_COL_WIDTH }}
          >
            <span className="truncate">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
