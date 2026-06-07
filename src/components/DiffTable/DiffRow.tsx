import React from 'react';
import type { DiffRecord, CsvRow } from '../../types/diff.types';
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
}

export const DiffRow = React.memo(function DiffRow({
  record,
  columns,
  style,
}: DiffRowProps) {
  const { status, baseRow, targetRow } = record;
  const rowBg = STATUS_ROW_BG[status];

  return (
    <div
      role="row"
      style={style}
      className={`flex items-stretch border-b border-gray-100 ${rowBg} hover:brightness-[0.97] transition-[filter]`}
    >
      {/* ── Status badge ────────────────────────────────────────────────────── */}
      <div
        role="cell"
        className="flex-shrink-0 flex items-center justify-center border-r border-gray-200"
        style={{ width: STATUS_COL_WIDTH, height: ROW_HEIGHT }}
      >
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${STATUS_BADGE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* ── Base pane ───────────────────────────────────────────────────────── */}
      <Pane
        row={baseRow}
        compareRow={targetRow}
        columns={columns}
        side="base"
        status={status}
      />

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 w-px bg-gray-300 self-stretch" />

      {/* ── Target pane ─────────────────────────────────────────────────────── */}
      <Pane
        row={targetRow}
        compareRow={baseRow}
        columns={columns}
        side="target"
        status={status}
      />
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
        const isCellModified =
          status === 'MODIFIED' && value !== compareValue;

        return (
          <div
            key={col}
            role="cell"
            title={value || undefined}
            style={{ minWidth: MIN_COL_WIDTH, height: ROW_HEIGHT }}
            className={`flex-1 flex items-center px-3 text-xs text-gray-700 border-r border-gray-100 overflow-hidden truncate ${
              isEmpty ? 'opacity-0' : ''
            } ${isCellModified ? STATUS_CELL_MODIFIED : ''}`}
          >
            {isEmpty ? '' : value}
          </div>
        );
      })}
    </div>
  );
}
