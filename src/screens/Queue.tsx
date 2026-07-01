import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueueRow } from '@/components/QueueRow';
import { engineQueue } from '@/lib/tauri';
import type { QueueEntry } from '@/lib/types';

export function QueueScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await engineQueue();
        if (cancelled) return;
        setEntries(data.entries);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load queue');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openPack = (path: string) => {
    navigate(`/script/${encodeURIComponent(path)}`);
  };

  if (loading) return <p>Loading queue…</p>;
  if (error) return <p className="health-error">{error}</p>;

  return (
    <>
      <h1 className="page-title">Queue</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        {entries.length} applications · click a row to open its script pack
      </p>
      <table className="queue-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Company / Role</th>
            <th>Score</th>
            <th>Status</th>
            <th>Packs</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <QueueRow key={e.num} entry={e} onOpen={openPack} />
          ))}
        </tbody>
      </table>
    </>
  );
}
