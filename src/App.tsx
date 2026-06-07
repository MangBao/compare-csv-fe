import { useState } from 'react';
import { UploadForm } from './components/UploadForm';
import { DiffTable } from './components/DiffTable/DiffTable';
import type { DiffStats } from './types/diff.types';

interface DiffSession {
  jobId: string;
  stats: DiffStats;
}

export function App() {
  const [session, setSession] = useState<DiffSession | null>(null);

  const handleSuccess = (jobId: string, stats: DiffStats) => {
    setSession({ jobId, stats });
  };

  const handleReset = () => {
    setSession(null);
  };

  if (session) {
    return (
      <DiffTable
        jobId={session.jobId}
        stats={session.stats}
        onReset={handleReset}
      />
    );
  }

  return <UploadForm onSuccess={handleSuccess} />;
}
