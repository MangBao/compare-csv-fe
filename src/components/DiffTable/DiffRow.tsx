import React from 'react';
import { 
  Plus, 
  Minus, 
  PencilSimple, 
  Check 
} from '@phosphor-icons/react';
import type { DiffRecord, CsvRow, DiffStatus } from '../../types/diff.types';
import {
  STATUS_LABEL,
  STATUS_ROW_BG,
  STATUS_BADGE,
  STATUS_CELL_MODIFIED,
  STATUS_COL_WIDTH,
  MIN_COL_WIDTH,
  ROW_HEIGHT,
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

  const getStatusIcon = (rowStatus: DiffStatus) => {
    switch (rowStatus) {
      case 'ADDED':
        return <Plus className="w-3 h-3 flex-shrink-0 text-emerald-600" weight="bold" />;
      case 'DELETED':
        return <Minus className="w-3 h-3 flex-shrink-0 text-rose-600" weight="bold" />;
      case 'MODIFIED':
        return <PencilSimple className="w-3 h-3 flex-shrink-0 text-amber-600" weight="bold" />;
      default:
        return <Check className="w-3 h-3 flex-shrink-0 text-zinc-400" weight="bold" />;
    }
  };

  return (
    <div
      role="row"
      onClick={onClick}
      style={style}
      className={`flex items-stretch border-b border-zinc-100 ${rowBg} hover:bg-zinc-800/[0.02] active:bg-zinc-800/[0.04] cursor-pointer transition-colors duration-150`}
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
      {side === 'both' && <div className="flex-shrink-0 w-px bg-zinc-200 self-stretch" />}

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
    <div className="flex items-stretch flex-1">
      {columns.map((col) => {
        const value = row?.[col] ?? '';
        const compareValue = compareRow?.[col] ?? '';
        
        // Highlight cell ONLY if it's the target side, row is MODIFIED, and value differs
        const isCellModified =
          side === 'target' && status === 'MODIFIED' && value !== compareValue;

        return (
          <div
            key={col}
            role="cell"
            title={value || undefined}
            style={{ minWidth: MIN_COL_WIDTH, height: ROW_HEIGHT }}
            className={`flex-1 flex items-center px-4 text-xs text-zinc-700 border-r border-zinc-100 overflow-hidden truncate font-mono ${
              isEmpty ? 'opacity-0' : ''
            } ${isCellModified ? STATUS_CELL_MODIFIED : ''}`}
          >
            {isEmpty ? '' : value || <em className="text-zinc-300 not-italic">-</em>}
          </div>
        );
      })}
    </div>
  );
}
