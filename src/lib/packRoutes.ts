export function isApplyPack(path: string): boolean {
  const base = path.split('/').pop() ?? '';
  return /apply/i.test(base);
}

export function packApplyPath(path: string): string {
  return `/apply/${encodeURIComponent(path)}`;
}

export function packScriptPath(path: string): string {
  return `/script/${encodeURIComponent(path)}`;
}

export function packPrimaryPath(path: string): string {
  return isApplyPack(path) ? packApplyPath(path) : packScriptPath(path);
}
