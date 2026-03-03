/**
 * 通用工具函数
 */

export function formatDate(v: any) {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return String(v);
  }
}

export function toDatetimeLocal(date: any) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function clampInt(v: any, min: number, max: number, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function safeErr(e: any): string {
  try {
    if (typeof e === "string") return e;
    if (e?.message) return e.message;
    return JSON.stringify(e);
  } catch {
    return "unknown error";
  }
}

export function normalizeInt(v: string | number | null | undefined, fallback = 0) {
  const n = Number(v);
  if (!Number.isFinite(n) || [NaN, null, undefined].includes(n as any)) return fallback;
  return n;
}

export const safeJSON = (v: any, fallback: any[] = []) => {
  if (Array.isArray(v)) return v;
  if (!v || typeof v !== "string") return fallback;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

export const tagList = (p: any) => safeJSON(p.tags, []);
export const todoList = (p: any) => safeJSON(p.todos, []);
