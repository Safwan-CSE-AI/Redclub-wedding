import { useEffect, useState } from 'react';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string[]>) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...(init.body && !isForm ? { 'Content-Type': 'application/json' } : {}), ...(init.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Request failed', data.fields);
  return data as T;
}

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let off = false;
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((d) => { if (!off) { setData(d); setLoading(false); } })
      .catch((e: Error) => { if (!off) { setError(e.message); setLoading(false); } });
    return () => { off = true; };
  }, [path]);
  return { data, error, loading };
}

/* ---------- admin ---------- */
const TOKEN_KEY = 'rcw_admin_token';
export const adminToken = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t: string) => { try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear: () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await api<T>(`/admin${path}`, { ...init, headers: { Authorization: `Bearer ${adminToken.get() ?? ''}`, ...(init.headers ?? {}) } });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403) && path !== '/login') {
      adminToken.clear();
      window.location.assign('/admin/login');
    }
    throw e;
  }
}
