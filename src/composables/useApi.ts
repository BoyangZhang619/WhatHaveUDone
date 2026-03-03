/**
 * 共用的 API 请求工具
 */
const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

export async function api(
  path: string,
  options: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: any;
    body?: string;
  } = { method: "GET" }
) {
  const headers = options.headers ? { ...options.headers } : {};
  if (options.body && !headers["Content-Type"])
    headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(API_BASE + path, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (err: any) {
    throw { kind: "network", message: err?.message || String(err), err };
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw {
      kind: "http",
      status: res.status,
      statusText: res.statusText,
      data,
    };
  }
  return data;
}
