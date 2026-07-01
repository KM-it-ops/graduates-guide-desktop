interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const cls = status.toLowerCase();
  let className = 'status-skip';
  if (cls === 'interview') className = 'status-interview';
  else if (cls === 'offer') className = 'status-offer';
  else if (cls === 'applied') className = 'status-applied';
  else if (cls === 'evaluated') className = 'status-evaluated';
  else if (cls === 'rejected') className = 'status-rejected';

  return <span className={`status-badge ${className}`}>{status}</span>;
}
