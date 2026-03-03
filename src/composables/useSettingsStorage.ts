/**
 * 本地持久化工具：读写 localStorage 中的设置
 */
export const STORAGE_KEY = "whatIveDone_settings";

export function loadSettings(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveSettings(patch: Record<string, any>) {
  const all = { ...loadSettings(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function load<T>(key: string, fallback: T): T {
  const v = loadSettings()[key];
  return v !== undefined ? (v as T) : fallback;
}
