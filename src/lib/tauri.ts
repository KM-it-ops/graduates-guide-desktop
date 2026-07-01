import { invoke } from '@tauri-apps/api/core';
import type {
  AppConfig,
  DailyResponse,
  HealthResponse,
  PackMetaResponse,
  QueueResponse,
} from './types';

export async function getConfig(): Promise<AppConfig> {
  return invoke<AppConfig>('get_config');
}

export async function setVaultPath(path: string): Promise<AppConfig> {
  return invoke<AppConfig>('set_vault_path', { path });
}

export async function pickVaultFolder(): Promise<string | null> {
  return invoke<string | null>('pick_vault_folder');
}

export async function setTheme(theme: string): Promise<AppConfig> {
  return invoke<AppConfig>('set_theme', { theme });
}

export async function engineHealth(): Promise<HealthResponse> {
  return invoke<HealthResponse>('engine_command', { command: 'health', args: [] });
}

export async function engineDaily(): Promise<DailyResponse> {
  return invoke<DailyResponse>('engine_command', { command: 'daily', args: [] });
}

export async function engineQueue(): Promise<QueueResponse> {
  return invoke<QueueResponse>('engine_command', { command: 'queue', args: [] });
}

export async function enginePackMeta(relPath: string): Promise<PackMetaResponse> {
  return invoke<PackMetaResponse>('engine_command', {
    command: 'pack-meta',
    args: [relPath],
  });
}

export async function readVaultFile(relPath: string): Promise<string> {
  return invoke<string>('read_vault_file', { relPath });
}

/** Dev fallback when running in browser without Tauri */
const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export async function engineDailyDev(vaultPath: string): Promise<DailyResponse> {
  if (isTauri()) return engineDaily();
  const res = await fetch(`/api/daily?vault=${encodeURIComponent(vaultPath)}`);
  return res.json();
}
