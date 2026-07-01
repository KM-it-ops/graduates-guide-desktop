import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getConfig,
  setTheme,
  setVaultPath,
  pickVaultFolder,
  engineHealth,
} from '@/lib/tauri';
import { getCrashReports, setCrashReports, trackerUpdateNote } from '@/lib/vault-write';
import type { HealthResponse } from '@/lib/types';

interface Props {
  vaultPath: string | null;
  onVaultChange: (path: string | null) => void;
}

export function SettingsScreen({ vaultPath, onVaultChange }: Props) {
  const navigate = useNavigate();
  const [theme, setThemeLocal] = useState('dark');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [crashReports, setCrashReportsLocal] = useState(false);
  const [trackerNum, setTrackerNum] = useState('');
  const [trackerNotes, setTrackerNotes] = useState('');

  useEffect(() => {
    getConfig().then(c => setThemeLocal(c.theme));
    getCrashReports().then(setCrashReportsLocal);
  }, []);

  const runHealth = async () => {
    setLoading(true);
    try {
      const h = await engineHealth();
      setHealth(h);
    } catch (e) {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const changeTheme = async (t: string) => {
    setThemeLocal(t);
    document.documentElement.setAttribute('data-theme', t);
    await setTheme(t);
  };

  const changeVault = async () => {
    const selected = await pickVaultFolder();
    if (selected) {
      await setVaultPath(selected);
      onVaultChange(selected);
    }
  };

  return (
    <>
      <h1 className="page-title">Settings</h1>

      <section className="settings-section">
        <h2>Vault</h2>
        <p style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
          {vaultPath || 'No vault selected'}
        </p>
        <button type="button" className="btn" onClick={changeVault} style={{ marginTop: 8 }}>
          Change vault folder
        </button>
      </section>

      <section className="settings-section">
        <h2>Appearance</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn${theme === 'dark' ? ' btn-primary' : ''}`}
            onClick={() => changeTheme('dark')}
          >
            Dark
          </button>
          <button
            type="button"
            className={`btn${theme === 'light' ? ' btn-primary' : ''}`}
            onClick={() => changeTheme('light')}
          >
            Light
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Engine health</h2>
        <button type="button" className="btn btn-primary" onClick={runHealth} disabled={loading}>
          {loading ? 'Checking…' : 'Run health check'}
        </button>
        {health && (
          <div className="card" style={{ marginTop: 16, fontSize: '0.85rem' }}>
            <p className={health.ok ? 'health-ok' : 'health-warn'}>
              {health.ok ? 'Engine OK' : 'Engine has warnings'}
            </p>
            <p>Vault: {health.vault}</p>
            <p>Engine: {health.engine}</p>
            {health.verify.errors?.length > 0 && (
              <ul>
                {health.verify.errors.map(e => (
                  <li key={e} className="health-error">
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="settings-section">
        <h2>Tracker note (existing row only)</h2>
        <div className="form-group">
          <label>Row #</label>
          <input value={trackerNum} onChange={e => setTrackerNum(e.target.value)} placeholder="12" />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input value={trackerNotes} onChange={e => setTrackerNotes(e.target.value)} />
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => trackerUpdateNote(parseInt(trackerNum, 10), trackerNotes)}
        >
          Update notes
        </button>
      </section>

      <section className="settings-section">
        <h2>Crash reports (opt-in, Phase 4)</h2>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={crashReports}
            onChange={async e => {
              setCrashReportsLocal(e.target.checked);
              await setCrashReports(e.target.checked);
            }}
          />
          Send anonymous crash reports (off by default)
        </label>
      </section>

      <section className="settings-section">
        <h2>Setup</h2>
        <button type="button" className="btn" onClick={() => navigate('/onboarding')}>
          New vault onboarding wizard
        </button>
      </section>

      <section className="settings-section">
        <h2>Privacy</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Phase 1: no network calls, no telemetry. Your vault is plain files on disk.
        </p>
      </section>
    </>
  );
}
