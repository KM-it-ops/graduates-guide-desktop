import { describe, expect, it } from 'vitest';
import { isApplyPack, packPrimaryPath } from './packRoutes';

describe('packRoutes', () => {
  it('detects apply packs by filename', () => {
    expect(isApplyPack('interview-prep/example-apply.md')).toBe(true);
    expect(isApplyPack('interview-prep/example-corp-outreach.md')).toBe(false);
  });

  it('routes apply packs to /apply/', () => {
    const path = 'interview-prep/example-apply.md';
    expect(packPrimaryPath(path)).toBe(`/apply/${encodeURIComponent(path)}`);
  });
});
