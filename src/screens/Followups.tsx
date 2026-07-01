import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { engineFollowups } from '@/lib/vault-write';

interface FollowupEntry {
  num: number;
  company: string;
  role: string;
  urgency?: string;
  nextFollowupDate?: string;
}

export function FollowupsScreen() {
  const [entries, setEntries] = useState<FollowupEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    engineFollowups()
      .then((data: unknown) => {
        const d = data as { entries?: FollowupEntry[]; error?: string };
        if (d.error) setError(d.error);
        else setEntries(d.entries || []);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'));
  }, []);

  return (
    <>
      <h1 className="page-title">Follow-ups</h1>
      <p style={{ color: 'var(--text-muted)' }}>From followup-cadence.mjs · copy email scripts from followup packs</p>
      {error && <p className="health-error">{error}</p>}
      {entries.map(e => (
        <div key={e.num} className="card">
          <strong>{e.company}</strong> — {e.role}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Urgency: {e.urgency || '—'} · Next: {e.nextFollowupDate || '—'}
          </div>
          <Link
            to={`/script/${encodeURIComponent(`interview-prep/${e.company.toLowerCase().replace(/\s+/g, '-')}-followup.md`)}`}
            className="btn btn-sm"
            style={{ marginTop: 8 }}
          >
            Open follow-up script
          </Link>
        </div>
      ))}
    </>
  );
}
