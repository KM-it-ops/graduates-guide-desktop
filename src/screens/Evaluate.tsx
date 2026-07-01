import { useEffect, useState } from 'react';
import { storeApiKey, getApiKey } from '@/lib/vault-write';

export function EvaluateScreen() {
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getApiKey(provider).then(k => setSaved(!!k));
  }, [provider]);

  const saveKey = async () => {
    await storeApiKey(provider, apiKey);
    setSaved(true);
    setApiKey('');
  };

  const evaluate = () => {
    setMessage(
      'Evaluate spawns the career-ops auto-pipeline with your BYOK key. Phase 2 wires headless worker; for now open Cursor/CLI against the same vault and paste the URL. Key is stored in OS keychain only — never in vault files.',
    );
  };

  return (
    <>
      <h1 className="page-title">Evaluate offer</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        Paste a job URL. You review the report before applying. <strong>You click Send.</strong>
      </p>

      <section className="card">
        <div className="form-group">
          <label>Job URL</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <button type="button" className="btn btn-primary" onClick={evaluate} disabled={!url}>
          Evaluate (BYOK)
        </button>
        {message && <p style={{ marginTop: 16, fontSize: '0.9rem' }}>{message}</p>}
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: '1rem' }}>API key (optional, OS keychain)</h2>
        <div className="form-group">
          <label>Provider</label>
          <select value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <div className="form-group">
          <label>API key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={saved ? 'Key saved — enter to replace' : 'sk-...'}
          />
        </div>
        <button type="button" className="btn" onClick={saveKey} disabled={!apiKey}>
          Save to keychain
        </button>
      </section>
    </>
  );
}
