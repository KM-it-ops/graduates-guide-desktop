import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScriptBlock } from '@/components/ScriptBlock';
import { CopyToast } from '@/components/CopyToast';
import { enginePackMeta } from '@/lib/tauri';
import { parseParts, partLabel } from '@/lib/parts';
import type { ParsedPart } from '@/lib/parts';

function extractCopyBlocks(content: string): { label: string; text: string }[] {
  const blocks: { label: string; text: string }[] = [];
  const fenceRe = /```(?:\w*\n)?([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = fenceRe.exec(content)) !== null) {
    const text = m[1].trim();
    if (text.length > 20) {
      blocks.push({ label: `Script block ${++i}`, text });
    }
  }
  let quoteBuf: string[] = [];
  for (const line of content.split('\n')) {
    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      quoteBuf.push(q[1]);
    } else if (quoteBuf.length > 0) {
      const text = quoteBuf.join('\n').trim();
      if (text.length > 20) blocks.push({ label: `Script block ${++i}`, text });
      quoteBuf = [];
    }
  }
  if (quoteBuf.length > 0) {
    const text = quoteBuf.join('\n').trim();
    if (text.length > 20) blocks.push({ label: `Script block ${++i}`, text });
  }
  return blocks;
}

interface ScriptReaderProps {
  pathOverride?: string;
}

export function ScriptReaderScreen({ pathOverride }: ScriptReaderProps = {}) {
  const { '*': pathParam } = useParams();
  const relPath = pathOverride || decodeURIComponent(pathParam || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parts, setParts] = useState<ParsedPart[]>([]);
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [activePart, setActivePart] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await enginePackMeta(relPath);
        if (cancelled) return;
        if (!data.ok) throw new Error(data.error || 'Pack not found');
        const parsed = data.partsFull?.length
          ? data.partsFull.map(p => ({ num: p.num, title: p.title, content: p.content || '' }))
          : parseParts(data.content || '');
        setParts(parsed);
        setMeta(data.meta || {});
        const cheat = parsed.find(p => p.num === 5);
        setActivePart(cheat?.num ?? parsed[0]?.num ?? 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load pack');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [relPath]);

  const active = parts.find(p => p.num === activePart) ?? parts[0];
  const copyBlocks = useMemo(
    () => (active && active.num >= 2 ? extractCopyBlocks(active.content) : []),
    [active],
  );

  const showCopied = () => {
    setToast('Copied to clipboard');
    setTimeout(() => setToast(''), 2000);
  };

  if (loading) return <p>Loading script…</p>;
  if (error) return <p className="health-error">{error}</p>;

  return (
    <>
      <Link to="/today" style={{ fontSize: '0.85rem' }}>
        ← Back to Today
      </Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {meta.company || relPath.split('/').pop()?.replace('.md', '')}
      </h1>
      {meta.role && <p style={{ color: 'var(--text-muted)' }}>{meta.role}</p>}
      {meta.dialIn && (
        <div className="card" style={{ borderColor: 'var(--warning)' }}>
          <strong>Dial-in:</strong> {meta.dialIn}
        </div>
      )}

      <nav className="part-tabs" aria-label="Script parts">
        {parts.map(p => (
          <button
            key={p.num}
            type="button"
            className={`part-tab${p.num === activePart ? ' active' : ''}${p.num === 5 ? ' cheat-sheet' : ''}`}
            onClick={() => setActivePart(p.num)}
          >
            {partLabel(p.num, p.title)}
          </button>
        ))}
      </nav>

      {active && (
        <article className="markdown-body">
          <h2>{partLabel(active.num, active.title)}</h2>
          {copyBlocks.map((b, idx) => (
            <ScriptBlock key={idx} text={b.text} label={b.label} onCopied={showCopied} />
          ))}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.content}</ReactMarkdown>
        </article>
      )}
      <CopyToast message={toast} />
    </>
  );
}
