import { useEffect, useState } from 'react';
import { MissionCard } from '@/components/MissionCard';
import { engineDaily } from '@/lib/tauri';
import type { Mission } from '@/lib/types';

const STORAGE_KEY = 'gg-mission-checks';

function loadChecks(date: string): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${date}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecks(date: string, checks: Record<number, boolean>) {
  localStorage.setItem(`${STORAGE_KEY}-${date}`, JSON.stringify(checks));
}

export function TodayScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [oneThing, setOneThing] = useState('');
  const [date, setDate] = useState('');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [checks, setChecks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await engineDaily();
        if (cancelled) return;
        if (!data.ok) throw new Error('Daily mission failed');
        setOneThing(data.oneThing);
        setDate(data.date);
        setMissions(data.missions);
        setChecks(loadChecks(data.date));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load missions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (index: number) => {
    const next = { ...checks, [index]: !checks[index] };
    setChecks(next);
    if (date) saveChecks(date, next);
  };

  if (loading) return <p>Loading today&apos;s missions…</p>;
  if (error) return <p className="health-error">{error}</p>;

  return (
    <>
      <h1 className="page-title">Today</h1>
      <div className="hero-onething">
        <label>If you only do one thing</label>
        <p>{oneThing}</p>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
        {date} · max 5 missions · local vault only
      </p>
      {missions.map((m, i) => (
        <MissionCard
          key={`${m.priority}-${m.title}`}
          mission={m}
          index={i}
          checked={!!checks[i]}
          onToggle={() => toggle(i)}
        />
      ))}
    </>
  );
}
