import React, { useRef, useState } from 'react';
import { 
  ArrowsLeftRight, 
  FileCsv, 
  CloudArrowUp, 
  X, 
  CheckCircle, 
  CircleNotch, 
  Warning 
} from '@phosphor-icons/react';
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

    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as DiffJobResponse & { error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      onSuccess(json.jobId, json.stats, json.headers ?? [], base.file.name, target.file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const isValid = base.file !== null && target.file !== null;

  return (
    <div className="min-h-screen bg-zinc-50 bg-dot-grid flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-xl transition-all duration-300">
        
        {/* Header section with brand alignment */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 text-white mb-5 shadow-lg border border-zinc-800 hover:scale-105 transition-transform duration-200">
            <ArrowsLeftRight className="w-7 h-7" weight="bold" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-none">
            CSV Diff Viewer
          </h1>
          <p className="mt-3 text-zinc-500 text-sm max-w-[40ch] mx-auto">
            Upload two CSV files to compare row by row and inspect modifications, additions, and deletions.
          </p>
        </div>

        {/* Form panel */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 shadow-xl p-8 space-y-6"
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
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-700 flex items-start gap-3">
              <Warning className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" weight="fill" />
              <div>
                <p className="font-semibold">Comparison failed</p>
                <p className="mt-0.5 text-rose-600/90">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button with Tactile Hover/Active effects */}
          <button
            type="submit"
            disabled={!isValid || isUploading}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:active:scale-100 transition-all duration-150 shadow-md shadow-zinc-900/10"
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
        bg: 'bg-emerald-50 text-emerald-600',
        ring: 'focus-within:ring-emerald-500/10 focus-within:border-emerald-500',
        dragActive: 'border-emerald-500 bg-emerald-50/50 scale-[1.01]',
        hover: 'hover:border-emerald-400 hover:bg-emerald-50/20',
      };
    }
    return {
      bg: 'bg-indigo-50 text-indigo-600',
      ring: 'focus-within:ring-indigo-500/10 focus-within:border-indigo-500',
      dragActive: 'border-indigo-500 bg-indigo-50/50 scale-[1.01]',
      hover: 'hover:border-indigo-400 hover:bg-indigo-50/20',
    };
  };

  const styles = getAccentStyles();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
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
        className={`relative flex items-center gap-4 rounded-xl border border-dashed border-zinc-200 px-5 py-4 cursor-pointer transition-all duration-200 focus-within:ring-4 ${
          styles.ring
        } ${isDragActive ? styles.dragActive : styles.hover} ${
          fileState.file ? 'cursor-default border-zinc-200 bg-zinc-50/30' : ''
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
                <p className="text-sm font-semibold text-zinc-900 truncate">
                  {fileState.name}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {formatFileSize(fileState.size)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                  Ready
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-700">
                Drag & drop or <span className={accentColor === 'emerald' ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold'}>browse</span>
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
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
