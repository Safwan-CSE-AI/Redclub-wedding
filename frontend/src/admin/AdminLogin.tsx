import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, adminToken, ApiError } from '../lib/api';
import Seo from '../components/Seo';

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await adminApi<{ accessToken: string }>('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      adminToken.set(r.accessToken);
      nav('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <Seo title="Admin sign in" noindex />
      <form onSubmit={submit} className="w-full max-w-sm" aria-label="Admin sign in">
        <h1 className="font-serif text-4xl">Admin</h1>
        <label className="label mt-8 block" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="username" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label mt-6 block" htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        <button className="btn mt-8 w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
