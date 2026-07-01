import { statusClass } from '@/lib/parts';
import type { QueueEntry } from '@/lib/types';

interface Props {
  entry: QueueEntry;
  onOpen: (path: string) => void;
}

export function QueueRow({ entry, onOpen }: Props) {
  const primaryPack = entry.packLinks[0];

  return (
    <tr onClick={() => primaryPack && onOpen(primaryPack)} title={primaryPack ? 'Open script pack' : undefined}>
      <td>{entry.num}</td>
      <td>
        <strong>{entry.company}</strong>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{entry.role}</div>
      </td>
      <td>{entry.score}</td>
      <td>
        <span className={`status-badge ${statusClass(entry.status)}`}>{entry.status}</span>
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        {entry.packLinks.length > 0 ? `${entry.packLinks.length} pack(s)` : '—'}
      </td>
    </tr>
  );
}
