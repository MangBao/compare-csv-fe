import React, { useState } from 'react';
import { UploadForm } from './components/UploadForm';
import { DiffTable } from './components/DiffTable/DiffTable';
import { useTheme } from './hooks/useTheme';
import { Toaster } from 'sonner';
import type { DiffStats } from './types/diff.types';

interface DiffSession {
  jobId: string;
  stats: DiffStats;
  headers: string[];
  baseFileName: string;
  targetFileName: string;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-600">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-red-50 p-4 rounded overflow-auto">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [session, setSession] = useState<DiffSession | null>(null);
  const { theme } = useTheme();

  const handleSuccess = (
    jobId: string,
    stats: DiffStats,
    headers: string[],
    baseFileName: string,
    targetFileName: string,
  ) => {
    setSession({ jobId, stats, headers, baseFileName, targetFileName });
  };

  const handleReset = () => {
    setSession(null);
  };

  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" richColors theme={theme} />
      <div className="h-screen w-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 relative">
        {session ? (
          <DiffTable
            jobId={session.jobId}
            stats={session.stats}
            baseFileName={session.baseFileName}
            targetFileName={session.targetFileName}
            onReset={handleReset}
          />
        ) : (
          <UploadForm onSuccess={handleSuccess} />
        )}
      </div>
    </ErrorBoundary>
  );
}
