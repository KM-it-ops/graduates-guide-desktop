import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enginePackMeta } from '@/lib/tauri';
import { ScriptReaderScreen } from './ScriptReader';

export function ApplyAssistScreen() {
  const { packPath } = useParams();
  const relPath = decodeURIComponent(packPath || '');
  const [jobUrl, setJobUrl] = useState('');

  useEffect(() => {
    enginePackMeta(relPath).then(data => {
      const m = data.content?.match(/\*\*Job URL:\*\*\s*(https?:\/\/\S+)/i);
      if (m) setJobUrl(m[1]);
    });
  }, [relPath]);

  const openBrowser = () => {
    if (jobUrl) window.open(jobUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h1 className="page-title">Apply assist</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Script on the left · portal on the right · <strong>you click Submit</strong>
        </p>
        {jobUrl && (
          <button type="button" className="btn btn-primary" onClick={openBrowser}>
            Open job portal
          </button>
        )}
        <Link to={`/script/${encodeURIComponent(relPath)}`} className="btn" style={{ marginLeft: 8 }}>
          Full-width reader
        </Link>
      </div>
      <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <ScriptReaderScreen pathOverride={relPath} />
      </div>
    </div>
  );
}
