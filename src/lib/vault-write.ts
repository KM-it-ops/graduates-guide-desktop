import { invoke } from '@tauri-apps/api/core';

export async function writeVaultFile(relPath: string, content: string): Promise<void> {
  return invoke('write_vault_file_cmd', { relPath, content });
}

export async function storeApiKey(provider: string, key: string): Promise<void> {
  return invoke('store_api_key', { provider, key });
}

export async function getApiKey(provider: string): Promise<string | null> {
  const v = await invoke<string | null>('get_api_key', { provider });
  return v;
}

export async function setCrashReports(enabled: boolean): Promise<void> {
  return invoke('set_crash_reports', { enabled });
}

export async function getCrashReports(): Promise<boolean> {
  return invoke<boolean>('get_crash_reports');
}

export async function trackerUpdateNote(num: number, notes: string): Promise<void> {
  await invoke('engine_command', {
    command: 'tracker-update-note',
    args: [String(num), notes],
  });
}

export async function engineFollowups(): Promise<unknown> {
  return invoke('engine_command', { command: 'followups', args: [] });
}
