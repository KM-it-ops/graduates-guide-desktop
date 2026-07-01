import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickVaultFolder, setVaultPath } from '@/lib/tauri';
import { writeVaultFile } from '@/lib/vault-write';
import { CV_TEMPLATE, PROFILE_MD_TEMPLATE, PROFILE_TEMPLATE } from '@/lib/onboarding-templates';

interface Props {
  onComplete: (path: string) => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [vault, setVault] = useState('');
  const [cv, setCv] = useState(CV_TEMPLATE);
  const [profile, setProfile] = useState(PROFILE_TEMPLATE);
  const [profileMd, setProfileMd] = useState(PROFILE_MD_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFolder = async () => {
    const selected = await pickVaultFolder();
    if (selected) setVault(selected);
  };

  const finish = async () => {
    if (!vault) {
      setError('Choose a vault folder first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await setVaultPath(vault);
      await writeVaultFile('cv.md', cv);
      await writeVaultFile('config/profile.yml', profile);
      await writeVaultFile('modes/_profile.md', profileMd);
      onComplete(vault);
      navigate('/today');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 className="page-title">Welcome — set up your vault</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Step {step + 1} of 4 · files stay on your machine
      </p>

      {step === 0 && (
        <section className="card">
          <h2>Choose vault folder</h2>
          <p>Create or select an empty folder for your job hunt data.</p>
          <button type="button" className="btn btn-primary" onClick={pickFolder}>
            Choose folder
          </button>
          {vault && <p style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{vault}</p>}
          <button type="button" className="btn" style={{ marginTop: 12 }} onClick={() => setStep(1)} disabled={!vault}>
            Next
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="card">
          <div className="form-group">
            <label>CV (cv.md)</label>
            <textarea value={cv} onChange={e => setCv(e.target.value)} />
          </div>
          <button type="button" className="btn" onClick={() => setStep(0)}>Back</button>
          <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <div className="form-group">
            <label>Profile (config/profile.yml)</label>
            <textarea value={profile} onChange={e => setProfile(e.target.value)} />
          </div>
          <button type="button" className="btn" onClick={() => setStep(1)}>Back</button>
          <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
        </section>
      )}

      {step === 3 && (
        <section className="card">
          <div className="form-group">
            <label>Guide profile (modes/_profile.md)</label>
            <textarea value={profileMd} onChange={e => setProfileMd(e.target.value)} />
          </div>
          <button type="button" className="btn" onClick={() => setStep(2)}>Back</button>
          <button type="button" className="btn btn-primary" onClick={finish} disabled={loading}>
            {loading ? 'Saving…' : 'Finish setup'}
          </button>
        </section>
      )}

      {error && <p className="health-error">{error}</p>}
    </div>
  );
}
