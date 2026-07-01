import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickVaultFolder, setVaultPath, engineHealth } from '@/lib/tauri';

interface Props {
  onImported: (path: string) => void;
}

export function VaultImportScreen({ onImported }: Props) {
  const navigate = useNavigate();
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const importVault = async (selected: string) => {
    setLoading(true);
    setError(null);
    setWarnings([]);
    try {
      await setVaultPath(selected);
      const health = await engineHealth();
      if (health.doctor.missing?.length) {
        setWarnings([
          `Missing files: ${health.doctor.missing.join(', ')}`,
          'You can still browse existing packs if present.',
        ]);
      }
      if (health.doctor.warnings?.length) {
        setWarnings(prev => [...prev, ...health.doctor.warnings]);
      }
      onImported(selected);
      navigate('/today');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const browse = async () => {
    const selected = await pickVaultFolder();
    if (selected) {
      setPath(selected);
      await importVault(selected);
    }
  };

  return (
    <div className="empty-state" style={{ maxWidth: 520, margin: '48px auto' }}>
      <h1 className="page-title">Import your vault</h1>
      <p>
        Point at your career-ops folder or Graduate&apos;s Guide vault. All data stays on your
        machine — no cloud, no account.
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Test fixture: your existing <code>career-ops</code> clone with{' '}
        <code>data/applications.md</code> and <code>interview-prep/</code>.
      </p>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button type="button" className="btn btn-primary" onClick={browse} disabled={loading}>
          {loading ? 'Validating…' : 'Choose folder'}
        </button>
      </div>
      {path && (
        <p style={{ fontSize: '0.8rem', marginTop: 16, wordBreak: 'break-all' }}>
          Selected: {path}
        </p>
      )}
      {warnings.map(w => (
        <p key={w} className="health-warn" style={{ fontSize: '0.85rem' }}>
          {w}
        </p>
      ))}
      {error && <p className="health-error">{error}</p>}
    </div>
  );
}
