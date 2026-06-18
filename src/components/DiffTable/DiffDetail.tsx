import { useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  PencilSimple, 
  Check 
} from '@phosphor-icons/react';
import type { DiffRecord, DiffStatus } from '../../types/diff.types';
import { STATUS_LABEL, STATUS_BADGE } from './constants';

interface DiffDetailProps {
  record: DiffRecord | null;
  columns: string[];
  onClose: () => void;
}

export function DiffDetail({ record, columns, onClose }: DiffDetailProps) {
  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const { status, rowIndex, baseRow, targetRow } = record;

  const getStatusIcon = (rowStatus: DiffStatus) => {
    switch (rowStatus) {
      case 'ADDED':
        return <Plus className="w-3.5 h-3.5" weight="bold" />;
      case 'DELETED':
        return <Minus className="w-3.5 h-3.5" weight="bold" />;
      case 'MODIFIED':
        return <PencilSimple className="w-3.5 h-3.5" weight="bold" />;
      default:
        return <Check className="w-3.5 h-3.5" weight="bold" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-300"
      />
      
      {/* Drawer content panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col justify-between animate-slide-in select-none">
        
        {/* Drawer Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wide flex items-center gap-1 border ${STATUS_BADGE[status]}`}>
                {getStatusIcon(status)}
                {STATUS_LABEL[status]}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Row details</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="text-zinc-400 font-medium font-mono">Row:</span>
              <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">#{rowIndex}</span>
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all duration-150 active:scale-90"
            title="Close panel (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {columns.map((col) => {
            const baseValue = baseRow?.[col] ?? '';
            const targetValue = targetRow?.[col] ?? '';
            const isModified = status === 'MODIFIED' && baseValue !== targetValue;
            
            return (
              <div key={col} className="space-y-1.5 pb-4 border-b border-zinc-100 last:border-b-0 last:pb-0">
                <span className="block text-[11px] font-bold text-zinc-500 font-mono tracking-wide">
                  {col}
                </span>

                {status === 'ADDED' && (
                  <div className="rounded-lg bg-emerald-50/50 border border-emerald-100/50 px-3 py-2 text-xs font-mono text-emerald-800 break-all flex items-start gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" weight="bold" />
                    <span>{targetValue || <em className="text-emerald-400/80 not-italic">[empty]</em>}</span>
                  </div>
                )}

                {status === 'DELETED' && (
                  <div className="rounded-lg bg-rose-50/50 border border-rose-100/50 px-3 py-2 text-xs font-mono text-rose-800 break-all flex items-start gap-1.5">
                    <Minus className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" weight="bold" />
                    <span>{baseValue || <em className="text-rose-400/80 not-italic">[empty]</em>}</span>
                  </div>
                )}

                {status === 'UNCHANGED' && (
                  <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 text-xs font-mono text-zinc-700 break-all">
                    <span>{baseValue || <em className="text-zinc-400/80 not-italic">[empty]</em>}</span>
                  </div>
                )}

                {status === 'MODIFIED' && (
                  <div className="space-y-1.5">
                    {isModified ? (
                      <>
                        {/* Red comparison block for deleted parts */}
                        <div className="rounded-lg bg-rose-50/50 border border-rose-100/50 px-3 py-2 text-xs font-mono text-rose-800 break-all flex items-start gap-1.5">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider w-8 mt-0.5 flex-shrink-0">Base</span>
                          <span>{baseValue || <em className="text-rose-400/80 not-italic">[empty]</em>}</span>
                        </div>
                        {/* Green comparison block for added parts */}
                        <div className="rounded-lg bg-emerald-50/50 border border-emerald-100/50 px-3 py-2 text-xs font-mono text-emerald-800 break-all flex items-start gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider w-8 mt-0.5 flex-shrink-0">New</span>
                          <span>{targetValue || <em className="text-emerald-400/80 not-italic">[empty]</em>}</span>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 text-xs font-mono text-zinc-600 break-all flex items-start gap-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-8 mt-0.5 flex-shrink-0">Same</span>
                        <span>{baseValue || <em className="text-zinc-400/80 not-italic">[empty]</em>}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-900 rounded-lg text-xs font-semibold active:scale-95 transition-all duration-150"
          >
            Close Detail
          </button>
        </div>
      </div>
      
      {/* Inline style for keyframes animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
