import { Link } from 'react-router-dom';
import type { Mission } from '@/lib/types';

interface Props {
  mission: Mission;
  index: number;
  checked: boolean;
  onToggle: () => void;
}

export function MissionCard({ mission, index, checked, onToggle }: Props) {
  const scriptPath = mission.scriptPaths?.[0];

  return (
    <article className="card">
      <div className="card-header">
        <h3 className="card-title">
          Mission {index + 1} — {mission.title}{' '}
          <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(~{mission.time})</span>
        </h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <input type="checkbox" checked={checked} onChange={onToggle} />
          Done
        </label>
      </div>
      <dl className="meta-row">
        <dt>Who</dt>
        <dd>{mission.who}</dd>
        <dt>Action</dt>
        <dd>{mission.action.replace(/`/g, '')}</dd>
        <dt>Done when</dt>
        <dd>{mission.done}</dd>
      </dl>
      {scriptPath && (
        <Link to={`/script/${encodeURIComponent(scriptPath)}`} className="btn btn-primary btn-sm">
          Open script
        </Link>
      )}
    </article>
  );
}
