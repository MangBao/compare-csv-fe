import React, { useRef, useState } from 'react';
import type { DiffJobResponse, DiffStats } from '../types/diff.types';

interface UploadFormProps {
  onSuccess: (jobId: string, stats: DiffStats) => void;
}

interface FileState {
  file: File | null;
  name: string;
}

const EMPTY_FILE: FileState = { file: null, name: '' };

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [base, setBase] = useState<FileState>(EMPTY_FILE);
  const [target, setTarget] = useState<FileState>(EMPTY_FILE);
  const [primaryKey, setPrimaryKey] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<FileState>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setter({ file, name: file?.name ?? '' });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!base.file || !target.file || !primaryKey.trim()) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('base', base.file);
    formData.append('target', target.file);
    formData.append('primaryKey', primaryKey.trim());

    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as DiffJobResponse & { error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      onSuccess(json.jobId, json.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const isValid = base.file !== null && target.file !== null && primaryKey.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl mb-4 shadow-lg">
            ⇄
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            CSV Diff Viewer
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Compare two CSV files and inspect the differences row by row.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5"
        >
          {/* Base file */}
          <FileDropZone
            label="Base File"
            description="The original reference file"
            fileName={base.name}
            inputRef={baseInputRef}
            onChange={handleFileChange(setBase)}
            accentColor="blue"
          />

          {/* Target file */}
          <FileDropZone
            label="Target File"
            description="The new file to compare against"
            fileName={target.name}
            inputRef={targetInputRef}
            onChange={handleFileChange(setTarget)}
            accentColor="violet"
          />

          {/* Primary key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Primary Key Column
            </label>
            <input
              type="text"
              value={primaryKey}
              onChange={(e) => setPrimaryKey(e.target.value)}
              placeholder="e.g. id, sku, email"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <p className="mt-1 text-xs text-gray-400">
              The column that uniquely identifies each row across both files.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isUploading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Comparing files…
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

// ─── FileDropZone ─────────────────────────────────────────────────────────────

interface FileDropZoneProps {
  label: string;
  description: string;
  fileName: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accentColor: 'blue' | 'violet';
}

function FileDropZone({
  label,
  description,
  fileName,
  inputRef,
  onChange,
  accentColor,
}: FileDropZoneProps) {
  const ringColor =
    accentColor === 'blue' ? 'focus-within:ring-blue-500' : 'focus-within:ring-violet-500';
  const iconBg =
    accentColor === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-violet-50 text-violet-500';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition focus-within:ring-2 ${ringColor} focus-within:border-transparent`}
      >
        <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base ${iconBg}`}>
          📄
        </span>
        <div className="min-w-0 flex-1">
          {fileName ? (
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Click to upload <span className="font-medium">.csv</span> file
              </p>
              <p className="text-xs text-gray-400">{description}</p>
            </>
          )}
        </div>
        {fileName && (
          <span className="flex-shrink-0 text-xs font-medium text-green-600 bg-green-50 rounded-full px-2 py-0.5">
            Ready
          </span>
        )}
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

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
