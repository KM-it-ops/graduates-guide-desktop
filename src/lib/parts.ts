/** Parse script pack markdown into Part sections (0–6). */
export interface ParsedPart {
  num: number;
  title: string;
  content: string;
}

export function parseParts(content: string): ParsedPart[] {
  const lines = content.split('\n');
  const parts: ParsedPart[] = [];
  let current: ParsedPart | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) {
      parts.push({
        ...current,
        content: buffer.join('\n').trim(),
      });
    }
  };

  for (const line of lines) {
    const m = line.match(/^(#{1,2})\s*(?:PART|Part)\s+(\d+)\s*[—–-]?\s*(.*)$/i);
    if (m) {
      flush();
      current = {
        num: parseInt(m[2], 10),
        title: m[3]?.trim() || `Part ${m[2]}`,
        content: '',
      };
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();

  if (parts.length === 0) {
    return [{ num: 0, title: 'Document', content: content.trim() }];
  }

  return parts.sort((a, b) => a.num - b.num);
}

export function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'interview') return 'status-interview';
  if (s === 'offer') return 'status-offer';
  if (s === 'applied') return 'status-applied';
  if (s === 'evaluated') return 'status-evaluated';
  if (s === 'skip') return 'status-skip';
  if (s === 'rejected') return 'status-rejected';
  return 'status-skip';
}

export function partLabel(num: number, _title?: string): string {
  if (num === 5) return 'Cheat sheet';
  if (num === 0) return 'Decoder';
  return `Part ${num}`;
}
