import { describe, expect, it } from 'vitest';
import { parseParts, partLabel, statusClass } from '@/lib/parts';

describe('parseParts', () => {
  const sample = `# Title

# PART 0 — Decoder

Zero knowledge section.

# PART 2 — Scripts

\`\`\`
Hello recruiter
\`\`\`
`;

  it('splits PART headers', () => {
    const parts = parseParts(sample);
    expect(parts.length).toBe(2);
    expect(parts[0].num).toBe(0);
    expect(parts[1].num).toBe(2);
  });

  it('labels cheat sheet', () => {
    expect(partLabel(5, 'Day-of')).toBe('Cheat sheet');
  });

  it('maps status classes', () => {
    expect(statusClass('Interview')).toBe('status-interview');
    expect(statusClass('Evaluated')).toBe('status-evaluated');
  });
});
