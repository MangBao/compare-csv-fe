import React, { useRef, useState } from 'react';
import { 
  FileCsv, 
  CloudArrowUp, 
  X, 
  CheckCircle, 
  CircleNotch,  
  Warning,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';
import type { DiffJobResponse, DiffStats } from '../types/diff.types';

interface UploadFormProps {
  onSuccess: (jobId: string, stats: DiffStats, headers: string[], baseFileName: string, targetFileName: string) => void;
}

interface FileState {
  file: File | null;
  name: string;
  size: number | null;
}

const EMPTY_FILE: FileState = { file: null, name: '', size: null };

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [base, setBase] = useState<FileState>(EMPTY_FILE);
  const [target, setTarget] = useState<FileState>(EMPTY_FILE);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<FileState>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setter({ 
        file, 
        name: file?.name ?? '', 
        size: file?.size ?? null 
      });
    };

  const handleFileSelect = 
    (setter: React.Dispatch<React.SetStateAction<FileState>>) => 
    (file: File) => {
      setter({ 
        file, 
        name: file.name, 
        size: file.size 
      });
    };

  const handleClearFile = 
    (setter: React.Dispatch<React.SetStateAction<FileState>>, inputRef: React.RefObject<HTMLInputElement | null>) => 
    () => {
      setter(EMPTY_FILE);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!base.file || !target.file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('base', base.file);
    formData.append('target', target.file);

    const toastId = toast.loading('Comparing datasets...');

    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as DiffJobResponse & { error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      toast.success('Comparison complete!', { id: toastId });
      onSuccess(json.jobId, json.stats, json.headers ?? [], base.file.name, target.file.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const isValid = base.file !== null && target.file !== null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-dot-grid p-6 relative min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-zinc-50 dark:to-zinc-950/80" />

      <div className="relative w-full max-w-4xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
        {/* Header */}
        <div className="text-center pt-10 pb-8 px-6">
          <div className="mx-auto w-16 h-16 bg-zinc-950 dark:bg-zinc-100 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/10 dark:shadow-zinc-100/10 mb-6">
            <span className="text-white dark:text-zinc-900 font-bold text-xl font-mono tracking-tighter">
              CSV
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Compare CSV Files
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Select your reference file and the modified file to visualize the
            differences.
          </p>
        </div>

        {/* Form panel */}
        <form
          onSubmit={handleSubmit}
          className="px-8 space-y-6 pb-8"
        >
          {/* Base File DropZone */}
          <FileDropZone
            label="Base File (Reference)"
            description="The original version to compare against"
            fileState={base}
            inputRef={baseInputRef}
            onChange={handleFileChange(setBase)}
            onFileSelect={handleFileSelect(setBase)}
            onClear={handleClearFile(setBase, baseInputRef)}
            accentColor="emerald"
          />

          {/* Target File DropZone */}
          <FileDropZone
            label="Target File (Modified)"
            description="The newer version containing edits"
            fileState={target}
            inputRef={targetInputRef}
            onChange={handleFileChange(setTarget)}
            onFileSelect={handleFileSelect(setTarget)}
            onClear={handleClearFile(setTarget, targetInputRef)}
            accentColor="indigo"
          />

          {/* Primary Key Input removed */}

          {/* Error Message with Warning Icon */}
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 p-4 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-3">
              <Warning className="w-5 h-5 flex-shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" weight="fill" />
              <div>
                <p className="font-semibold">Comparison failed</p>
                <p className="mt-0.5 text-rose-600/90 dark:text-rose-400/90">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button with Tactile Hover/Active effects */}
          <button
            type="submit"
            disabled={!isValid || isUploading}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-950 dark:focus:ring-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 dark:disabled:hover:bg-zinc-100 disabled:active:scale-100 transition-all duration-150 shadow-md shadow-zinc-900/10 dark:shadow-black/20"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                Comparing datasets…
              </span>
            ) : (
              'Compare Files'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── FileDropZone Component ───────────────────────────────────────────────────

interface FileDropZoneProps {
  label: string;
  description: string;
  fileState: FileState;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  accentColor: 'emerald' | 'indigo';
}

function FileDropZone({
  label,
  description,
  fileState,
  inputRef,
  onChange,
  onFileSelect,
  onClear,
  accentColor,
}: FileDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAccentStyles = () => {
    if (accentColor === 'emerald') {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
        ring: 'focus-within:ring-emerald-500/10 dark:focus-within:ring-emerald-500/20 focus-within:border-emerald-500 dark:focus-within:border-emerald-400',
        dragActive: 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 scale-[1.01]',
        hover: 'hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10',
      };
    }
    return {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
      ring: 'focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 focus-within:border-indigo-500 dark:focus-within:border-indigo-400',
      dragActive: 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.01]',
      hover: 'hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10',
    };
  };

  const styles = getAccentStyles();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      <div
        onClick={() => {
          if (!fileState.file) inputRef.current?.click();
        }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex items-center gap-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 px-5 py-4 cursor-pointer transition-all duration-200 focus-within:ring-4 ${
          styles.ring
        } ${isDragActive ? styles.dragActive : styles.hover} ${
          fileState.file ? 'cursor-default border-zinc-200 dark:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-800/30' : ''
        }`}
      >
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg ${styles.bg}`}>
          {fileState.file ? (
            <FileCsv className="w-6 h-6" weight="duotone" />
          ) : (
            <CloudArrowUp className="w-6 h-6" />
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          {fileState.file ? (
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {fileState.name}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {formatFileSize(fileState.size)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                  Ready
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="p-1 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Drag & drop or <span className={accentColor === 'emerald' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-indigo-600 dark:text-indigo-400 font-bold'}>browse</span>
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{description}</p>
            </>
          )}
        </div>
        
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onChange}
          className="sr-only"
        />
      </div>
    </div>
  );
}
