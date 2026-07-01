export interface AppConfig {
  vault_path: string | null;
  theme: string;
  engine_version: string;
  app_version: string;
}

export interface Mission {
  priority: number;
  title: string;
  time: string;
  who: string;
  action: string;
  done: string;
  scriptPaths?: string[];
}

export interface DailyResponse {
  ok: boolean;
  date: string;
  oneThing: string;
  path: string;
  missions: Mission[];
}

export interface QueueEntry {
  num: number;
  date: string;
  company: string;
  role: string;
  score: string;
  status: string;
  notes: string;
  scoreNum: number;
  packLinks: string[];
}

export interface QueueResponse {
  ok: boolean;
  entries: QueueEntry[];
  count: number;
}

export interface PackPart {
  num: number;
  title: string;
  content?: string;
}

export interface PackMetaResponse {
  ok: boolean;
  path: string;
  name: string;
  meta: Record<string, string>;
  parts: PackPart[];
  content?: string;
  partsFull?: PackPart[];
  error?: string;
}

export interface HealthResponse {
  ok: boolean;
  vault: string;
  engine: string;
  doctor: {
    onboardingNeeded: boolean;
    missing: string[];
    warnings: string[];
  };
  verify: {
    ok: boolean;
    errors: string[];
    warnings: string[];
  };
}
